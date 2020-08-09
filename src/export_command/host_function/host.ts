/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export function setHost(): void {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    vscode.window.showInputBox({
        prompt: "Please input the host of previewer. such as 'en.wikipedia.org'.",
        //value: extensionContext.globalState.get("host") ?? "en.wikipedia.org",
        value: config.get("host") || "en.wikipedia.org",
        ignoreFocusOut: false
    }).then(resule => {
        // extensionContext.globalState.update("host", resule);
        config.update("host", resule as string, true);
    });
}

export function getHost(): string | undefined {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    // const host: string | undefined = extensionContext.globalState.get("host");
    const host: string | undefined = config.get("host");
    // Login and Session Management
    if (!host) {
        // error, show warnning
        vscode.window.showWarningMessage("No Host Be Defined!\nYou haven't defined the host of previewer yet, please input host value in the dialog box and try again.", "Edit", "Cancel").then(result => {
            if (result === "Edit") {
                // enter host
                setHost();
            }
        });
        return undefined;
    }
    else {
        return host;
    }
}
