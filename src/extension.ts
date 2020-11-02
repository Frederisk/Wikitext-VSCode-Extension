/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { getPreview, getPageView } from './export_command/wikimedia_function/view';
import { setHost } from './export_command/host_function/host';
import { login, logout } from './export_command/wikimedia_function/bot';
import { writePage, readPage } from './export_command/wikimedia_function/core';
import { baseUriProcess } from './export_command/uri_function/uri';

export let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext): void {
    console.log("Extension is active.");

    extensionContext = context;

    context.subscriptions.push(vscode.window.registerUriHandler({ handleUri: baseUriProcess }));

    context.subscriptions.push(vscode.commands.registerCommand("wikitext.setHost", setHost));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.getPreview", getPreview));

    context.subscriptions.push(vscode.commands.registerCommand("wikitext.login", login));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.logout", logout));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.readPage", readPage));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.writePage", writePage));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.viewPage", getPageView));
}

export function deactivate(): void {
    console.log("Extension is deactivate.");
}
