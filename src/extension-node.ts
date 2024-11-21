/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { getPageViewFactory, getPreviewFactory } from './export_command/wikimedia_function/view';
import { loginFactory, logoutFactory } from './export_command/wikimedia_function/bot';
import { closeEditorFactory, postPageFactory, pullPageFactory } from './export_command/wikimedia_function/page';
import { baseUriProcess } from './export_command/uri_function/uri';
import { addWebCiteFactory } from './export_command/cite_function/web';
import { WikitextCommandRegistrar } from './export_command/commandRegistrar';
import { restartLspFactory } from './export_command/vscode_function/host';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log("Wikitext Extension is active.");
    // extensionContext = context;
    // URI
    context.subscriptions.push(vscode.window.registerUriHandler({ handleUri: baseUriProcess }));

    const commandRegistrar = new WikitextCommandRegistrar(context, false);
    // Bot
    commandRegistrar.register('login', loginFactory);
    commandRegistrar.register('logout', logoutFactory);
    // Core
    commandRegistrar.register('readPage', pullPageFactory);
    commandRegistrar.register('writePage', postPageFactory);
    commandRegistrar.register('closeEditor', closeEditorFactory);
    // View
    commandRegistrar.register('getPreview', getPreviewFactory);
    commandRegistrar.register('viewPage', getPageViewFactory);
    // Cite
    commandRegistrar.register('citeWeb', addWebCiteFactory);

    // Lsp
    commandRegistrar.register('restartLsp', restartLspFactory);
    await vscode.commands.executeCommand('wikitext.restartLsp');
}

export async function deactivate(): Promise<void> {
    // await client?.stop();
    console.log("Wikitext Extension is deactivate.");
}
