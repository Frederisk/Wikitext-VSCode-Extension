/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as MWBot from 'mwbot';
import * as vscode from 'vscode';
import { getHost } from './host';
import { resolveTxt } from 'dns';
// import { SrvRecord } from 'dns';

let bot: MWBot | null = null;

export async function login(): Promise<void> {
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

    await bot?.login({
        username: userName,
        password: password
    }).then((response) => {
        console.log(response);
        vscode.window.showInformationMessage(
`result: "${response.result}"
token: "${response.token}"
lguserid: "${response.lguserid}"
lgusername: "${response.lgusername}"`
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
    if(bot === null){
        vscode.window.showErrorMessage("You are not logged in. Please log in and try again.");
        return undefined;
    }

    vscode.window.showInputBox({
        value: "",
        ignoreFocusOut: true,
        password: false,
        prompt: "Enter the page name here."
    });

}

export function openNewPage(): void {

}
