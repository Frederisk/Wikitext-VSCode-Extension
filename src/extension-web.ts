/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { closeEditorFactory } from './export_command/wikimedia_function/page';
import { WikitextCommandRegistrar } from './export_command/commandRegistrar';
import { restartLsp } from './export_command/vscode_function/host';

export function activate(context: vscode.ExtensionContext): void {
    function showUnsupportedMessageFactory() {
        return  () => {
            vscode.window.showErrorMessage('Web extension does not support this function.');
        };
    }

    console.log("Extension is active.");

    const commandRegister = new WikitextCommandRegistrar(context);
    // Bot
    commandRegister.register('login', showUnsupportedMessageFactory);
    commandRegister.register('logout', showUnsupportedMessageFactory);
    // Core
    commandRegister.register('readPage', showUnsupportedMessageFactory);
    commandRegister.register('writePage', showUnsupportedMessageFactory);
    commandRegister.register('closeEditor', closeEditorFactory);
    // View
    commandRegister.register('getPreview', showUnsupportedMessageFactory);
    commandRegister.register('viewPage', showUnsupportedMessageFactory);
    // Cite
    commandRegister.register('citeWeb', showUnsupportedMessageFactory);

    restartLsp(true);
}

export function deactivate(): void {
    console.log("Extension is deactivate.");
}
