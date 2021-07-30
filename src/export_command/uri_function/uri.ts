/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { editPage } from './editPage';
import { viewPage } from './viewPage';
import { writeLine } from './writeLine';

export function baseUriProcess(uri: vscode.Uri): void {
    // vscode://rowewilsonfrederiskholme.wikitext/WriteLine?你好，世界！
    switch (uri.path) {
        case "/WriteLine":
        case "/Write":
            writeLine(uri.query);
            break;
        case "/Edit":
        case "/EditPage":
        case "/PullPage":
        case "/ReadPage":
            editPage(uri.query);
            break;
        case "/ViewPage":
            viewPage(uri.query);
            break;
        default:
            break;
    }
}

export interface IParameters {
    [Key: string]: string;
}

export function isRemoteBot(pars: IParameters): boolean {
    return !!(pars['RemoteBot'] || pars['SiteHost']);
}

export function parseArgs(query: string): IParameters {
    const queries = query.split("&");
    let pars: IParameters = {};
    for (const item of queries) {
        const eq: number = item.indexOf("=");
        if (eq >= 0) {
            pars[item.substring(0, eq)] = item.substring(eq + 1);
        }
        else {
            pars[item] = '';
        }
    }
    return pars;
}
