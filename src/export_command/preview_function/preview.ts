/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as querystring from 'querystring';
import { extensionContext } from '../../extension';
import { action, format, contextModel, alterNativeValues, prop } from '../wikimedia_function/mediawiki';
import { sendRequest } from '../private_function/mwrequester';
import { IncomingMessage } from 'http';

/**
 * webview panel
 */
let currentPlanel: vscode.WebviewPanel | undefined = undefined;

export function getPreview(): void {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const textEditor = vscode.window.activeTextEditor;
    // check is there an opened document.
    if (!textEditor) {
        vscode.window.showInformationMessage("No Active Wikitext Editor.");
        // if have not, cancle.
        return undefined;
    }

    if (!currentPlanel) {
        // if have not, try to creat new one.
        currentPlanel = vscode.window.createWebviewPanel(
            "previewer", "WikitextPreviewer", vscode.ViewColumn.Beside, {
            enableScripts: config.get("enableJavascript"),
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
    const queryInput : querystring.ParsedUrlQueryInput = {
        action: action.parse,
        format: format.json,
        text: sourceText,
        prop: alterNativeValues(prop.text, prop.displayTitle, (config.get("getCss") ? prop.headHTML : undefined)),
        contentmodel: contextModel.Wikitext
    };

    sendRequest(queryInput, requestCallback);

    /** */
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
            const result: string = Buffer.concat(chunks).toString();
            const re: any = JSON.parse(result);
            console.log(re);
            // confirm the presence of the panel.
            if (!currentPlanel) {
                vscode.window.showInformationMessage("Preview Planel Not be Opened.");
                return undefined;
            }

            const wikiContent: string = unescape(re["parse"]["text"]["*"]);
            const header: string = config.get("getCss") ? re["parse"]["headhtml"]["*"] : `<!DOCTYPE html><html><body>`;
            const end: string = `</body></html>`;

            // show result.
            if (wikiContent && header) {
                currentPlanel.webview.html = header + wikiContent + end;
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
