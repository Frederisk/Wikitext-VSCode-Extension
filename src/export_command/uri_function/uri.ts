/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { action, alterNativeValues, prop, contextModel } from '../wikimedia_function/args';
import { } from '../wikimedia_function/core';
import { getView } from '../wikimedia_function/view';

export function baseUriProcess(uri: vscode.Uri): void {
    // vscode://rowewilsonfrederiskholme.wikitext/WriteLine?你好，世界！
    switch (uri.path) {
        case "/WriteLine":
        case "/Write":
            write(uri.query);
            break;
        case "/ViewPage":
            viewPage(uri.query);
            break;
        case "/ReadPage":
            readPage(uri.query);
            break;
        default:
            break;
    }
}

function write(query: string): void {
    vscode.window.showInformationMessage(query);
}

function viewPage(query: string): void {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    // default args value
    const args: any = { 'action': action.parse };

    const pars: IParameters = parseArgs(query);

    args["prop"] = pars["Prop"] ?? alterNativeValues(
        prop.text,
        prop.displayTitle,
        prop.categoriesHTML,
        (config.get("getCss") ? prop.headHTML : undefined)
    );

    args["text"] = pars["Text"] ?? undefined;
    args["title"] = pars["Title"] ?? undefined;
    args["summary"] = pars["Summary"] ?? undefined;

    args["revid"] = pars["RevID"] ?? undefined;
    args["page"] = pars["Page"] ?? undefined;
    args["pageid"] = pars["PageID"] ?? undefined;
    args["oldid"] = pars["OldID"] ?? undefined;

    args["redirects"] = pars["Redirects"] ?? undefined;

    args["pst"] = pars["PST"] ?? "true";
    args["onlypst"] = pars["OnlyPST"] ?? undefined;

    args["section"] = pars["Section"] ?? undefined;
    args["sectiontitle"] = pars["SectionTitle"] ?? undefined;

    args["useskin"] = pars["UseSkin"] ?? undefined;
    args["contentformat"] = pars["ContentFormat"] ?? undefined;
    args["contentmodel"] = pars["ContentModel"] ?? contextModel.wikitext;

    let tbot: MWBot = new MWBot(
        {
            apiUrl: pars["TransferProtocol"] + pars["SiteHost"] + ["APIPath"]
        }
    );

    const baseHref = (pars["TransferProtocol"] ?? "https://") + pars["SiteHost"] + pars["ArticlePath"];

    getView("pageViewer", "WikiViewer", args, tbot, baseHref);
}

function readPage(query: string): void {
    const pars: IParameters = parseArgs(query);



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
