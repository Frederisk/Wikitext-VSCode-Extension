/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as MWBot from 'mwbot';
import * as vscode from 'vscode';
import { getHost } from './host';
import * as querystring from 'querystring';
import { action, prop } from './mediawiki';
import { RequestOptions, ClientRequest, IncomingMessage } from 'http';
import { request } from 'https';
import * as xml2js from 'xml2js';
import * as readPageInterface from './readPageInterface';

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
        vscode.window.showInformationMessage(`User "${response.lgusername}"(UserID:"${response.lguserid}") Login Result is "${response.result}". Login Token is "${response.token}"`
        );
    }).catch((err: Error) => {
        console.log(err);
        vscode.window.showErrorMessage(err.message);
    });
}

export function logout(): void {
    bot = null;
    vscode.window.showErrorMessage("result: \"Success\"");
}

/**
 * Write Page
 */
export function writePage(): void {
    if (bot === null) {
        vscode.window.showErrorMessage("You are not logged in. Please log in and try again.");
        return undefined;
    }

    vscode.window.showInputBox({
        value: pageName,
        ignoreFocusOut: true,
        password: false,
        prompt: "Enter the page name here."
    });

}

/**
 * Read Page
 */
export async function readPage(): Promise<void> {
    const host: string | undefined = getHost();

    const title: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here."
    });
    if (!title) {
        return undefined;
    }

    const queryInput: querystring.ParsedUrlQueryInput = {
        action: action.query,
        format: "xml",
        prop: prop.reVisions,
        rvprop: "content",
        rvslots: "*",
        titles: title
    };
    if (vscode.workspace.getConfiguration("wikitext").get("redirects")) {
        queryInput.redirects = "true";
    }
    const args: string = querystring.stringify(queryInput);

    const opts: RequestOptions = {
        hostname: host,
        path: vscode.workspace.getConfiguration("wikitext").get("apiPath"),
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
            xml2js.parseString(xmltext, (err: Error, result: any) => {
                console.log("obj:");

                console.log(result);
                console.log(JSON.stringify(result));

                const re = readPageInterface.Convert.toReadPageResult(result);
                
                const wikiNormalized = result.api?.query[0]?.normalized[0]?.n[0]?.$;

                console.log(wikiNormalized);
                const wikiRedirect = result.api?.query[0]?.redirects[0]?.n[0]?.$;
                console.log(wikiRedirect);
                const wikiTitle = result.api?.query[0]?.pages[0]?.page[0]?.$?.title;
                console.log(wikiTitle);
                const wikiPageID = result.api?.query[0]?.pages[0]?.page[0]?.$?.pageid;
                console.log(wikiPageID);
                const wikiMissing = result.api?.query[0]?.pages[0]?.page[0]?.$?.missing;
                console.log(wikiMissing);
                const wikiContent = result.api?.query[0]?.pages[0]?.revisions[0]?.rev[0]?.slots[0]?.slot[0]?._;

                const wikiModel = result.api?.query[0]?.pages[0]?.revisions[0]?.rev[0]?.slots[0]?.slot[0]?.$?.contentmodel;
                console.log(wikiModel);

                if (wikiMissing !== undefined) {
                    vscode.window.showWarningMessage("The page " + wikiTitle + " you are looking for does not exist.");
                    return undefined;
                }
                vscode.workspace.openTextDocument({
                    language: wikiModel,
                    content: wikiContent
                });
                pageName = wikiTitle;
                vscode.window.showInformationMessage(`Opened page "${wikiTitle}" (page ID:"${wikiPageID}") with Model ${wikiModel}.` + (wikiNormalized ? ` Normalized: "${wikiNormalized["from"]} => "${wikiNormalized["to"]}"` : ``) + (wikiRedirect ? ` Redirect: "${wikiRedirect["from"]}" => "${wikiRedirect["to"]}"` : ``));
            });
        });
    }
}

export function uploadFile(): void {

}

export function deletedPage(): void {

}

export function viewPage(): void {

}
