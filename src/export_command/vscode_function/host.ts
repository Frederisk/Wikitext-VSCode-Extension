/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import { LanguageClient as BrowserLanguageClient } from 'vscode-languageclient/browser';
import { LanguageClient as NodeLanguageClient, ServerOptions } from 'vscode-languageclient/node';
import { BaseLanguageClient, LanguageClientOptions } from 'vscode-languageclient';

export async function getHost(): Promise<string | undefined> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const host: string | undefined = config.get("host");
    // if host is existed, return it.
    if (host) { return host; }
    // else ask to edit
    const selection: string | undefined = await vscode.window.showWarningMessage(
        `No host defined!
You haven't defined the host for the previewer yet; please input a host value in the dialog box (or in settings) and try again.`
        , "Edit", "Cancel");
    // edit
    if (selection === 'Edit') {
        // show the input box
        const input: string | undefined = await vscode.window.showInputBox({
            prompt: "Please input the host of previewer.",
            placeHolder: "en.wikipedia.org",
            value: config.get("host") || "en.wikipedia.org",
            ignoreFocusOut: false
        });
        // if input is not null or empty, update setting and return input
        if (input) {
            config.update("host", input, true);
            return input;
        }
    }
    // or else return undefined
    return undefined;
}

export let client: BaseLanguageClient | undefined = undefined;

export function restartLspFactory(_: unknown, isBrowser: boolean) {
    return async function restartLsp(): Promise<void> {
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
        await client?.stop();
        await client?.dispose();

        if (!config.get('wikiparser.enable')) {
            return;
        }

        const serverExtension: vscode.Extension<unknown> | undefined = vscode.extensions.getExtension('Bhsd.vscode-extension-wikiparser');

        if (serverExtension === undefined) {
            await vscode.window.showWarningMessage('Extension `Bhsd.vscode-extension-wikiparser` not found.');
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
            const a: any = 0;
            console.log(a);
        }
        await client.start();
    };
}
