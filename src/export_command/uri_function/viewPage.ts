/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import MWBot from 'mwbot';
import { getDefaultBot } from '../wikimedia_function/bot';
import { Action, alterNativeValues, Prop } from '../wikimedia_function/args';
import { showViewer } from '../wikimedia_function/view';
import { isRemoteBot, parseArgs } from './uri';

export async function viewPage(query: string): Promise<void> {
    function setArgs(par: string, defaultValue?: string): void {
        const value = pars[par] ?? defaultValue;
        if (value !== undefined) {
            args[par.toLowerCase()] = value;
        }
    }

    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    const pars: Record<string, string> = parseArgs(query);

    const transferProtocolPar = pars["TransferProtocol"] ?? '';
    const siteHostPar = pars["SiteHost"] ?? '';
    const apiPathPar = pars["APIPath"] ?? '';

    const tBot: MWBot | undefined = isRemoteBot(pars) ? new MWBot({
        apiUrl: transferProtocolPar + siteHostPar + apiPathPar
    }) : await getDefaultBot();

    if (!tBot) {
        vscode.window.showErrorMessage("The bot is undefined or empty.");
        return undefined;
    }

    const baseHref: string = isRemoteBot(pars)
        ? transferProtocolPar + siteHostPar + apiPathPar
        : config.get("transferProtocol") as string + config.get('host') + config.get("articlePath");

    // args value
    const args: Record<string, string> = { 'action': Action.parse };
    setArgs('Prop', alterNativeValues(
        Prop.text,
        Prop.displayTitle,
        Prop.categoriesHTML,
        (config.get("getCss") ? Prop.headHTML : undefined)
    ));
    const undefParNames: string[] = ['Text', 'Title', 'Summary', 'RevID', 'Page',
        'PageID', 'OldID', 'Redirects', 'OnlyPST', 'Section',
        'SectionTitle', 'UseSkin', 'ContentFormat', 'ContentModel'];
    undefParNames.forEach((value: string): void => setArgs(value));
    setArgs("PST", "true");

    showViewer("pageViewer", "WikiViewer", args, tBot, baseHref);
}
