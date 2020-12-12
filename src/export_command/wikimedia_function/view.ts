/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as mwbot from 'mwbot';
import { extensionContext } from '../../extension';
import { action, contextModel, alterNativeValues, prop } from './args';
import { GetViewResult, GetViewConvert } from '../../interface_definition/getViewInterface';
import { bot } from './bot';
import { getHost } from '../host_function/host';

/**
 * webview panel
 */
let previewCurrentPlanel: vscode.WebviewPanel | undefined = undefined;

export async function getPreview(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const host: string | undefined = await getHost();
    if (!host) { return undefined; }

    /** document text */
    let sourceText: string | undefined = vscode.window.activeTextEditor?.document.getText();
    if (!sourceText) { return undefined; }

    // remove
    sourceText = sourceText?.replace(/\<%\-\-\s*\[PAGE_INFO\][\s\S]*?\[END_PAGE_INFO\]\s*\-\-%\>\s*/, "");

    /** arguments */
    const args = {
        'action': action.parse,
        'text': sourceText,
        'prop': alterNativeValues(
            prop.text,
            prop.displayTitle,
            prop.categoriesHTML,
            (config.get("getCss") ? prop.headHTML : undefined)
        ),
        'contentmodel': contextModel.wikitext,
        'pst': "whynot",
        'disableeditsection': "yes"
    };

    const viewerTitle: string = "WikitextPreviewer";

    // if no planel, creat one
    if (!previewCurrentPlanel) {
        // if have not, try to creat new one.
        previewCurrentPlanel = vscode.window.createWebviewPanel(
            "previewer", viewerTitle, vscode.ViewColumn.Beside, {
            enableScripts: config.get("enableJavascript"),
        });
        // register for events that release resources.
        previewCurrentPlanel.onDidDispose(() => {
            previewCurrentPlanel = undefined;
        }, null, extensionContext.subscriptions);
    }
    getView(previewCurrentPlanel, viewerTitle, args);
}

export async function getPageView(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const pageTitle: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here.",
        ignoreFocusOut: true
    });
    if (!pageTitle) { return undefined; }

    const args: any = {
        'action': action.parse,
        'page': pageTitle,
        'prop': alterNativeValues(
            prop.text,
            prop.displayTitle,
            prop.categoriesHTML,
            (config.get("getCss") ? prop.headHTML : undefined)
        ),
    };
    if (config.get("redirects")) {
        args['redirects'] = "true";
    }

    // Show
    getView("pageViewer", "WikiViewer", args);
}

export async function getView(currentPlanel: vscode.WebviewPanel | string, viewerTitle: string, args: any): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    if (typeof (currentPlanel) === "string") {
        currentPlanel = vscode.window.createWebviewPanel(currentPlanel, viewerTitle, vscode.ViewColumn.Active, { enableScripts: config.get("enableJavascript"), });
    }

    function showHtmlInfo(info: string): string {
        return `<!DOCTYPE html><html><body><h2>${info}</h2></body></html>`;
    }

    const host: string | undefined = await getHost();
    if (!host) { return undefined; }
    const tbot: MWBot = bot ?? new mwbot({
        apiUrl: "https://" + host + config.get("apiPath")
    });

    currentPlanel.webview.html = showHtmlInfo("Loading...");

    try {
        const result = await tbot.request(args);
        const re: GetViewResult = GetViewConvert.GetViewResultToJson(result);
        if (!re.parse) { return undefined; }

        const articlePath = config.get("articlePath");
        const baseHref = `<base href="https://${host + articlePath}" />"`;

        const htmlHead: string = config.get("getCss") as boolean && re.parse.headhtml?.["*"]?.replace("<head>", "<head>" + baseHref)  || `<!DOCTYPE html><html><head>${baseHref}</head><body>`;
        const htmlText: string = re.parse.text?.["*"] || "";
        const htmlCategories: string = re.parse.categorieshtml?.["*"] ? "<hr />" + re.parse.categorieshtml?.["*"] : "";
        const htmlEnd: string = "</body></html>";

        const html: string = htmlHead + htmlText + htmlCategories + htmlEnd;

        currentPlanel.webview.html = html;
        currentPlanel.title = `${viewerTitle}: ${re.parse.displaytitle}`;
    }
    catch (error) {
        vscode.window.showErrorMessage(`ErrorCode:${error.code}| ErrorInfo:${error.info}`);
        if (currentPlanel) {
            currentPlanel.webview.html = showHtmlInfo("Error");
        }
    }
}
