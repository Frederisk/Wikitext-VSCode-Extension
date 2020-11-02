/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as mwbot from 'mwbot';
import * as vscode from 'vscode';
import { action, prop, rvprop, alterNativeValues } from './args';
import { getHost } from '../host_function/host';
import { ReadPageConvert, ReadPageResult } from '../../interface_definition/readPageInterface';
import { GetViewResult, GetViewConvert } from '../../interface_definition/getViewInterface';
import { bot } from './bot';

/**
 * Write/Post Page
 */
export async function writePage(): Promise<void> {
    if (bot === null) {
        vscode.window.showWarningMessage("You are not logged in. Please log in and try again.");
        return undefined;
    }

    const wikiContent: string | undefined = vscode.window.activeTextEditor?.document.getText();
    if (wikiContent === undefined) {
        vscode.window.showWarningMessage("There is no active text editor.");
        return undefined;
    }

    const wikiTitle: string | undefined = await vscode.window.showInputBox({
        value: "",
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
    });
    wikiSummary += " // Edit via Wikitext Extension for VSCode";

    await bot.getEditToken().then((response: any) => {
        vscode.window.showInformationMessage(
            `Get edit token status is "${response.result}". User "${response.lgusername}" (User ID: "${response.lguserid}") got the token: "${response.token}" and csrftoken: "${response.csrftoken}".`
        );
    }).catch((err: Error) => {
        vscode.window.showErrorMessage(err.name);
    });

    await bot.edit(wikiTitle, wikiContent, wikiSummary).then(response => {
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
    }).catch((err: Error) => {
        vscode.window.showErrorMessage(err.name);
    });
}

/**
 * Read/Pull Page
 */
export async function readPage(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const host: string | undefined = await getHost();
    if (!host) { return undefined; }
    const title: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here.",
        ignoreFocusOut: true
    });
    if (!title) { return undefined; }

    const tbot: MWBot = bot ?? new mwbot({
        apiUrl: "https://" + host + config.get("apiPath")
    });

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
        const result = await tbot.request(args);
        // Conver result as class
        const re: ReadPageResult = ReadPageConvert.toReadPageResult(result);
        if (re.query?.interwiki) {
            vscode.window.showWarningMessage(
                `Interwiki page "${re.query.interwiki[0].title}" in space "${re.query.interwiki[0].iw}" are currently not supported. Please try to modify host.`
            );
        }

        // need page
        if (!re.query?.pages) { return undefined; }

        const page = re.query.pages[Object.keys(re.query.pages)[0]];

        if (page.missing !== undefined || page.invalid !== undefined) {
            vscode.window.showWarningMessage(
                `The page "${page.title}" you are looking for does not exist.` +
                page.invalidreason || ``);
            return undefined;
        }

        const revision = page.revisions?.[0];

        vscode.window.showInformationMessage(
            `Opened page "${page.title}" with Model ${revision?.slots?.main?.contentmodel}.` +
            (re.query.normalized ? ` Normalized: "${re.query.normalized[0].from}" => "${re.query.normalized[0].to}".` : ``) +
            (re.query.redirects ? ` Redirect: "${re.query.redirects[0].from}" => "${re.query.redirects[0].to}"` : ``)
        );

        // show info
        // const wikiPageID = page0.$?.pageid;
        // const wikiContent = rev0?.slots?.[0].slot?.[0]._;
        // const wikiRevID = rev0?.$?.revid;
        // let info: string = `<%--Comment="Please do not remove this line. This line record contains some important editing data. The content of this line will be automatically removed when you push edits." PageTitle="${wikiTitle}" PageID="${wikiPageID}" RevisionID="${wikiRevID}"--%>`;

        await vscode.workspace.openTextDocument(
            {
                language: revision?.slots?.main?.contentmodel,
                content: revision?.slots?.main?.empty
            }
        );
    }
    catch (error) {
        vscode.window.showErrorMessage(`${error.code}! ${error.info}`);
    }
}

// export function uploadFile(): void {

// }

// export function deletedPage(): void {

// }
