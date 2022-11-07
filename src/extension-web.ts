/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { closeEditor } from './export_command/wikimedia_function/page';



export function activate(context: vscode.ExtensionContext): void {
    function subscriptUnsupportedMessage(command: string) {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                command, () => {
                    vscode.window.showErrorMessage('Web extension does not support this function.');
                }
            )
        );
    }

    console.log("Extension is active.");
    subscriptUnsupportedMessage("wikitext.login");
    subscriptUnsupportedMessage("wikitext.logout",);
    subscriptUnsupportedMessage("wikitext.readPage");
    subscriptUnsupportedMessage("wikitext.writePage");
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.closeEditor", closeEditor));
    subscriptUnsupportedMessage("wikitext.getPreview");
    subscriptUnsupportedMessage("wikitext.viewPage");
    subscriptUnsupportedMessage("wikitext.citeWeb");
}

export function deactivate(): void {
    console.log("Extension is deactivate.");
}
