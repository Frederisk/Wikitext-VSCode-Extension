/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import path from 'path';
import { getPageViewFactory, getPreviewFactory } from './export_command/wikimedia_function/view';
import { loginFactory, logoutFactory } from './export_command/wikimedia_function/bot';
import { closeEditorFactory, postPageFactory, pullPageFactory } from './export_command/wikimedia_function/page';
import { baseUriProcess } from './export_command/uri_function/uri';
import { addWebCiteFactory } from './export_command/cite_function/web';
import { WikitextCommandRegistrar } from './export_command/commadRegistrar';

export function activate(context: vscode.ExtensionContext): void {
    console.log("Extension is active.");
    // extensionContext = context;
    // URI
    context.subscriptions.push(vscode.window.registerUriHandler({ handleUri: baseUriProcess }));

    const commandRegistrar = new WikitextCommandRegistrar(context);
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

    configureLuaLibrary(
        "Scribunto",
        vscode.workspace.getConfiguration("wikitext").get<string>("scopedLuaIntegration") !== "disabled"
    );
}

export function deactivate(): void {
    console.log("Extension is inactive.");

    if (vscode.workspace.getConfiguration("wikitext").get<string>("scopedLuaIntegration") !== "enabled") {
        configureLuaLibrary("Scribunto", false);
    }
}

export function configureLuaLibrary(folder: string, enable: boolean) {
    const extensionId = "rowewilsonfrederiskholme.wikitext";
    const extensionPath = vscode.extensions.getExtension(extensionId)?.extensionPath;
    if (extensionPath === undefined) {
        return;
    }

    const folderPath = path.join(extensionPath, "EmmyLua", folder);
    const config = vscode.workspace.getConfiguration("Lua");
    let library: string[] | undefined = config.get("workspace.library");
    if (library === undefined) {
        return;
    }

    if (library && extensionPath) {
        // remove any older versions of our path
        library = library.filter(path =>
            !path.includes(extensionId) ||
            path.includes(extensionPath));

        const index = library.indexOf(folderPath);
        if (enable) {
            if (index < 0) {
                library.push(folderPath);
            }
        }
        else if (index >= 0) {
            library.splice(index, 1);
        }
        config.update("workspace.library", library, false);
    }
}
