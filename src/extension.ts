/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { getPreview, getPageView } from './export_command/wikimedia_function/view';
import { login, logout } from './export_command/wikimedia_function/bot';
import { postPage, pullPage } from './export_command/wikimedia_function/page';
import { baseUriProcess } from './export_command/uri_function/uri';
import { addWebCite } from './export_command/cite_function/web';

export let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext): void {
    console.log("Extension is active.");
    extensionContext = context;
    // URI
    context.subscriptions.push(vscode.window.registerUriHandler({ handleUri: baseUriProcess }));
    // Bot
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.login", login));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.logout", logout));
    // Core
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.readPage", pullPage));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.writePage", postPage));
    // View
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.getPreview", getPreview));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.viewPage", getPageView));
    // Cite
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.citeWeb", addWebCite));
}

export function deactivate(): void {
    console.log("Extension is deactivate.");
}
