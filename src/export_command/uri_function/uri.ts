/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { action, alterNativeValues, prop, contextModel } from '../wikimedia_function/args';
import { getView } from '../wikimedia_function/view';

export function baseUriProcess(uri: vscode.Uri) {
    // vscode://rowewilsonfrederiskholme.wikitext/WriteLine?你好，世界！
    switch (uri.path) {
        case "/WriteLine":
        case "/Write":
            write(uri.query);
            break;
        case "ViewPage":
            viewPage(uri.query);
            break;
        case "EditPage":

            break;
        default:
            break;
    }
}

function write(query: string): void {
    vscode.window.showInformationMessage(query);
}

async function viewPage(query: string): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const args: any = {
        'action': action.parse,
        'prop': alterNativeValues(
            prop.text,
            prop.displayTitle,
            prop.categoriesHTML,
            (config.get("getCss") ? prop.headHTML : undefined)
        ),
    };
    if (config.get("redirects")) {
        args['redirects'] = "true";
    }

    const pars: IParameters = parseArgs(query);
    if (pars["PageID"]) {
        args["pageid"] = pars["PageID"];
    }
    else if (pars["Page"]) {
        args["page"] = pars["Page"];
    }
    else if (pars["Text"]) {
        args["text"] = pars["Text"];
        args['contentmodel'] = contextModel.wikitext;
        args['pst'] = "yes";
    }
    else {
        return undefined;
    }

    getView("pageViewer", "WikiViewer", args);
}

interface IParameters {
    [Key: string]: string;
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
            pars[item] = "";
        }
    }
    return pars;
}
