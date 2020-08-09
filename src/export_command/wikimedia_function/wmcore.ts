/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as MWBot from 'mwbot';
import * as vscode from 'vscode';
import * as querystring from 'querystring';
import { RequestOptions, ClientRequest, IncomingMessage } from 'http';
import { request } from 'https';
import * as xml2js from 'xml2js';
import { action, prop, format, rvprop, alterNativeValues } from './mediawiki';
import { getHost } from '../host_function/host';
import * as convertFunction from '../../interface_definition/readPageInterface';

let bot: MWBot | null = null;
let pageName: string | undefined = "";

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
    }).then((response) => {
        console.log(response);
        vscode.window.showInformationMessage(`User "${response.lgusername}"(UserID:"${response.lguserid}") Login Result is "${response.result}". Login Token is "${response.token}".`
        );
    }).catch((err: Error) => {
        console.log(err);
        vscode.window.showErrorMessage(err.message);
    });
}

export function logout(): void {
    bot = null;
    vscode.window.showInformationMessage("result: \"Success\"");
}

/**
 * Write Page
 */
export async function writePage() {
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
        value: pageName,
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
    await bot.getEditToken().then(response => {
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
    const host: string | undefined = getHost();

    const title: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here."
    });
    if (!title) {
        return undefined;
    }

    const queryInput: querystring.ParsedUrlQueryInput = {
        action: action.query,
        format: format.xml,
        prop: prop.reVisions,
        rvprop: alterNativeValues(rvprop.content, rvprop.ids),
        rvslots: "*",
        titles: title
    };

    if (config.get("redirects")) {
        queryInput.redirects = "true";
    }
    const args: string = querystring.stringify(queryInput);

    const opts: RequestOptions = {
        hostname: host,
        path: config.get("apiPath"),
        method: "POST",
        timeout: 10000,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(args)
        }
    };
    const req: ClientRequest = request(opts, requestCallback);
    // write arguments.
    req.write(args);
    // call end methord.
    req.end();

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
                const re = convertFunction.Convert.toReadPageResult(result);

                const wikiTitle = re.api?.query?.[0].pages?.[0].page?.[0].$?.title;
                if (re.api?.query?.[0].pages?.[0].page?.[0].$?.missing !== undefined ||
                    re.api?.query?.[0].pages?.[0].page?.[0].$?.invalid !== undefined) {
                    vscode.window.showWarningMessage(
                        `The page "${wikiTitle}" you are looking for does not exist.` +
                        re.api?.query?.[0].pages?.[0].page?.[0].$?.invalidreason || ``
                    );
                    return undefined;
                }
                if (re?.api?.query?.[0].interwiki !== undefined) {
                    vscode.window.showWarningMessage(
                        `Interwiki page "${re?.api?.query?.[0].interwiki?.[0].i?.[0].$?.title}" in space "${re?.api?.query?.[0].interwiki?.[0].i?.[0].$?.iw}" are currently not supported. Please try to modify host.`
                    );
                    return undefined;
                }

                const wikiContent = re.api?.query?.[0].pages?.[0].page?.[0].revisions?.[0].rev?.[0].slots?.[0].slot?.[0]._;
                const wikiModel = re.api?.query?.[0].pages?.[0].page?.[0].revisions?.[0].rev?.[0].slots?.[0].slot?.[0].$?.contentmodel;
                console.log(wikiModel);
                await vscode.workspace.openTextDocument({
                    language: wikiModel,
                    content: wikiContent
                });

                console.log(wikiTitle);
                pageName = wikiTitle;

                const wikiPageID = re.api?.query?.[0].pages?.[0].page?.[0].$?.pageid;
                const wikiNormalized = re.api?.query?.[0].normalized?.[0].n?.[0].$;
                const wikiRedirect = re.api?.query?.[0].redirects?.[0].r?.[0].$;
                vscode.window.showInformationMessage(`Opened page "${wikiTitle}" (page ID:"${wikiPageID}") with Model ${wikiModel}.` + (wikiNormalized ? ` Normalized: "${wikiNormalized.from}" => "${wikiNormalized.to}".` : ``) + (wikiRedirect ? ` Redirect: "${wikiRedirect?.from}" => "${wikiRedirect.to}"` : ``));
            });
        });
    }
}

export async function viewPage(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const host: string | undefined = getHost();

    const title: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here."
    });
    if (!title) {
        return undefined;
    }

    const queryInput: querystring.ParsedUrlQueryInput = {
        action: action.parse,
        format: format.json,
    };
    if (config.get("redirects")) {
        queryInput.redirects = "true";
    }
    
}

export function uploadFile(): void {

}

export function deletedPage(): void {

}
