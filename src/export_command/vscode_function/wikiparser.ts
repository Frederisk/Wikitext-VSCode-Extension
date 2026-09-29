/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import { LanguageClient as BrowserLanguageClient } from 'vscode-languageclient/browser';
import { LanguageClient as NodeLanguageClient, ServerOptions } from 'vscode-languageclient/node';
import { BaseLanguageClient, LanguageClientOptions } from 'vscode-languageclient';

export let client: BaseLanguageClient | undefined = undefined;

export function restartLspFactory(_: unknown, isBrowser: boolean) {
    return async function restartLsp(): Promise<void> {
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('wikitext');
        await client?.stop();
        await client?.dispose();

        if (!config.get('wikiparser.enable')) {
            return;
        }

        if (config.get('wikiparser.syncArticlePath')) {
            const configWikiParserServer = vscode.workspace.getConfiguration('wikiparser');
            // if (configWikiParserServer.has('articlePath')){
            configWikiParserServer.update('articlePath', config.get("transferProtocol") as string + config.get('host') + config.get("articlePath"), true);
            // }
        }

        const serverExtension: vscode.Extension<unknown> | undefined = vscode.extensions.getExtension('Bhsd.vscode-extension-wikiparser');

        if (serverExtension === undefined) {
            vscode.window.showWarningMessage('Extension `Bhsd.vscode-extension-wikiparser` not found. Please install it before use, then execute `Restart WikiParser LSP` command or restart VSCode.', 'Install WikiParser', 'Cancel')
                .then((selection: string | undefined) => {
                    if (selection === 'Install WikiParser') {
                        vscode.commands.executeCommand('workbench.extensions.search', 'Bhsd.vscode-extension-wikiparser');
                    }
                });
            return;
        }

        const name: string = 'WikiParser Language Server';
        const clientOptions: LanguageClientOptions = {
            documentSelector: [
                { scheme: 'file', language: 'wikitext' },
                { scheme: 'untitled', language: 'wikitext' },
            ],
        };

        if (isBrowser) {
            const serverUri: vscode.Uri | undefined = serverExtension.extensionUri;
            const serverMain: vscode.Uri = vscode.Uri.joinPath(serverUri, 'server', 'dist', 'server.js');
            const worker = new Worker(serverMain.toString(true));
            client = new BrowserLanguageClient('lsp-vscode-extension-wikiparser', name, clientOptions, worker);
        } else {
            const serverPath: string | undefined = serverExtension.extensionPath;
            const serverMain: string = path.join(serverPath, 'server', 'dist', 'server.js');
            const serverOptions: ServerOptions = {
                run: {
                    module: serverMain,
                },
                debug: {
                    module: serverMain,
                    args: ['--debug'],
                },
            };
            client = new NodeLanguageClient(name, serverOptions, clientOptions);
        }
        await client.start();
    };
}
