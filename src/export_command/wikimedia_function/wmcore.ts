/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as MWBot from 'mwbot';
import * as vscode from 'vscode';
import * as querystring from 'querystring';
import { IncomingMessage } from 'http';
import * as xml2js from 'xml2js';
import { action, prop, format, rvprop, alterNativeValues } from './mediawiki';
import { getHost } from '../host_function/host';
import { ReadPageConvert, ReadPageResult } from '../../interface_definition/readPageInterface';
import { sendRequest } from '../private_function/mwrequester';
import { GetViewResult, GetViewConvert } from '../../interface_definition/getViewInterface';

let bot: MWBot | null = null;

export function login(): void {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const host: string | undefined = getHost();
    if (!host) { return undefined; }

    const userName: string | undefined = config.get("userName");
    const password: string | undefined = config.get("password");
    if (!userName || !password) {
        vscode.window.showWarningMessage("You have not filled in the user name or password, please go to the settings and try again.");
        return undefined;
    }

    bot = new MWBot({
        apiUrl: "https://" + host + config.get("apiPath")
    });

    bot?.login({
        username: userName,
        password: password
    }).then((response: any) => {
        console.log(response);
        vscode.window.showInformationMessage(`User "${response.lgusername}"(UserID:"${response.lguserid}") Login Result is "${response.result}". Login Token is "${response.token}".`
        );
    }).catch((err: Error) => {
        console.log(err);
        vscode.window.showErrorMessage(err.message);
    });
}

export async function logout(): Promise<void> {
    await bot?.getEditToken();
    const result = await bot?.request({
        'action': 'logout',
        'token': bot.editToken
    });

    console.log(result);

    bot = null;
    vscode.window.showInformationMessage("result: \"Success\"");
}

/**
 * Write Page
 */
export async function writePage(): Promise<void> {
    const wikiContent: string | undefined = vscode.window.activeTextEditor?.document.getText();
    if (wikiContent === undefined) {
        vscode.window.showWarningMessage("There is no active text editor.");
        return undefined;
    }

    if (bot === null) {
        vscode.window.showWarningMessage("You are not logged in. Please log in and try again.");
        return undefined;
    }

    const wikiTitle: string | undefined = await vscode.window.showInputBox({
        value: "",
        ignoreFocusOut: true,
        password: false,
        prompt: "Enter the page name here."
    });

    if (!wikiTitle) { return undefined; }

    let wikiSummary: string | undefined = await vscode.window.showInputBox({
        value: "",
        ignoreFocusOut: false,
        password: false,
        prompt: "Enter the summary of this edit action."
    });
    wikiSummary += " // Edit via Wikitext Extension for Visual Studio Code";

    // let editStatus: string = "";
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
    });
}

/**
 * Read Page
 */
export async function readPage(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const title: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here."
    });
    if (!title) {
        return undefined;
    }

    const queryInput: querystring.ParsedUrlQueryInput = {
        action: action.query,
        format: format.xML,
        prop: prop.reVisions,
        rvprop: alterNativeValues(rvprop.content, rvprop.ids),
        rvslots: "*",
        titles: title
    };

    if (config.get("redirects")) {
        queryInput.redirects = "true";
    }

    sendRequest(queryInput, requestCallback);

    function requestCallback(response: IncomingMessage) {
        const chunks: Uint8Array[] = [];

        response.on('data', data => {
            console.log(response.statusCode);
            chunks.push(data);
        });

        response.on('end', () => {
            // result.
            const xmltext: string = Buffer.concat(chunks).toString();
            xml2js.parseString(xmltext, async (err: Error, result: any) => {
                console.log(result);
                const re: ReadPageResult = ReadPageConvert.toReadPageResult(result);
                const query0 = re.api?.query?.[0];
                const page0 = query0?.pages?.[0].page?.[0];
                const rev0 = page0?.revisions?.[0].rev?.[0];

                // interwiki
                if (query0?.interwiki !== undefined) {
                    vscode.window.showWarningMessage(
                        `Interwiki page "${query0.interwiki?.[0].i?.[0].$?.title}" in space "${query0.interwiki?.[0].i?.[0].$?.iw}" are currently not supported. Please try to modify host.`
                    );
                    return undefined;
                }

                // need page
                if (!page0) { return undefined; }
                // not exist
                const wikiTitle = page0.$?.title;
                if (page0.$?.missing !== undefined ||
                    page0.$?.invalid !== undefined) {
                    vscode.window.showWarningMessage(
                        `The page "${wikiTitle}" you are looking for does not exist.` +
                        page0.$?.invalidreason || ``
                    );
                    return undefined;
                }

                const wikiNormalized = query0?.normalized?.[0].n?.[0].$;
                const wikiRedirect = query0?.redirects?.[0].r?.[0].$;
                const wikiModel = rev0?.slots?.[0].slot?.[0].$?.contentmodel;
                vscode.window.showInformationMessage(`Opened page "${wikiTitle}" with Model ${wikiModel}.` +
                    (wikiNormalized ? ` Normalized: "${wikiNormalized.from}" => "${wikiNormalized.to}".` : ``) +
                    (wikiRedirect ? ` Redirect: "${wikiRedirect?.from}" => "${wikiRedirect.to}"` : ``)
                );

                // show info
                const wikiPageID = page0.$?.pageid;
                const wikiContent = rev0?.slots?.[0].slot?.[0]._;
                const wikiRevID = rev0?.$?.revid;
                let info: string = `<%--Comment="Please do not remove this line. This line record contains some important editing data. The content of this line will be automatically removed when you push edits." PageTitle="${wikiTitle}" PageID="${wikiPageID}" RevisionID="${wikiRevID}"--%>`;

                await vscode.workspace.openTextDocument({
                    language: wikiModel,
                    content: `${info}\n${wikiContent}`
                });
            });
        });

        response.on('error', (error: Error) => {
            vscode.window.showErrorMessage(error.name);
        });
    }
}

export async function viewPage(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const host: string | undefined = getHost();
    if (!host) { return undefined; }
    const pageTitle: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here."
    });
    if (!pageTitle) {
        return undefined;
    }

    bot = bot ?? new MWBot({
        apiUrl: "https://" + host + config.get("apiPath")
    });

    const args: any = {
        'action': action.parse,
        // format: format.jSON,
        'page': pageTitle,
        'prop': alterNativeValues(prop.text, prop.displayTitle, (config.get("getCss") ? prop.headHTML : undefined)),
    };
    if (config.get("redirects")) {
        args['redirects'] = "true";
    }
    try {
        const result = await bot?.request(args);
        const re: GetViewResult = GetViewConvert.toGetViewResult(result);

        if(!re.parse) {return undefined;}
        let currentPlanel: vscode.WebviewPanel = vscode.window.createWebviewPanel("pageViewer", "PageViewer", vscode.ViewColumn.Active, {
            enableScripts: config.get("enableJavascript"),
        });

        const header: string = config.get("getCss") ? (re.parse.headhtml?.["*"] || ``) : `<!DOCTYPE html><html><body>`;
        const end: string = `</body></html>`;

        if (!currentPlanel) { return undefined; }
        currentPlanel.webview.html = header + re.parse.text?.["*"] + end;
        currentPlanel.title = `WikiViewer: ${re.parse.displaytitle}`;
        
    }
    catch (error) {
        vscode.window.showErrorMessage(`${error.code}! ${error.info}`);
        return undefined;
    }
}

export function uploadFile(): void {

}

export function deletedPage(): void {

}
