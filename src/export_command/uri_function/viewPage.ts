import * as vscode from 'vscode';
import MWBot from 'mwbot';
import { getBot } from '../wikimedia_function/bot';
import { Action, alterNativeValues, Prop } from '../wikimedia_function/args';
import { getView } from '../wikimedia_function/view';
import { IParameters, isRemoteBot, parseArgs } from './uri';
import { getHost } from '../host_function/host';

export async function viewPage(query: string): Promise<void> {
    function setArgs(par: string, defaultValue?: string) {
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
    const args: { [Key: string]: string | undefined } = { 'action': Action.parse };
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