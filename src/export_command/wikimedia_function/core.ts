/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as mwbot from 'mwbot';
import * as vscode from 'vscode';
import { action, prop, rvprop, alterNativeValues } from './args';
import { getHost } from '../host_function/host';
import { ReadPageConvert, ReadPageResult, Main } from '../../interface_definition/readPageInterface';
import { bot } from './bot';

export enum InfoType {
    PageTitle = "PageTitle",
    PageID = "PageID",
    RevisionID = "RevisionID",
    ContentModel = "ContentModel",
    ContentFormat = "ContentFormat"
}

export interface IPageInfos {
    [key: string]: string | undefined;
}

export function getContentInfo(content: string): { content: string, info: IPageInfos | null } {
    const info: string | undefined = content.match(/(?<=\<%\-\-\s*\[PAGE_INFO\])[\s\S]*?(?=\[END_PAGE_INFO\]\s*\-\-%\>)/)?.[0];

    let pageInfo: IPageInfos | null = null;
    if (info) {
        content = content.replace(/\<%\-\-\s*\[PAGE_INFO\][\s\S]*?\[END_PAGE_INFO\]\s*\-\-%\>\s*/, "");
        const foo = (infoName: string): string | undefined => {
            const reg = new RegExp(`(?<=${infoName}\\s*=\\s*#).*?(?=#)`);
            return info.match(reg)?.[0];
        };
        pageInfo = {
            PageTitle: foo(InfoType.PageTitle),
            PageID: foo(InfoType.PageID),
            RevisionID: foo(InfoType.RevisionID),
            ContentModel: foo(InfoType.ContentModel),
            ContentFormat: foo(InfoType.ContentFormat)
        };
    }

    return { content: content, info: pageInfo };
}

/**
 * Write/Post Page
 */
export async function writePage(): Promise<void> {
    if (bot === undefined) {
        vscode.window.showWarningMessage("You are not logged in. Please log in and try again.");
        return undefined;
    }

    let wikiContent: string | undefined = vscode.window.activeTextEditor?.document.getText();
    if (wikiContent === undefined) {
        vscode.window.showWarningMessage("There is no active text editor.");
        return undefined;
    }

    const contentInfo: { content: string, info: IPageInfos | null } = getContentInfo(wikiContent);

    console.log(contentInfo);

    const wikiTitle: string | undefined = await vscode.window.showInputBox({
        value: contentInfo.info?.[InfoType.PageTitle] || "",
        ignoreFocusOut: true,
        prompt: "Enter the page name here."
    });
    if (!wikiTitle) {
        vscode.window.showWarningMessage("Empty Title, Post failed.");
        return undefined;
    }

    let wikiSummary: string | undefined = await vscode.window.showInputBox({
        value: "",
        ignoreFocusOut: false,
        prompt: "Enter the summary of this edit action."
    }) + " // Edit via Wikitext Extension for VSCode";

    try {
        await bot.getEditToken().then((response: any) => {
            vscode.window.showInformationMessage(
                `Get edit token status is "${response.result}". User "${response.lgusername}" (User ID: "${response.lguserid}") got the token: "${response.token}" and csrftoken: "${response.csrftoken}".`
            );
        });

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
        vscode.window.showErrorMessage(`$Error:{err.name}. Your Token: ${bot?.editToken}`);
    }
}

/**
 * Read/Pull Page
 */
export async function readPage(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    // constructing
    let tbot: MWBot;
    if (bot) {
        tbot = bot;
    }
    else {
        // get host
        const host: string | undefined = await getHost();
        if (!host) { return undefined; }
        tbot = new mwbot({
            apiUrl: "https://" + host + config.get("apiPath")
        });
    }

    // get title name
    const title: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here.",
        ignoreFocusOut: true
    });
    // if title is null or empty, do nothing
    if (!title) { return undefined; }

    const args: any = {
        'action': action.query,
        'prop': prop.reVisions,
        'rvprop': alterNativeValues(rvprop.content, rvprop.ids),
        'rvslots': "*",
        'titles': title
    };
    if (config.get("redirects")) {
        args['redirects'] = "true";
    }

    try {
        // get request result
        const result = await tbot.request(args);
        // Conver result as class
        const re: ReadPageResult = ReadPageConvert.toReadPageResult(result);
        if (re.query?.interwiki) {
            vscode.window.showWarningMessage(
                `Interwiki page "${re.query.interwiki[0].title}" in space "${re.query.interwiki[0].iw}" are currently not supported. Please try to modify host.`
            );
        }

        // need a page elements
        if (!re.query?.pages) { return undefined; }
        // get first page
        const page = re.query.pages[Object.keys(re.query.pages)[0]];

        if (page.missing !== undefined || page.invalid !== undefined) {
            vscode.window.showWarningMessage(
                `The page "${page.title}" you are looking for does not exist.` +
                page.invalidreason || ``);
            return undefined;
        }
        // first revision
        const revision = page.revisions?.[0];

        vscode.window.showInformationMessage(
            `Opened page "${page.title}" with Model ${revision?.slots?.main?.contentmodel}.` +
            (re.query.normalized ? ` Normalized: "${re.query.normalized[0].from}" => "${re.query.normalized[0].to}".` : "") +
            (re.query.redirects ? ` Redirect: "${re.query.redirects[0].from}" => "${re.query.redirects[0].to}"` : "")
        );

        const slotsMain: Main | undefined = revision?.slots?.main;

        const infoHead: string =
            "<%-- [PAGE_INFO]\r" +
            `Comment=#Please do not remove this struct. It's record contains some important informations of edit. This struct will be removed automatically after you push edits.#\r` +
            `${InfoType.PageTitle}=#${page.title}#\r` +
            `${InfoType.PageID}=#${page.pageid}#\r` +
            `${InfoType.RevisionID}=#${revision?.revid}#\r` +
            `${InfoType.ContentModel}=#${slotsMain?.contentmodel}#\r` +
            `${InfoType.ContentFormat}=#${slotsMain?.contentformat}#\r` +
            "[END_PAGE_INFO] --%>";

        await vscode.workspace.openTextDocument({
            language: revision?.slots?.main?.contentmodel,
            content: infoHead + "\r\r" + revision?.slots?.main?.empty
        });
    }
    catch (error) {
        vscode.window.showErrorMessage(`${error.code}! ${error.info}`);
    }
}

// export function uploadFile(): void {

// }

// export function deletedPage(): void {

// }
