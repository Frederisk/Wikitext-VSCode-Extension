/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as mwbot from 'mwbot';
import { extensionContext } from '../../extension';
import { action, contextModel, alterNativeValues, prop } from './args';
import { GetViewResult, GetViewConvert, Parse } from '../../interface_definition/getViewInterface';
import { bot } from './bot';
import { getHost } from '../host_function/host';

/**
 * webview panel
 */
let currentPlanel: vscode.WebviewPanel | undefined = undefined;

export async function getPreview(): Promise<void> {
    function showHtmlInfo(info: string): string {
        return `<!DOCTYPE html><html><body><h2>${info}</h2></body></html>`;
    }

    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const isGetCss: boolean | undefined = config.get("getCss");
    const host: string | undefined = await getHost();
    if (!host) { return undefined; }

    // get text
    const textEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    // check is there an opened document.
    if (!textEditor) {
        vscode.window.showInformationMessage("No Active Wikitext Editor.");
        // if have not, cancle.
        return undefined;
    }
    /** document text */
    const sourceText: string = textEditor.document.getText();

    // if no planel, creat one
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

    // show loading status
    currentPlanel.webview.html = showHtmlInfo("Loading...");


    const tbot: MWBot = bot ?? new mwbot({
        apiUrl: "https://" + host + config.get("apiPath")
    });

    /** arguments */
    const args = {
        'action': action.parse,
        'text': sourceText,
        'prop': alterNativeValues(prop.text, prop.displayTitle, prop.categoriesHTML, (isGetCss ? prop.headHTML : undefined)),
        'contentmodel': contextModel.wikitext,
        'pst': "whynot",
        'disableeditsection': "yes"
    };

    try {
        const result = await tbot?.request(args);
        const re: GetViewResult = GetViewConvert.toGetViewResult(result);
        // confirm the presence of the panel.
        if (!currentPlanel) {
            vscode.window.showInformationMessage("Preview Planel Not be Opened.");
            return undefined;
        }
        if (!re.parse) { return undefined; }

        // show result.
        currentPlanel.webview.html = processHTML(re.parse, host, isGetCss ?? false);
        currentPlanel.title = `WikitextPreviewer: ${re.parse.displaytitle}`;
    }
    catch (error) {
        vscode.window.showErrorMessage(`${error.code}! ${error.info}`);
    }
}

export async function getPageView(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const isGetCss: boolean | undefined = config.get("getCss");
    const host: string | undefined = await getHost();
    if (!host) { return undefined; }

    const pageTitle: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here.",
        ignoreFocusOut: true
    });
    if (!pageTitle) { return undefined; }

    const tbot: MWBot = bot ?? new mwbot({
        apiUrl: "https://" + host + config.get("apiPath")
    });


    const args: any = {
        'action': action.parse,
        'page': pageTitle,
        'prop': alterNativeValues(prop.text, prop.displayTitle, prop.categoriesHTML, (isGetCss ? prop.headHTML : undefined)),
    };
    if (config.get("redirects")) {
        args['redirects'] = "true";
    }

    try {
        const result = await tbot.request(args);
        const re: GetViewResult = GetViewConvert.toGetViewResult(result);
        if (!re.parse) { return undefined; }

        // open planel
        let currentPlanel: vscode.WebviewPanel = vscode.window.createWebviewPanel("pageViewer", "PageViewer", vscode.ViewColumn.Active, {
            enableScripts: config.get("enableJavascript"),
        });
        currentPlanel.webview.html = processHTML(re.parse, host, isGetCss ?? false);
        currentPlanel.title = `WikiViewer: ${re.parse.displaytitle}`;

    }
    catch (error) {
        vscode.window.showErrorMessage(`ErrorCode:${error.code}| ErrorInfo:${error.info}`);
    }
}

function processHTML(parse: Parse,host: string , isGetCss: boolean) : string {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const htmlHead : string = isGetCss ? (parse.headhtml?.["*"]?.replace("<head>", `<head><base href="https://${host + config.get("articalPath")}">`) || ``) : `<!DOCTYPE html><html><head><base href="https://${host + config.get("articalPath")}" /></head><body>`;
    const htmlEnd: string = `</body></html>`;

    const html = htmlHead + parse?.text?.["*"] + "<hr />" + parse?.categorieshtml?.["*"] + htmlEnd;

    return html;
}
