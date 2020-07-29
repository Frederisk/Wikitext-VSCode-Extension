import * as vscode from 'vscode';
import * as querystring from 'querystring';
import { request } from 'https';
import { ClientRequest, RequestOptions, IncomingMessage } from 'http';
import { getHost } from './host';
import { extensionContext } from './extension';
import { action } from './mediawiki';


/**
 * WebviewPanel
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
    // 擷取文本內容
    const sourceText: string = textEditor.document.getText();
    // 引數
    const args: string = querystring.stringify({
        action: action.parse,
        format: "json",
        text: sourceText,
        contentmodel: "wikitext"
        // action: "flow-parsoid-utils",
        // format: "json",
        // from: "wikitext",
        // to: "html",
        // title: "Main_Page",
        // content: sourceText
    });
    // 目標頁面
    const opts: RequestOptions = {
        hostname: host,
        // hostname: "zh.wikipedia.org",
        path: vscode.workspace.getConfiguration("wikitext").get("apiPath"),
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(args)
        }
    };
    const req: ClientRequest = request(opts, requestCallback);
    // 寫入參數
    req.write(args);
    // 尋求請求結束
    req.end();
}

function requestCallback(response: IncomingMessage): void {
    const chunks: Uint8Array[] = [];
    // 擷取位元資料
    response.on('data', data => {
        console.log(response.statusCode);
        chunks.push(data);
    });
    // 結束事件
    response.on('end', () => {
        console.log(response.statusCode);
        //console.log(jsontext);
        // 解析結果。
        const jsontext: string = Buffer.concat(chunks).toString();
        const json: any = JSON.parse(jsontext);
        // const warnInfo: string| undefined = json["warnings"]["parse"]["*"];
        // const errorInfo: string| undefined = json;
        const result: string | undefined = unescape(json["parse"]["text"]["*"]);
        // let result: string = JSON.parse(jsontext)["flow-parsoid-utils"]["content"];
        // console.log(result);
        // 確認面板存在狀態
        if (!currentPlanel) {
            vscode.window.showInformationMessage("Preview Planel Not be Opened.");
            return undefined;
        }
        // 解碼內容並顯示
        if (result) {
            currentPlanel.webview.html = result;
        }
        // 未有取得內容，通知錯誤。
        else {
            currentPlanel.webview.html = showHtmlInfo("ERROR_FRESH_FAIL");
            vscode.window.showWarningMessage("Fresh Error.");
        }
    });
    // 異常狀態
    response.on('error', error => {
        if (currentPlanel) {
            currentPlanel.webview.html = showHtmlInfo("ERROR_FRESH_FAIL");
        }
        vscode.window.showWarningMessage("Fresh Error:\n" + error.name);
    });
}

function showHtmlInfo(info: string): string {
    return `
        <body>
            <section>
                <h2>
                    ${info}
                </h2>
            </section>
        </body>
    `;
}
