/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import type Bluebird from 'bluebird';
import type MWBot from 'mwbot';
import { Action, Prop, RvProp, alterNativeValues } from './args';
import { ReadPageConvert, ReadPageResult, Main, Revision, Jump } from '../../interface_definition/readPageInterface';
import { OldTokensConvert, OldTokensResult } from '../../interface_definition/oldTokensInterface';
import { bot, getBot } from './bot';
import { TokensConvert, TokensResult } from '../../interface_definition/tokensInteface';

/**
 * Write/Post Page
 */
export async function postPage(): Promise<void> {
    async function getEditToken(bot: MWBot): Promise<string> {
        console.log("try get token.");
        let args: Record<string, string>;
        let result: Bluebird<any>;
        let token: string | undefined;
        let errors: any[] = [undefined, undefined];

        try {
            args = {
                'action': Action.query,
                'meta': 'tokens',
                'type': 'csrf'
            };
            result = await bot.request(args);
            const reNew: TokensResult = TokensConvert.toTokensResult(result);
            token = reNew.query?.tokens?.csrftoken;
            if (token) {
                return token;
            }
        }
        catch (error) {
            console.log(error);
            errors[0] = error;
        }
        if (errors[0] !== undefined) {
            try {
                args = {
                    'action': "tokens",
                    'type': "edit"
                };
                result = await bot.request(args);
                const reOld: OldTokensResult = OldTokensConvert.toOldTokensResult(result);
                token = reOld.tokens?.edittoken;
                if (token) {
                    return token;
                }
            }
            catch (error) {
                console.log(error);
                errors[1] = error;
            }
        }

        throw new Error(`Could not get edit token: NEW: ${errors[0].name}; OLD: ${errors[1].name}`);
    }

    if (bot === undefined) {
        vscode.window.showWarningMessage("You are not logged in. Please log in and try again.");
        return undefined;
    }

    const wikiContent: string | undefined = vscode.window.activeTextEditor?.document.getText();
    if (wikiContent === undefined) {
        vscode.window.showWarningMessage("There is no active text editor.");
        return undefined;
    }

    const contentInfo: IContentInfo = getContentInfo(wikiContent);
    console.log(contentInfo);

    const wikiTitle: string | undefined = await vscode.window.showInputBox({
        value: contentInfo.info?.pageTitle || "",
        ignoreFocusOut: true,
        prompt: "Enter the page name here."
    });
    if (!wikiTitle) {
        vscode.window.showWarningMessage("Empty Title, Post failed.");
        return undefined;
    }
    const wikiSummary: string | undefined = await vscode.window.showInputBox({
        value: "",
        ignoreFocusOut: false,
        prompt: "Enter the summary of this edit action.",
        placeHolder: " // Edit via Wikitext Extension for VSCode"
    }) + " // Edit via Wikitext Extension for VSCode";

    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Posting...");
    try {
        bot.editToken = await getEditToken(bot);
        await bot.edit(wikiTitle, contentInfo.content, wikiSummary).then(response => {
            if (response.edit.nochange !== undefined) {
                vscode.window.showWarningMessage(
                    `No changes have occurred: "${response.edit.nochange}", Edit page "${response.edit.title}" (Page ID: "${response.edit.pageid}") action status is "${response.edit.result}" with Content Model "${response.edit.contentmodel}". Watched by: "${response.edit.watched}".`
                );
            }
            else {
                vscode.window.showInformationMessage(
                    `Edit page "${response.edit.title}" (Page ID: "${response.edit.pageid}") action status is "${response.edit.result}" with Content Model "${response.edit.contentmodel}" (Version: "${response.edit.oldrevid}" => "${response.edit.newrevid}", Time: "${response.edit.newtimestamp}"). Watched by: "${response.edit.watched}".`
                );
            }
        });
    }
    catch (error: any) {
        console.log(error);
        vscode.window.showErrorMessage(`Error:${error.name}, ${error.message}. Your Token: ${bot?.editToken}`);
    }
    finally {
        barMessage.dispose();
    }
}

/**
 * Read/Pull Page
 */
export async function pullPage(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    // constructing
    const tbot: MWBot | undefined = await getBot();
    if (tbot === undefined) { return undefined; }

    // get title name
    const title: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here.",
        ignoreFocusOut: true
    });
    // if title is null or empty, do nothing
    if (!title) { return undefined; }

    const args: Record<string, string> = {
        'action': Action.query,
        'prop': Prop.reVisions,
        'rvprop': alterNativeValues(RvProp.content, RvProp.ids),
        'rvslots': "*",
        'titles': title
    };
    if (config.get("redirects")) {
        args['redirects'] = "true";
    }

    getPageCode(args, tbot);
}

export async function getPageCode(args: Record<string, string>, tbot: MWBot): Promise<void> {
    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Getting code...");
    try {
        // get request result
        const result = await tbot.request(args);
        console.log(result);
        // Conver result as class
        const re: ReadPageResult = ReadPageConvert.toReadPageResult(result);
        if (re.query?.interwiki) {
            vscode.window.showWarningMessage(
                `Interwiki page "${re.query.interwiki[0].title}" in space "${re.query.interwiki[0].iw}" are currently not supported. Please try to modify host.`
            );
        }

        // get first page
        const page = re.query?.pages?.[Object.keys(re.query.pages)[0]];
        // need a page elements
        if (!page) { return undefined; }

        if (page.missing !== undefined || page.invalid !== undefined) {
            vscode.window.showWarningMessage(
                `The page "${page.title}" you are looking for does not exist.` +
                page.invalidreason || "");
            return undefined;
        }
        // first revision
        const revision = page.revisions?.[0];

        const content: Main | Revision | undefined = revision?.slots?.main || revision;

        const infoHead: string =
            `<%-- [PAGE_INFO]
Comment=#Please do not remove this struct. It's record contains some important informations of edit. This struct will be removed automatically after you push edits.#
${InfoType.pageTitle}=#${page.title}#
${InfoType.pageID}=#${page.pageid}#
${InfoType.revisionID}=#${revision?.revid}#
${InfoType.contentModel}=#${content?.contentmodel}#
${InfoType.contentFormat}=#${content?.contentformat}#
[END_PAGE_INFO] --%>`;
        const lang: string | undefined = content?.contentmodel === "flow-board" ? "jsonc" : content?.contentmodel;
        const textDocument = await vscode.workspace.openTextDocument({
            language: lang,
            content: infoHead + "\r\r" + content?.["*"]
        });
        vscode.window.showTextDocument(textDocument);

        const normalized: Jump | undefined = re.query?.normalized?.[0];
        const redirects: Jump | undefined = re.query?.redirects?.[0];

        vscode.window.showInformationMessage(
            `Opened page "${page.title}" with Model ${content?.contentmodel}.` +
            (normalized ? ` Normalized: ${normalized.from} => ${normalized.to}` : "") +
            (redirects ? ` Redirect: ${redirects.from} => ${redirects.to}` : "")
        );
    }
    catch (error: any) {
        vscode.window.showErrorMessage(`${error.code}! ${error.info}`);
    }
    finally {
        barMessage.dispose();
    }
}

// TODO: uploadFile, deletedPage

/**
 *
 */
export enum InfoType {
    pageTitle = "PageTitle",
    pageID = "PageID",
    revisionID = "RevisionID",
    contentModel = "ContentModel",
    contentFormat = "ContentFormat"
}

interface IContentInfo {
    content: string;
    info?: Record<string, string | undefined>;
}

export function getContentInfo(content: string): IContentInfo {
    const info: string | undefined = content.match(/(?<=\<%\-\-\s*\[PAGE_INFO\])[\s\S]*?(?=\[END_PAGE_INFO\]\s*\-\-%\>)/)?.[0];

    let pageInfo: Record<string, string | undefined> | undefined;
    if (info) {
        content = content.replace(/\<%\-\-\s*\[PAGE_INFO\][\s\S]*?\[END_PAGE_INFO\]\s*\-\-%\>\s*/, "");
        const getInfo = (infoName: string): string | undefined => {
            const reg = new RegExp(`(?<=${infoName}\\s*=\\s*#).*?(?=#)`);
            return info.match(reg)?.[0];
        };
        pageInfo = {
            pageTitle: getInfo(InfoType.pageTitle),
            pageID: getInfo(InfoType.pageID),
            revisionID: getInfo(InfoType.revisionID),
            contentModel: getInfo(InfoType.contentModel),
            contentFormat: getInfo(InfoType.contentFormat)
        };
    }

    return { content: content, info: pageInfo };
}
