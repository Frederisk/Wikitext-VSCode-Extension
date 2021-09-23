/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import type Bluebird from 'bluebird';
import type MWBot from 'mwbot';
import { Action, Prop, RvProp, alterNativeValues } from './args';
import { ReadPageConvert, ReadPageResult, Main, Revision, Jump, Page } from '../../interface_definition/readPageInterface';
import { OldTokensConvert, OldTokensResult } from '../../interface_definition/oldTokensInterface';
import { bot, getBot } from './bot';
import { TokensConvert, TokensResult } from '../../interface_definition/tokensInterface';
import { showMWErrorMessage } from './errmsg';

interface ContentInfo {
    content: string;
    info?: Record<string, string | undefined>;
}

/**
 * Write/Post Page
 */
export async function postPage(): Promise<void> {
    async function getEditToken(bot: MWBot): Promise<string> {
        const errors: unknown[] = [undefined, undefined];
        try {
            const args: Record<string, string> = {
                action: Action.query,
                meta: 'tokens',
                type: 'csrf'
            };
            const result: Bluebird<unknown> = await bot.request(args);
            const reNew: TokensResult = TokensConvert.toTokensResult(result);
            const token: string | undefined = reNew.query?.tokens?.csrftoken;
            if (token) {
                return token;
            }
        }
        catch (error) {
            errors[0] = error;
        }
        if (errors[0] !== undefined) {
            try {
                const args: Record<string, string> = {
                    action: "tokens",
                    type: "edit"
                };
                const result = await bot.request(args);
                const reOld: OldTokensResult = OldTokensConvert.toOldTokensResult(result);
                const token: string | undefined = reOld.tokens?.edittoken;
                if (token) {
                    return token;
                }
            }
            catch (error) {
                errors[1] = error;
            }
        }

        const error = Error('Could not get edit token:' +
            'NEW: ' + ((errors[0] instanceof Error) ? errors[0].message : "") +
            'OLD: ' + ((errors[1] instanceof Error) ? errors[1].message : ""));
        throw error;
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

    const contentInfo: ContentInfo = getContentInfo(wikiContent);
    console.log(contentInfo);

    const wikiTitle: string | undefined = await vscode.window.showInputBox({
        value: contentInfo.info?.pageTitle || "",
        ignoreFocusOut: true,
        prompt: "Enter the page name here."
    });
    if (!wikiTitle) {
        return undefined;
    }
    let wikiSummary: string | undefined = await vscode.window.showInputBox({
        ignoreFocusOut: false,
        prompt: 'Enter the summary of this edit action.',
        placeHolder: '// Edit via Wikitext Extension for VSCode'
    });
    if(wikiSummary === undefined){
        return undefined;
    }
    wikiSummary = (wikiSummary + ' // Edit via Wikitext Extension for VSCode').trim();

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
    catch (error) {
        showMWErrorMessage('postPage', error, `Your Token: ${bot?.editToken}`);
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
        action: Action.query,
        prop: Prop.reVisions,
        rvprop: alterNativeValues(RvProp.content, RvProp.ids),
        rvslots: "*",
        titles: title
    };
    if (config.get("redirects")) {
        args['redirects'] = "true";
    }

    getPageCode(args, tbot);
}

type PageInfo = "pageTitle" | "pageID" | "revisionID" | "contentModel" | "contentFormat";

export async function getPageCode(args: Record<string, string>, tbot: MWBot): Promise<void> {
    function getInfoHead(info: Record<PageInfo, string | undefined>): string {
        const commentList: Record<string, [string, string]> = {
            wikitext: ["", ""],
            jsonc: ["/*", "*/"],
            lua: ["--[=[", "--]=]"],
            javascript: ["/*", "*/"],
            css: ["/*", "*/"],
            php: ["/*", "*/"],
            'flow-board': ["/*", "*/"],
        };
        const headInfo: Record<string, string | undefined> = {
            comment: "Please do not remove this struct. It's record contains some important information of edit. This struct will be removed automatically after you push edits.",
            ...info
        };
        const infoLine: string = Object.keys(headInfo).
            map((key: string) => `    ${key} = #${headInfo[key]}#`).
            join("\r");
        return commentList[info?.['contentModel'] || "wikitext"].join(`<%-- [PAGE_INFO]
${infoLine}
[END_PAGE_INFO] --%>`);
    }

    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Getting code...");
    try {
        // get request result
        const result = await tbot.request(args);
        // console.log(result);
        // Convert result as class
        const re: ReadPageResult = ReadPageConvert.toReadPageResult(result);
        if (re.query?.interwiki) {
            vscode.window.showWarningMessage(
                `Interwiki page "${re.query.interwiki[0].title}" in space "${re.query.interwiki[0].iw}" are currently not supported. Please try to modify host.`
            );
        }

        // get first page
        const page: Page| undefined = re.query?.pages?.[Object.keys(re.query.pages)[0]];
        // need a page elements
        if (!page) { return undefined; }

        if (page.missing !== undefined || page.invalid !== undefined) {
            vscode.window.showWarningMessage(
                `The page "${page.title}" you are looking for does not exist. ${page.invalidreason ?? ""}`);
            return undefined;
        }
        // first revision
        const revision: Revision| undefined = page.revisions?.[0];

        const content: Main | Revision | undefined = revision?.slots?.main || revision;

        const info: Record<PageInfo, string | undefined> = {
            pageTitle: page.title,
            pageID: page.pageid?.toString(),
            revisionID: revision?.revid?.toString(),
            contentModel: content?.contentmodel,
            contentFormat: content?.contentformat
        };
        const infoHead: string = getInfoHead(info);
        const textDocument: vscode.TextDocument = await vscode.workspace.openTextDocument({
            language: (content?.contentmodel === "flow-board") ? "jsonc" : content?.contentmodel,
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
    catch (error) {
        showMWErrorMessage('getPageCode', error);
    }
    finally {
        barMessage.dispose();
    }
}

// TODO: uploadFile, deletedPage

export function getContentInfo(content: string): ContentInfo {
    const info: string | undefined = content.match(
        /(?<=<%--\s*\[PAGE_INFO\])[\s\S]*?(?=\[END_PAGE_INFO\]\s*--%>)/
        )?.[0];

    let pageInfo: Record<PageInfo, string | undefined> | undefined;
    if (info) {
        const getInfo = (infoName: PageInfo): string | undefined => {
            const nameFirst: string = infoName[0];
            const nameRest: string = infoName.substring(1);
            const reg = new RegExp(`(?<=[${nameFirst.toLowerCase()}${nameFirst.toUpperCase()}]${nameRest}\\s*=\\s*#).*?(?=#)`);
            return info.match(reg)?.[0];
        };
        pageInfo = {
            pageTitle: getInfo("pageTitle"),
            pageID: getInfo("pageID"),
            revisionID: getInfo("revisionID"),
            contentModel: getInfo("contentModel"),
            contentFormat: getInfo("contentFormat")
        };

        content = content.replace(/\s*(?:\/\*|--\[=\[)?<%--\s*\[PAGE_INFO\][\s\S]*?\[END_PAGE_INFO\]\s*--%>\s*(?:\*\/|--\]=\])?/, '');
    }

    return { content: content, info: pageInfo };
}
