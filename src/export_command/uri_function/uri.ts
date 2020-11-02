/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export function baseUriProcess(uri: vscode.Uri) {
    // vscode://rowewilsonfrederiskholme.wikitext/hello?arg=1&arg2={"this"="that"}
    switch (uri.path) {
        case "/WriteLine":
        case "/Write":
            vscode.window.showInformationMessage(uri.query);
            break;
        case "ViewPage":

            break;
        case "EditPage":

            break;
        default:
            break;
    }
}
