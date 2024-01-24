/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import MWBot from 'mwbot';
import * as vscode from 'vscode';
import { getHost } from '../vscode_function/host';
import { Action, Meta } from './args';
import { showMWErrorMessage } from './err_msg';

let bot: MWBot | undefined;

export function loginFactory() {
    return login;
}

export function logoutFactory() {
    return async function logout(): Promise<void> {
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
            vscode.window.showInformationMessage('result: Success');
        }
        catch (error) {
            showMWErrorMessage('logout', error);
        }
        finally {
            barMessage.dispose();
        }
    };
}

async function login(): Promise<boolean> {
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

    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Login...");
    try {
        bot = new MWBot({
            apiUrl: config.get("transferProtocol") + host + config.get("apiPath")
        });
        // TODO:
        const response: any = await bot.login(userInfo);
        if (response.result === 'Success') {
            vscode.window.showInformationMessage(`User "${response.lgusername}"(UserID:"${response.lguserid}") Login Result is "${response.result}". Login Token is "${response.token}".`
            );
            return true;
        }
        else {
            vscode.window.showErrorMessage(`User "${response.lgusername}"(UserID:"${response.lguserid}") Login Result is "${response.result}". Login Token is "${response.token}".`
            );
            return false;
        }
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

export async function getDefaultBot(): Promise<MWBot | undefined> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    let tBot: MWBot;
    if (bot) {
        tBot = bot;
    } else {
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
    // if bot is not be created or not logged in
    if (bot === undefined || !bot.loggedIn) {
        switch (config.get('autoLogin')) {
            case 'Always':
                return await login() ? bot : undefined;
            case 'Never':
                vscode.window.showWarningMessage('You are not logged in. Please log in and try again.');
                return undefined;
            case 'Ask me':
            default:
                switch (await vscode.window.showWarningMessage("You are not logged in. Do you want to login now?", 'Yes', 'No', 'Always', 'Never')) {
                    case 'Always':
                        config.update('autoLogin', 'Always', true);
                        return await login() ? bot : undefined;
                    case 'Yes':
                        return await login() ? bot : undefined;
                    case 'Never':
                        config.update('autoLogin', 'Never', true);
                        return undefined;
                    case 'No':
                    case undefined:
                    default:
                        return undefined;
                }
        }
    }
    return bot;
}

export async function compareVersion(tBot: MWBot, major: number, minor: number, revision: number): Promise<boolean | undefined> {
    // if (bot === undefined) {
    //     return undefined;
    // }
    const args: Record<string, string> = {
        action: Action.query,
        meta: Meta.siteInfo,
    };

    const result: unknown = await tBot.request(args);
    const re: any = result as any;
    // TODO: cast

    const generator: string = re.query.general.generator;

    const generatorInfo: RegExpMatchArray | null = generator.match(/^MediaWiki ([0-9]+)\.([0-9]+)\.([0-9]+)(.*)$/);
    if (generatorInfo === null) {
        return undefined;
    }

    const siteMajor: number = parseInt(generatorInfo[1]);
    const siteMinor: number = parseInt(generatorInfo[2]);
    const siteRevision: number = parseInt(generatorInfo[3]);

    if (isNaN(siteMajor + siteMinor + siteRevision)) {
        return undefined;
    }

    if (siteMajor !== major) {
        return siteMajor > major;
    }
    if (siteMinor !== minor) {
        return siteMinor > minor;
    }
    return siteRevision >= revision;

}
