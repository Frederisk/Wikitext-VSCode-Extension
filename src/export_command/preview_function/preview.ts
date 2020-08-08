/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as querystring from 'querystring';
import { request } from 'https';
import { ClientRequest, RequestOptions, IncomingMessage } from 'http';
import { getHost } from '../host_function/host';
import { extensionContext } from '../../extension';
import { action, format, contextModel } from '../wikimedia_function/mediawiki';

/**
 * webview panel
 */
let currentPlanel: vscode.WebviewPanel | undefined = undefined;

export function getPreview(): void {
    const textEditor = vscode.window.activeTextEditor;
    // check is there an opened document.
    if (!textEditor) {
        vscode.window.showInformationMessage("No Active Wikitext Editor.");
        // if have not, cancle.
        return undefined;
    }
    // get host
    let host: string | undefined = getHost();
    // falied, stop task.
    if (!host) { return undefined; }
    // check if have an opened WebViewPanel.
    if (!currentPlanel) {
        // if have not, try to creat new one.
        currentPlanel = vscode.window.createWebviewPanel(
            "previewer", "WikitextPreviewer", vscode.ViewColumn.Beside, {
            enableScripts: true
        });
        // register for events that release resources.
        currentPlanel.onDidDispose(() => {
            currentPlanel = undefined;
        }, null, extensionContext.subscriptions);
    }
    // show loading statu
    currentPlanel.webview.html = showHtmlInfo("Loading...");
    /** document text */
    const sourceText: string = textEditor.document.getText();

    /** arguments */
    const args: string = querystring.stringify({
        action: action.parse,
        format: format.json,
        text: sourceText,
        contentmodel: contextModel.Wikitext
    });

    /** target content */
    const opts: RequestOptions = {
        hostname: host,
        path: vscode.workspace.getConfiguration("wikitext").get("apiPath"),
        method: "POST",
        timeout: 10000,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(args)
        }
    };
    const req: ClientRequest = request(opts, requestCallback);
    // write arguments.
    req.write(args);
    // call end methord.
    req.end();

    function requestCallback(response: IncomingMessage): void {
        const chunks: Uint8Array[] = [];
        // get data.
        response.on('data', data => {
            console.log(response.statusCode);
            chunks.push(data);
        });
        // end event.
        response.on('end', () => {
            // result.
            const jsontext: string = Buffer.concat(chunks).toString();
            console.log(jsontext);
            const json: any = JSON.parse(jsontext);
            const result: string | undefined = unescape(json["parse"]["text"]["*"]);
            // confirm the presence of the panel.
            if (!currentPlanel) {
                vscode.window.showInformationMessage("Preview Planel Not be Opened.");
                return undefined;
            }
            // show result.
            if (result) {
                currentPlanel.webview.html = result;
            }
            // no content, notification error.
            else {
                currentPlanel.webview.html = showHtmlInfo("ERROR_FRESH_FAIL");
                vscode.window.showWarningMessage("Fresh Error.");
            }
        });
        // exception status.
        response.on('error', (error: Error) => {
            if (currentPlanel) {
                currentPlanel.webview.html = showHtmlInfo("ERROR_FRESH_FAIL");
            }
            vscode.window.showWarningMessage("Fresh Error:\n" + error.name);
        });
    }
}

function showHtmlInfo(info: string): string {
    return `
<body>
    <section>
        <h2>
            ${info}
        </h2>
    </section>
</body>`;
}
