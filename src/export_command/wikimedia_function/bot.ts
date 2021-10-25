/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import MWBot from 'mwbot';
import * as vscode from 'vscode';
import { getHost } from '../host_function/host';
import { Action } from './args';
import { showMWErrorMessage } from './err_msg';

let bot: MWBot | undefined;

export async function login(): Promise<boolean> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const host: string | undefined = await getHost();
    if (!host) { return false; }

    const userInfo: { username?: string; password?: string } = {
        username: config.get('userName'),
        password: config.get('password')
    };

    if (!userInfo.username || !userInfo.password) {
        vscode.window.showWarningMessage("You have not filled in the user name or password, please go to the settings to edit them and try again.");
        return false;
    }

    bot = new MWBot({
        apiUrl: config.get("transferProtocol") + host + config.get("apiPath")
    });
    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Login...");
    try {
        const response = await bot.login(userInfo);
        vscode.window.showInformationMessage(`User "${response.lgusername}"(UserID:"${response.lguserid}") Login Result is "${response.result}". Login Token is "${response.token}".`
        );
        return true;
    }
    catch (error) {
        bot = undefined;
        showMWErrorMessage('login', error);
        return false;
    }
    finally {
        barMessage.dispose();
    }
}

export async function logout(): Promise<void> {
    await bot?.getEditToken();
    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Logout...");
    try {
        // it will be {} if success
        await bot?.request({
            'action': Action.logout,
            'token': bot.editToken
        });
        // clear bot
        bot = undefined;
        vscode.window.showInformationMessage('result: "Success"');
    }
    catch (error) {
        showMWErrorMessage('logout', error);
    }
    finally {
        barMessage.dispose();
    }
}

export async function getDefaultBot(): Promise<MWBot | undefined> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    let tBot: MWBot;
    if (bot) {
        tBot = bot;
    }
    else {
        // get host
        const host: string | undefined = await getHost();
        if (!host) { return undefined; }
        tBot = new MWBot({
            apiUrl: config.get("transferProtocol") + host + config.get("apiPath")
        });
    }
    return tBot;
}

export async function getLoggedInBot(): Promise<MWBot | undefined> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    if (bot === undefined) {
        switch (config.get('autoLogin')) {
            case 'Always':
                if (!await login()) {
                    // login failed
                    return undefined;
                }
                break;
            case 'Never':
                vscode.window.showWarningMessage('You are not logged in. Please log in and try again.');
                return undefined;
            case 'Ask me':
            default:
                const result: string | undefined = await vscode.window.showWarningMessage("You are not logged in. Do you want to login now?", 'Yes', 'No', 'Always', 'Never');
                switch (result) {
                    case 'Always':
                        config.update('autoLogin', 'Always', true);
                    case 'Yes':
                        if (!await login()) {
                            // login failed
                            return undefined;
                        }
                        break;
                    case 'Never':
                        config.update('autoLogin', 'Never', true);
                    case 'No':
                    case undefined:
                    default:
                        return undefined;
                }
                break;
        }
    }
    return bot;
}