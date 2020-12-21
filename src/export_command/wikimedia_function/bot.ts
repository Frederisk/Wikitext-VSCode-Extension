/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as MWBot from 'mwbot';
import * as vscode from 'vscode';
import { getHost } from '../host_function/host';

export let bot: MWBot | undefined = undefined;

export async function login(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const host: string | undefined = await getHost();
    const userName: string | undefined = config.get("userName");
    const password: string | undefined = config.get("password");

    if (!host) { return undefined; }
    if (!userName || !password) {
        vscode.window.showWarningMessage("You have not filled in the user name or password, please go to the settings to edit them and try again.");
        return undefined;
    }

    bot = new MWBot({
        apiUrl: config.get("transferProtocol") + host + config.get("apiPath")
    });

    try {
        const response = await bot?.login({
            username: userName,
            password: password
        });
        console.log(response);
        vscode.window.showInformationMessage(`User "${response.lgusername}"(UserID:"${response.lguserid}") Login Result is "${response.result}". Login Token is "${response.token}".`
        );
    }
    catch (error) {
        console.log(error);
        vscode.window.showErrorMessage(error.message);
    }
}

export async function logout(): Promise<void> {
    await bot?.getEditToken();
    const result = await bot?.request({
        'action': 'logout',
        'token': bot.editToken
    });
    // it will be {} if success
    console.log(result);
    // clear bot
    bot = undefined;
    vscode.window.showInformationMessage("result: \"Success\"");
}
