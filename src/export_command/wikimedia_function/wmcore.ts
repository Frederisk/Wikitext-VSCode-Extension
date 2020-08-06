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
import { action, prop } from './mediawiki';
import { getHost } from '../host_function/host';
import * as readPageInterface from '../../interface_definition/readPageInterface';
import { win32 } from 'path';

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

}

export function uploadFile(): void {

}

export function deletedPage(): void {

}

export function viewPage(): void {

}
