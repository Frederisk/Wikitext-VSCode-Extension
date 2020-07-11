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
import { getPreview } from './preview';
import { setHost } from './host';
import { foo } from './foo';
// import * as mwbot from 'mwbot';
// import { resolve } from 'dns';
// import { homedir } from 'os';
// import { URL } from 'url';
// import { reporters } from 'mocha';
// import { rejects, strict } from 'assert';
// import { isNull } from 'util';

export let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext): void {
    extensionContext = context;
    console.log("Extension is active.");
    //const MWBot = require('mwbot');
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.setHost", setHost));
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.getPreview", getPreview));
    
    context.subscriptions.push(vscode.commands.registerCommand("wikitext.test", foo));
}

export function deactivate(): void {
    console.log("Extension is deactivate.");
}
