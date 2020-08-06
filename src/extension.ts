/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { getPreview } from './export_command/preview_function/preview';
import { setHost } from './export_command/host_function/host';
import { foo } from './foo';
import { login, logout, writePage, readPage } from './export_command/wikimedia_function/wmcore';
// import * as mwbot from 'mwbot';
// import { resolve } from 'dns';
// import { homedir } from 'os';
// import { URL } from 'url';
// import { reporters } from 'mocha';
// import { rejects, strict } from 'assert';
// import { isNull } from 'util';

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

    context.subscriptions.push(vscode.commands.registerCommand("wikitext.test", foo));
}

export function deactivate(): void {
    console.log("Extension is deactivate.");
}
