import { mwn as Mwn } from 'mwn';
import { getConfig, showErrorMessageFromErrorAsync } from './vscodeHelper';

export let staticBot: Mwn | undefined = undefined;

export async function initStaticBotAsync(): Promise<Mwn | undefined> {
    try {
        staticBot = new Mwn({
            apiUrl: getConfig<string>('transferProtocol') + getConfig<string>('host') + getConfig<string>('apiPath')
        });
        return staticBot;
    } catch (error: unknown) {
        staticBot = undefined;
        await showErrorMessageFromErrorAsync(error);
    }
}
