/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import type MWBot from 'mwbot';
import { extensionContext } from '../../extension';
import { Action, ContextModel, alterNativeValues, Prop } from './args';
import { GetViewResult, ViewConverter } from '../../interface_definition/getViewInterface';
import { getHost } from '../host_function/host';
import { getBotOrDefault } from './bot';
import { getContentInfo } from './page';
import { showMWErrorMessage } from './errMsg';

/**
 * webview panel
 */
let previewCurrentPanel: vscode.WebviewPanel | undefined;

export async function getPreview(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const host: string | undefined = await getHost();
    if (!host) { return undefined; }

    /** document text */
    const sourceText: string | undefined = vscode.window.activeTextEditor?.document.getText();
    if (!sourceText) { return undefined; }
    const { content } = getContentInfo(sourceText);

    /** arguments */
    const args: Record<string, string> = {
        'action': Action.parse,
        'text': content,
        'prop': alterNativeValues(
            Prop.text,
            Prop.displayTitle,
            Prop.categoriesHTML,
            (config.get("getCss") ? Prop.headHTML : undefined)
        ),
        'contentmodel': ContextModel.wikitext,
        'pst': "why_not",
        'disableeditsection': "yes"
    };

    const viewerTitle = "WikitextPreviewer";

    // if no panel, creat one
    if (!previewCurrentPanel) {
        // if have not, try to creat new one.
        previewCurrentPanel = vscode.window.createWebviewPanel(
            "previewer", viewerTitle, vscode.ViewColumn.Beside, {
            enableScripts: config.get("enableJavascript"),
        });
        // register for events that release resources.
        previewCurrentPanel.onDidDispose(() => {
            previewCurrentPanel = undefined;
        }, null, extensionContext.subscriptions);
    }

    const tBot: MWBot | undefined = await getBotOrDefault();
    if (!tBot) {
        return undefined;
    }

    const baseHref: string = config.get("transferProtocol") + host + config.get("articlePath");

    getView(previewCurrentPanel, viewerTitle, args, tBot, baseHref);
}

export async function getPageView(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const host: string | undefined = await getHost();
    if (!host) { return undefined; }

    const pageTitle: string | undefined = await vscode.window.showInputBox({
        prompt: "Enter the page name here.",
        ignoreFocusOut: true
    });
    if (!pageTitle) { return undefined; }

    const args: Record<string, string> = {
        'action': Action.parse,
        'page': pageTitle,
        'prop': alterNativeValues(
            Prop.text,
            Prop.displayTitle,
            Prop.categoriesHTML,
            (config.get("getCss") ? Prop.headHTML : undefined)
        ),
    };
    if (config.get("redirects")) {
        args['redirects'] = "true";
    }

    const tBot: MWBot | undefined = await getBotOrDefault();
    if (!tBot) {
        return undefined;
    }

    const baseHref: string = config.get("transferProtocol") + host + config.get("articlePath");

    getView("pageViewer", "WikiViewer", args, tBot, baseHref);
}

/**
 *
 * @param currentPanel where to show
 * @param viewerTitle viewer title
 * @param args post args
 * @param tBot account
 * @param baseURI url base
 * @returns task
 */
export async function getView(currentPanel: vscode.WebviewPanel | string, viewerTitle: string, args: Record<string, string>, tBot: MWBot, baseURI: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Getting view...");
    try {
        const result = await tBot.request(args);
        const re: GetViewResult = ViewConverter.getViewResultToJson(result);
        if (!re.parse) { return undefined; }

        const baseElem = `<base href="${baseURI}" />"`;

        const style = `<style>${config.get("previewCssStyle")}</style>`;

        const htmlHead: string = re.parse.headhtml?.["*"]?.replace("<head>", "<head>" + baseElem + style) ?? `<!DOCTYPE html><html><head>${baseElem + style}</head><body>`;
        const htmlText: string = re.parse.text?.["*"] || "";
        const htmlCategories: string = re.parse.categorieshtml?.["*"] ? "<hr />" + re.parse.categorieshtml?.["*"] : "";
        const htmlEnd = "</body></html>";

        const html: string = htmlHead + htmlText + htmlCategories + htmlEnd;

        if (typeof (currentPanel) === "string") {
            currentPanel = vscode.window.createWebviewPanel(currentPanel, viewerTitle, vscode.ViewColumn.Active, { enableScripts: config.get("enableJavascript") });
        }
        currentPanel.webview.html = html;
        currentPanel.title = `${viewerTitle}: ${re.parse.displaytitle}`;
    }
    catch (error) {
        showMWErrorMessage('getView', error);
    }
    finally {
        barMessage.dispose();
    }
}
