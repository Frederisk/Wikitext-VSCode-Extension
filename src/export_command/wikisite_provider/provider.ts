/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { WebviewViewProvider, WebviewView, WebviewViewResolveContext, CancellationToken } from 'vscode';

export class WikisiteProvider implements WebviewViewProvider {

    public resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken): Thenable<void> | void {
        console.log("WEBVIEW");
        webviewView.webview.html = `<h1>HELLO WORLD</h1>`;
    }
}
