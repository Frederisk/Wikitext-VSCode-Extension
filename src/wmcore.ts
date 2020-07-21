import * as MWBot from 'mwbot';
import * as vscode from 'vscode';
import { getHost } from './host';
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
        apiUrl: "https://" + host + "/w/api.php"
    });

    await bot?.login({
        username: userName,
        password: password
    });
}

export function logout(): void{
    bot = null;
}







