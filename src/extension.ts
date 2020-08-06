/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { getPreview } from './export_command/preview_function/preview';
import { setHost } from './export_command/host_function/host';
import { login, logout, writePage, readPage, viewPage } from './export_command/wikimedia_function/wmcore';

export let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext): void {
    extensionContext = context;
    console.log("Extension is active.");
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.setHost", setHost));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.getPreview", getPreview));
        
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.login",login));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.logout",logout));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.readPage", readPage));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.writePage",writePage));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.viewpage",viewPage));

    // context.subscriptions.push(vscode.commands.registerCommand("wikitext.test", foo));
}

export function deactivate(): void {
    console.log("Extension is deactivate.");
}
