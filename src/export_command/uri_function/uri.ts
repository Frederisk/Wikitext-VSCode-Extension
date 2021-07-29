/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as MWBot from 'mwbot';
import { Action, alterNativeValues, Prop, ContextModel, RvProp } from '../wikimedia_function/args';
import { getView } from '../wikimedia_function/view';
import { getPageCode } from '../wikimedia_function/core';
import { getBot } from '../wikimedia_function/bot';
import { getHost } from '../host_function/host';

export function baseUriProcess(uri: vscode.Uri): void {
    // vscode://rowewilsonfrederiskholme.wikitext/WriteLine?你好，世界！
    switch (uri.path) {
        case "/WriteLine":
        case "/Write":
            write(uri.query);
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

async function editPage(query: string): Promise<void> {
    // vscode-insiders://rowewilsonfrederiskholme.wikitext/PullPage?Title=1
    const pars: IParameters = parseArgs(query);

    const tbot: MWBot | undefined = isRemoteBot(pars) ? new MWBot({
        apiUrl: pars["TransferProtocol"] + pars["SiteHost"] + pars["APIPath"]
    }) : await getBot();

    const title: string | undefined = pars['Title'];

    if (!title || !tbot) {
        vscode.window.showErrorMessage(`${!title ? 'title ' : ''}${!tbot ? 'tbot ' : ''}is undefined or empty.`);
        return undefined;
    }

    const args: any = {
        'action': Action.query,
        'prop': Prop.reVisions,
        'rvprop': alterNativeValues(RvProp.content, RvProp.ids),
        'rvslots': "*",
        'titles': title
    };
    console.log(args);
    console.log(tbot);
    getPageCode(args, tbot);
}

function write(query: string): void {
    vscode.window.showInformationMessage(query);
}

async function viewPage(query: string): Promise<void> {
    function setArgs(par: string, defaultValue: string | undefined = undefined) {
        args[par.toLowerCase()] = pars[par] ?? defaultValue;
    }

    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const pars: IParameters = parseArgs(query);

    const tbot: MWBot | undefined = isRemoteBot(pars) ? new MWBot({
        apiUrl: pars["TransferProtocol"] + pars["SiteHost"] + pars["APIPath"]
    }) : await getBot();

    if (!tbot) {
        vscode.window.showErrorMessage(`${!tbot ? 'tbot ' : ''}is undefined or empty.`);
        return undefined;
    }

    // TODO: getHost()
    const baseHref: string = isRemoteBot(pars) ? pars["TransferProtocol"] + pars["SiteHost"] + pars["APIPath"] : config.get("transferProtocol") + (await getHost() || '') + config.get("articlePath");

    // args value
    const args: any = { 'action': Action.parse };
    setArgs('Prop', alterNativeValues(
        Prop.text,
        Prop.displayTitle,
        Prop.categoriesHTML,
        (config.get("getCss") ? Prop.headHTML : undefined)
    ));
    let undefParNames = ['Text', 'Title', 'Summary', 'RevID', 'Page',
        'PageID', 'OldID', 'Redirects', 'OnlyPST', 'Section',
        'SectionTitle', 'UseSkin', 'ContentFormat', 'ContentModel'];
    undefParNames.forEach((value: string): void => setArgs(value));
    setArgs("PST", "true");

    getView("pageViewer", "WikiViewer", args, tbot, baseHref);
}

interface IParameters {
    [Key: string]: string;
}

function isRemoteBot(pars: IParameters): boolean {
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
