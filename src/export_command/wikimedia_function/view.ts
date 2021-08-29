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
import { getBot } from './bot';
import { getContentInfo } from './core';

/**
 * webview panel
 */
let previewCurrentPlanel: vscode.WebviewPanel | undefined;

export async function getPreview(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const host: string | undefined = await getHost();
    if (!host) { return undefined; }

    /** document text */
    let sourceText: string | undefined = vscode.window.activeTextEditor?.document.getText();
    if (!sourceText) { return undefined; }
    const { content } = getContentInfo(sourceText);

    /** arguments */
    const args = {
        'action': Action.parse,
        'text': content,
        'prop': alterNativeValues(
            Prop.text,
            Prop.displayTitle,
            Prop.categoriesHTML,
            (config.get("getCss") ? Prop.headHTML : undefined)
        ),
        'contentmodel': ContextModel.wikitext,
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

    const tbot: MWBot | undefined = await getBot();
    if (!tbot) {
        return undefined;
    }

    const baseHref: string = config.get("transferProtocol") + host + config.get("articlePath");

    getView(previewCurrentPlanel, viewerTitle, args, tbot, baseHref);
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

    const tbot: MWBot | undefined = await getBot();
    if (!tbot) {
        return undefined;
    }

    const baseHref: string = config.get("transferProtocol") + host + config.get("articlePath");

    getView("pageViewer", "WikiViewer", args, tbot, baseHref);
}

/**
 *
 * @param currentPlanel where to show
 * @param viewerTitle viewer title
 * @param args post args
 * @param tbot account
 * @param baseURI urlbase
 * @returns task
 */
export async function getView(currentPlanel: vscode.WebviewPanel | string, viewerTitle: string, args: Record<string, string>, tbot: MWBot, baseURI: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Getting view...");
    try {
        const result = await tbot.request(args);
        const re: GetViewResult = ViewConverter.getViewResultToJson(result);
        if (!re.parse) { return undefined; }

        const baseElem = `<base href="${baseURI}" />"`;

        const style = `<style>${config.get("previewCssStyle")}</style>`;

        const htmlHead: string = re.parse.headhtml?.["*"]?.replace("<head>", "<head>" + baseElem + style) ?? `<!DOCTYPE html><html><head>${baseElem + style}</head><body>`;
        const htmlText: string = re.parse.text?.["*"] || "";
        const htmlCategories: string = re.parse.categorieshtml?.["*"] ? "<hr />" + re.parse.categorieshtml?.["*"] : "";
        const htmlEnd: string = "</body></html>";

        const html: string = htmlHead + htmlText + htmlCategories + htmlEnd;

        if (typeof (currentPlanel) === "string") {
            currentPlanel = vscode.window.createWebviewPanel(currentPlanel, viewerTitle, vscode.ViewColumn.Active, { enableScripts: config.get("enableJavascript") });
        }
        currentPlanel.webview.html = html;
        currentPlanel.title = `${viewerTitle}: ${re.parse.displaytitle}`;
    }
    catch (error: any) {
        vscode.window.showErrorMessage(`ErrorCode:${error.code}| ErrorInfo:${error.info}`);
    }
    finally {
        barMessage.dispose();
    }
}
