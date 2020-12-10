/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export async function getHost(): Promise<string | undefined> {
    async function setHost(): Promise<string | undefined> {
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

        const result: string | undefined = await vscode.window.showInputBox({
            prompt: "Please input the host of previewer.",
            placeHolder: "en.wikipedia.org",
            value: config.get("host") || "en.wikipedia.org",
            ignoreFocusOut: false
        });
        if (result) {
            config.update("host", result, true);
            return result;
        }
    }

    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const host: string | undefined = config.get("host");
    if (host) { return host; }

    // Login and Session Management
    // error, show warnning
    const result = await vscode.window.showWarningMessage(
        `No Host Be Defined!
You haven't defined the host of previewer yet, please input host value in the dialog box (or in settings) and try again.`
        , "Edit", "Cancel");

    if (result === "Edit") {
        return await setHost();
    }
    else {
        return undefined;
    }
}
