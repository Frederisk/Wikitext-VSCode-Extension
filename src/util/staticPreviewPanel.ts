import * as vscode from 'vscode';

import type { WebviewPanel, ExtensionContext } from 'vscode';

let staticPreviewPanel: WebviewPanel | undefined;

export function showStaticPreview(html: string, enableJavascript: boolean, extension: ExtensionContext): void {
    // if no panel, create one.
    if (staticPreviewPanel === undefined) {
        // if there is no panel, try to create new one.
        staticPreviewPanel = vscode.window.createWebviewPanel('previewer', 'WikitextPreviewer', vscode.ViewColumn.Beside, { enableScripts: enableJavascript });
        // register for events that release resources.
        staticPreviewPanel.onDidDispose((): void => staticPreviewPanel = undefined, undefined, extension.subscriptions);
        // TODO: rewrite this.
    }
    // update the html.
    staticPreviewPanel.webview.html = html;
}
