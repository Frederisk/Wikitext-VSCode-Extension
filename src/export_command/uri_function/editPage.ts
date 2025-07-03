/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import MWBot from 'mwbot';
import { getDefaultBot } from '../wikimedia_function/bot';
import { Action, alterNativeValues, Prop, RvProp } from '../wikimedia_function/args';
import { getPageCode } from '../wikimedia_function/page';
import { isRemoteBot, parseArgs } from './uri';

export async function editPage(query: string): Promise<void> {
    // vscode-insiders://rowewilsonfrederiskholme.wikitext/PullPage?Title=1
    const pars: Record<string, string> = parseArgs(query);

    const transferProtocolPar = pars["TransferProtocol"] ?? '';
    const siteHostPar = pars["SiteHost"] ?? '';
    const apiPathPar = pars["APIPath"] ?? '';

    const tBot: MWBot | undefined = isRemoteBot(pars) ? new MWBot({
        apiUrl: transferProtocolPar + siteHostPar + apiPathPar
    }) : await getDefaultBot();

    const title: string | undefined = pars['Title'];

    if (!title || !tBot) {
        vscode.window.showErrorMessage(`${!title ? 'title ' : ''}${!tBot ? 'tbot ' : ''}is undefined or empty.`);
        return undefined;
    }

    const args: Record<string, string> = {
        'action': Action.query,
        'prop': Prop.reVisions,
        'rvprop': alterNativeValues(RvProp.content, RvProp.ids),
        'rvslots': "*",
        'titles': title
    };

    const document: vscode.TextDocument | undefined = await getPageCode(args, tBot);
    if (document === undefined) { return undefined; }

    vscode.window.showTextDocument(document);
}
