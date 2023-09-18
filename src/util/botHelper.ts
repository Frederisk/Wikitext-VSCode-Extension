import { mwn as Mwn } from 'mwn';
import { createStatusBarMessage, showErrorMessageFromErrorAsync, showInfoMessageAsync, showWarningMessageAsync } from './vscodeHelper';

import type { ApiEditResponse, ApiPage, ApiParams, ApiParseResponse, ApiResponse } from 'mwn';
import type { Disposable } from 'vscode';
import type { PageInfo } from './editorHelper';

/**
 * Login the bot by BotPassword.
 *
 * @param bot A bot that implements job.
 * @param username
 * @param password
 * @returns Weather the login was successful.
 */
export async function loginByBotPasswordAsync(bot: Mwn, username: string, password: string): Promise<boolean> {
    const statusBar: Disposable = createStatusBarMessage('Logging in...');
    try {
        const response: ApiResponse = await bot.login({
            username: username,
            password: password
        });
        await showInfoMessageAsync(`User "${response.lgusername}"(UserID:"${response.lguserid}") Login Result is "${response.result}". Login Token is "${response.token}".`);
        return true;
    } catch (error) {
        await showErrorMessageFromErrorAsync(error, 'Login failed.');
        return false;
    } finally {
        statusBar.dispose();
    }
}

/**
 * Logout the bot. If you are logging out of the `staticBot`, set it to `undefined` on successful logout.
 *
 * @param bot A bot that implements job.
 * @returns Weather the logout was successful.
 */
export async function logoutAsync(bot: Mwn): Promise<boolean> {
    const statusBar: Disposable = createStatusBarMessage('Logging out...');
    try {
        await bot.logout();
        return true;
    } catch (error: unknown) {
        await showErrorMessageFromErrorAsync(error, 'Logout failed.');
        return false;
    } finally {
        statusBar.dispose();
    }
}

export async function saveAsync(bot: Mwn, page: string | number, content: string, summary = ''): Promise<boolean> {
    const statusBar: Disposable = createStatusBarMessage('Posting you editing...');
    try {
        const wikitextTag = 'WikitextExtensionForVSCode';
        const tags: string[] = await getValidTagListAsync(bot);

        const response: ApiEditResponse = await bot.save(page, content, `${summary} // Edit via Wikitext Extension for VSCode`, {
            tags: tags.includes(wikitextTag) ? wikitextTag : undefined
        });

        if (response.nochange === true) {
            await showWarningMessageAsync(`No changes have occurred. Edit page "${response.title}" (Page ID: "${response.pageid}") action status is "${response.result}".`);
        } else {
            await showInfoMessageAsync(`Edit page "${response.title}" (Page ID: "${response.pageid}") action status is "${response.result}" with Content Model "${response.contentmodel}" (Version: "${response.oldrevid}" => "${response.newrevid}", Time: "${response.newtimestamp}").`);
        }

        return true;
    }
    catch (error: unknown) {
        await showErrorMessageFromErrorAsync(error);
        return false;
    }
    finally {
        statusBar.dispose();
    }
}

export async function readAsync(bot: Mwn, page: string | number, redirects = true): Promise<PageInfo | undefined> {
    const statusBar: Disposable = createStatusBarMessage('Pulling the page...');
    try {
        const response: ApiPage = await bot.read(page, {
            rvslots: '*',
            redirects: redirects
        });
        if (response.missing === true || response.revisions === undefined || response.revisions.length === 0) {
            throw new Error('The page no found. Please check your page name/id and try again.');
            // TODO: If the page do not exist, ask user if they want to create one.
        }
        // FIXME: internal wiki not support.
        // FIXME: Show info message.
        return {
            pageTitle: response.title,
            pageID: response.pageid.toString(),
            // FIXME: no revid
            revisionID: response.revisions[0].revid?.toString(),
            // timestamp: response.revisions[0].timestamp,
            contentModel: response.revisions[0].contentmodel,
            contentFormat: response.revisions[0].contentformat,
            content: response.revisions[0].content
        };
    } catch (error: unknown) {
        await showErrorMessageFromErrorAsync(error);
        return undefined;
    } finally {
        statusBar.dispose();
    }
}

export async function parseWikitextAsync(bot: Mwn, sourceText: string, config: { baseHref: string, style: string }): Promise<string | undefined> {
    const statusBar: Disposable = createStatusBarMessage('Parsing wikitext preview...');
    try {
        // FIXME: config support. such as: css, js
        const response = await parseWikitextEnhancedAsync(bot, sourceText) as any;

        const baseElem = `<base href="${config.baseHref}" />`;
        const styleElem = `<style>${config.style}</style>`;

        const htmlHead: string = response.headhtml?.replace('<head>', '<head>' + baseElem + styleElem) ?? `<!DOCTYPE html><html><head>${baseElem + styleElem}</head><body>`;

        const htmlText: string = response.text ?? '';

        const htmlCategories: string = response.categorieshtml ? '<hr />' + response.categorieshtml : '';

        const htmlEnd = '</body></html>'

        const html: string = htmlHead + htmlText + htmlCategories + htmlEnd;

        return html;
    } catch (error: unknown) {
        await showErrorMessageFromErrorAsync(error);
        return undefined;
    } finally {
        statusBar.dispose();
    }
}

async function parseWikitextEnhancedAsync(bot: Mwn, content: string, additionalParams?: ApiParams
) {
    return bot.request({
        action: 'parse',
        text: String(content),
        contentmodel: 'wikitext',
        formatversion: 2,
        pst: true,
        // FIXME: css
        disableeditsection: true,
        prop: 'text|displaytitle|categorieshtml'
    }).then((data: ApiResponse) => data.parse as ApiParseResponse
        // FIXME: ensure the type of response
    );
}


async function getValidTagListAsync(bot: Mwn): Promise<string[]> {
    const tagList: string[] = [];

    const tagsRepose = await bot.continuedQuery({
        action: 'query',
        list: 'tags',
        tglimit: 'max',
        tgprop: alterNativeValues('active', 'defined')
    }); // default max call `limit` is 10

    tagsRepose.forEach((value: ApiResponse) => {
        type Tag = {
            name: string;
            defined?: string;
            active?: string;
        };
        const tags: Tag[] = value?.query?.tags;
        tags
            .filter((tag: Tag): boolean =>
                tag.active !== undefined && tag.defined !== undefined
            )
            .map((tag: Tag): string =>
                tag.name
            )
            .forEach((tagName: string) =>
                tagList.push(tagName)
            );
    });
    return tagList;
}

function alterNativeValues(...values: (string | undefined)[]): string {
    values = values.filter(
        (item: string | undefined): boolean => item !== undefined
    );
    return values.join("|");
}
