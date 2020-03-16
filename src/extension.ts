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
import { ClientRequest, RequestOptions } from 'http';
import { resolve } from 'dns';
import { homedir } from 'os';
import { URL } from 'url';
import { reporters } from 'mocha';
import { rejects, strict } from 'assert';

// 預覽WebViewPanel
let currentPlanel: vscode.WebviewPanel | undefined = undefined;

export function activate(context: vscode.ExtensionContext) {
    console.log("Extension is active.");
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.helloWorld", () => {
        const textEditor = vscode.window.activeTextEditor;
        // 是否有開啟的文檔
        if (!textEditor) {
            vscode.window.showInformationMessage("No Active Wikitext Editor.");
            // 未有則取消渲染
            return undefined;
        }
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
            }, null, context.subscriptions);
        }
        // 擷取文本內容
        const sourceText: string = textEditor.document.getText();
        let result: string = "";
        // let args: string = querystring.stringify({
        //     "action": 'flow-parsoid-utils',
        //     "format": 'json',

        //     "from": 'wikitext',
        //     "to": 'html',
        //     "title": 'Main_Page',
        //     "content": sourceText
        //     // "pageid": '0000'
        // });
        let args: string = querystring.stringify({
            action:"parse",
            format:"json",

            text:sourceText,
            contentmodel:"wikitext",

        });

        let opt: RequestOptions = {
            hostname: "zh.wikipedia.org",
            path: "/w/api.php",
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': args.length
            }
        };
        const req: ClientRequest = request(
            opt, response => {
                const chunks: any = [];
                console.log(response.statusCode);
                response.on('data', chunk => { chunks.push(chunk); });
                response.on('end', () => {
                    const jsontext = Buffer.concat(chunks).toString();
                    console.log(jsontext);

                    // result = JSON.parse(jsontext)["flow-parsoid-utils"]["content"];
                    result = JSON.parse(jsontext)["parse"]["text"]["*"];

                    console.log(result);
                    if (!currentPlanel) {
                        vscode.window.showInformationMessage("Preview Planel Not be Opened.");
                        return undefined;
                    }
                    const html = unescape(result);
                    currentPlanel.webview.html = html;
                });
                response.on('error', error => {
                    vscode.window.showWarningMessage("Fresh Error:" + error.name);
                });
            });
        req.write(args);
        req.end();
    }));
}

export function deactivate() {
    console.log("Extension is deactivate.");
}
