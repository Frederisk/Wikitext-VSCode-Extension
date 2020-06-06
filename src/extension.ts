/*
The MIT License (MIT)

Copyright (c) 2020 Rowe Wilson Frederisk Holme

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import * as vscode from 'vscode';
import * as querystring from 'querystring';
import { request } from 'https';
import { ClientRequest, RequestOptions, IncomingMessage } from 'http';
import { resolve } from 'dns';
import { homedir } from 'os';
import { URL } from 'url';
import { reporters } from 'mocha';
import { rejects, strict } from 'assert';
import { isNull } from 'util';

// 預覽WebViewPanel
let currentPlanel: vscode.WebviewPanel | undefined = undefined;
let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext): void {
    extensionContext = context;
    console.log("Extension is active.");
    // context.subscriptions.push(vscode.commands.registerCommand("wikitext.test", testFunction));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.setHost", setHost));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.getPreview", getPreview));
    //context.subscriptions.push(vscode.commands.registerCommand("", testFunction));
    getHost();
}

export function deactivate(): void {
    console.log("Extension is deactivate.");
}

function testFunction(): void {
    extensionContext.globalState.update("host", undefined);
    const args: string = querystring.stringify({
        action: "query",
        format: "json",
        meta: "tokens",
        type: "login"
    });

    const host = getHost();

    // let opts: RequestOptions = {
    //     hostname: host,
    //     path: "/w/api.php",
    //     method: "POST",
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Content-Length': Buffer.byteLength(args)
    //     }
    // };
    // const req: ClientRequest = request(opts, requestCallback);
    // req.write(args);
    // req.end();
}


function setHost(): void {
    vscode.window.showInputBox({
        prompt: "Please input the host of previewer.",
        value: extensionContext.globalState.get("host") ?? "en.wikipedia.org",
        ignoreFocusOut: false
    }).then(resule => {
        extensionContext.globalState.update("host", resule);
    });
}

function getHost(): string | undefined {
    const host: string | undefined = extensionContext.globalState.get("host");
    if (!host) {
        vscode.window.showWarningMessage("No Host Be Defined!\nYou haven't defined the host of previewer yet, please input host value in the dialog box and try again.", "Edit", "Cancel").then(result => {
            if (result?.localeCompare("Edit")) {setHost();}
        });
        return undefined;
    }
    else {
        return host;
    }
}

function getPreview(): void {
    const textEditor = vscode.window.activeTextEditor;
    // 是否有開啟的文檔;;
    if (!textEditor) {
        vscode.window.showInformationMessage("No Active Wikitext Editor.");
        // 未有則取消渲染
        return undefined;
    }
    // 取得host
    let host: string | undefined = getHost(); //extensionContext.globalState.get("host");
    if(!host) { return undefined; }
    // if (!host) {
    //     //取得失敗，顯示警告
    //     vscode.window.showWarningMessage("No Host Be Defined!\nYou haven't defined the host of previewer yet, please input host value in the dialog box to start working.", "Edit", "Cancel").then(result => {
    //         if (result === "Edit") {
    //             // 要求輸入host
    //             vscode.window.showInputBox({
    //                 prompt: "Please input the host of previewer.",
    //                 value: "en.wikipedia.org"
    //             }).then(resule => {
    //                 extensionContext.globalState.update("host", resule);
    //                 getPreview();
    //             });
    //         }
    //     });
    //     return undefined;
    // }
    // 是否有開啟的WebViewPanel
    if (!currentPlanel) {
        // 未有則嘗試創建
        currentPlanel = vscode.window.createWebviewPanel(
            "previewer", "WikitextPreviewer", vscode.ViewColumn.Beside, {
            enableScripts: true
        });
        // 註冊釋放資源事件
        currentPlanel.onDidDispose(() => {
            currentPlanel = undefined;
        }, null, extensionContext.subscriptions);
    }
    // 裝載狀態。
    currentPlanel.webview.html = showHtmlInfo("Loading...");
    // 擷取文本內容
    const sourceText: string = textEditor.document.getText();
    // 引數
    const args: string = querystring.stringify({
        action: "parse",
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
    console.log(extensionContext.globalState.get("host"));
    // 目標頁面
    const opt: RequestOptions = {
        hostname: host,
        // hostname: "zh.wikipedia.org",
        path: "/w/api.php",
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
        else{
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
