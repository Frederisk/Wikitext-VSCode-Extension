import * as vscode from 'vscode';
import MWBot from 'mwbot';
import { getBot } from '../wikimedia_function/bot';
import { Action, alterNativeValues, Prop, RvProp } from '../wikimedia_function/args';
import { getPageCode } from '../wikimedia_function/page';
import { isRemoteBot, parseArgs } from './uri';

export async function editPage(query: string): Promise<void> {
    // vscode-insiders://rowewilsonfrederiskholme.wikitext/PullPage?Title=1
    const pars: Record<string, string> = parseArgs(query);

    const tbot: MWBot | undefined = isRemoteBot(pars) ? new MWBot({
        apiUrl: pars["TransferProtocol"] + pars["SiteHost"] + pars["APIPath"]
    }) : await getBot();

    const title: string | undefined = pars['Title'];

    if (!title || !tbot) {
        vscode.window.showErrorMessage(`${!title ? 'title ' : ''}${!tbot ? 'tbot ' : ''}is undefined or empty.`);
        return undefined;
    }

    const args: Record<string, string> = {
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