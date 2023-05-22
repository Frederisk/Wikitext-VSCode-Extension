/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import type MWBot from 'mwbot';
import { Action, Prop, RvProp, alterNativeValues, List } from './args';
import { ReadPageConvert, ReadPageResult, Main, Revision, Jump, Page } from '../../interface_definition/api_interface/readPage';
import { OldTokensConvert, OldTokensResult } from '../../interface_definition/api_interface/oldTokens';
import { compareVersion, getDefaultBot, getLoggedInBot } from './bot';
import { TokensConvert, TokensResult } from '../../interface_definition/api_interface/tokens';
import { showMWErrorMessage } from './err_msg';
import { TagsConvert, TagsResult } from '../../interface_definition/api_interface/tags';

interface ContentInfo {
    content: string;
    info?: Record<string, string | undefined>;
}

export function postPageFactory() {
    /**
     * Write/Post Page
     */
    return async function postPage(): Promise<void> {
        async function getEditToken(bot: MWBot): Promise<string> {
            const errors: unknown[] = [undefined, undefined];
            try {
                const args: Record<string, string> = {
                    action: Action.query,
                    meta: 'tokens',
                    type: 'csrf'
                };
                const result: unknown = await bot.request(args);
                const reNew: TokensResult = TokensConvert.toResult(result);
                const token: string | undefined = reNew.query?.tokens?.csrftoken;
                if (token) {
                    return token;
                }
            }
            catch (error) {
                errors[0] = error;
            }
            if (errors[0] !== undefined) {
                try {
                    const args: Record<string, string> = {
                        action: "tokens",
                        type: "edit"
                    };
                    const result: unknown = await bot.request(args);
                    const reOld: OldTokensResult = OldTokensConvert.toResult(result);
                    const token: string | undefined = reOld.tokens?.edittoken;
                    if (token) {
                        return token;
                    }
                }
                catch (error) {
                    errors[1] = error;
                }
            }

            const error: Error = new Error('Could not get edit token:' +
                ' NEW: ' + ((errors[0] instanceof Error) ? errors[0].message : '') +
                ' OLD: ' + ((errors[1] instanceof Error) ? errors[1].message : ''));
            throw error;
        }

        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('wikitext');
        const tBot: MWBot | undefined = await getLoggedInBot();

        if (tBot === undefined) {
            vscode.window.showErrorMessage("Bot is undefined! You may be not logged in.");
            return undefined;
        }

        const wikiContent: string | undefined = vscode.window.activeTextEditor?.document.getText();
        if (wikiContent === undefined) {
            vscode.window.showWarningMessage("There is no active text editor.");
            return undefined;
        }

        const contentInfo: ContentInfo = getContentInfo(wikiContent);

        const skip: boolean = config.get("skipEnteringPageTitle") as boolean;

        const wikiTitle: string | undefined = skip && contentInfo.info?.pageTitle || await vscode.window.showInputBox({
            value: contentInfo.info?.pageTitle || "",
            ignoreFocusOut: true,
            prompt: "Enter the page name here."
        });

        if (!wikiTitle) {
            return undefined;
        }
        let wikiSummary: string | undefined = await vscode.window.showInputBox({
            ignoreFocusOut: true,
            prompt: 'Enter the summary of this edit action.',
            placeHolder: '// Edit via Wikitext Extension for VSCode'
        });
        if (wikiSummary === undefined) {
            return undefined;
        }
        wikiSummary = `${wikiSummary} // Edit via Wikitext Extension for VSCode`.trim();
        const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Posting...");
        try {
            const args: Record<string, string> = {
                action: Action.edit,
                title: wikiTitle,
                text: contentInfo.content,
                summary: wikiSummary,
                // tags: 'WikitextExtensionForVSCode',
                token: await getEditToken(tBot)
            };
            const wikitextTag = 'WikitextExtensionForVSCode';
            const tagList: (number | string)[] = await getValidTagList(tBot);
            if (tagList.includes(wikitextTag)) {
                args['tags'] = wikitextTag;
            }

            // if (config.get("redirect")) {
            //     args['redirect'] = "true";
            // }
            const result: any = await tBot.request(args);
            // TODO: Convert
            if (result.edit.nochange !== undefined) {
                vscode.window.showWarningMessage(
                    `No changes have occurred: "${result.edit.nochange}", Edit page "${result.edit.title}" (Page ID: "${result.edit.pageid}") action status is "${result.edit.result}" with Content Model "${result.edit.contentmodel}". Watched by: "${result.edit.watched}".`
                );
            } else {
                vscode.window.showInformationMessage(
                    `Edit page "${result.edit.title}" (Page ID: "${result.edit.pageid}") action status is "${result.edit.result}" with Content Model "${result.edit.contentmodel}" (Version: "${result.edit.oldrevid}" => "${result.edit.newrevid}", Time: "${result.edit.newtimestamp}"). Watched by: "${result.edit.watched}".`
                );
            }
        }
        catch (error) {
            showMWErrorMessage('postPage', error, `Your Token: ${tBot?.editToken}.`);
        }
        finally {
            barMessage.dispose();
        }
    };
}

export function pullPageFactory() {
    /**
     * Read/Pull Page
     */
    return async function pullPage(): Promise<void> {
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

        // constructing
        const tBot: MWBot | undefined = await getDefaultBot();
        if (tBot === undefined) { return undefined; }

        // get title name
        const title: string | undefined = await vscode.window.showInputBox({
            prompt: "Enter the page name here.",
            ignoreFocusOut: true
        });
        // if title is null or empty, do nothing
        if (!title) { return undefined; }

        const newVer = await compareVersion(tBot, 1, 32, 0);

        if (!newVer) {
            vscode.window.showWarningMessage("Your MediaWiki version may be too old. This may cause some compatibility issues. Please update to the v1.32.0 or later.");
            // return undefined;
        }

        const args: Record<string, string> = {
            action: Action.query,
            prop: Prop.reVisions,
            rvprop: alterNativeValues(RvProp.content, RvProp.ids),
            rvslots: "*",
            titles: title
        };
        if (config.get("redirects")) {
            args['redirects'] = "true";
        }

        const document: vscode.TextDocument | undefined = await getPageCode(args, tBot);
        if (document === undefined) { return undefined; }

        vscode.window.showTextDocument(document);
    };
}

export function closeEditorFactory() {
    return async function closeEditor(): Promise<void> {
        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

        await editor?.edit((editBuilder: vscode.TextEditorEdit): void =>
            // delete all text
            editBuilder.delete(
                new vscode.Range( // the range of all document: from the beginning to the end
                    new vscode.Position(0, 0), // beginning
                    editor.document.lineAt(editor.document.lineCount - 1).rangeIncludingLineBreak.end // end
                )
            )
        ).then(() =>
            // close the activate editor
            vscode.commands.executeCommand('workbench.action.closeActiveEditor')
        );
    };
}

type PageInfo = "pageTitle" | "pageID" | "revisionID" | "contentModel" | "contentFormat";

export async function getPageCode(args: Record<string, string>, tBot: MWBot): Promise<vscode.TextDocument | undefined> {
    function modelNameToLanguage(modelName: string | undefined): string {
        switch (modelName) {
            case undefined:
                return 'wikitext';
            case 'flow-board':
                return 'jsonc';
            case 'sanitized-css':
                return 'css';
            case 'Scribunto':
                return 'lua';
            default:
                return modelName;
        }
    }
    function getInfoHead(info: Record<PageInfo, string | undefined>): string {
        const commentList: Record<string, [string, string] | undefined> = {
            wikitext: ["", ""],
            jsonc: ["/*", "*/"],
            lua: ["--[=[", "--]=]"],
            javascript: ["/*", "*/"],
            css: ["/*", "*/"],
            php: ["/*", "*/"],
            // 'flow-board': ["/*", "*/"],
            // 'sanitized-css': ["/*", "*/"],
            // 'Scribunto' : ["--[=[", "--]=]"],
        };
        const headInfo: Record<string, string | undefined> = {
            comment: "Please do not remove this struct. It's record contains some important information of edit. This struct will be removed automatically after you push edits.",
            ...info
        };
        const infoLine: string = Object.keys(headInfo).
            map((key: string) => `    ${key} = #${headInfo[key] ?? ''}#`).
            join("\r");
        console.log(info?.contentModel);
        const comment: [string, string] | undefined = commentList[modelNameToLanguage(info?.contentModel)];
        if (comment === undefined) {
            throw new Error(`Unsupported content model: ${info?.contentModel}. Please report this issue to the author of this extension.`);
        }
        return comment.join(`<%-- [PAGE_INFO]
${infoLine}
[END_PAGE_INFO] --%>`);
    }

    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Getting code...");
    try {
        // get request result
        const result: unknown = await tBot.request(args);
        // console.log(result);
        // Convert result as class
        const re: ReadPageResult = ReadPageConvert.toResult(result);
        if (re.query?.interwiki) {
            vscode.window.showWarningMessage(
                `Interwiki page "${re.query.interwiki[0].title}" in space "${re.query.interwiki[0].iw}" are currently not supported. Please try to modify host.`
            );
        }

        // get first page
        const page: Page | undefined = re.query?.pages?.[Object.keys(re.query.pages)[0]];
        // need a page elements
        if (!page) { return undefined; }

        // first revision
        const revision: Revision | undefined = page.revisions?.[0];

        const content: Main | Revision | undefined = revision?.slots?.main || revision;

        const normalized: Jump | undefined = re.query?.normalized?.[0];
        const redirects: Jump | undefined = re.query?.redirects?.[0];

        vscode.window.showInformationMessage(
            `Opened page "${page.title}" with Model ${content?.contentmodel}.` +
            (normalized ? ` Normalized: ${normalized.from} => ${normalized.to}` : "") +
            (redirects ? ` Redirect: ${redirects.from} => ${redirects.to}` : "")
        );

        if (page.missing !== undefined || page.invalid !== undefined) {
            const choice: string | undefined = await vscode.window.showWarningMessage(
                `The page "${page.title}" you are looking for does not exist. ${page.invalidreason ?? ''}`.trim() + ' Do you want to create one?', 'Yes', 'No');
            if (choice === 'Yes') {
                const info: Record<PageInfo, string | undefined> = {
                    pageTitle: page.title,
                    pageID: undefined,
                    revisionID: undefined,
                    contentModel: undefined,
                    contentFormat: undefined,
                };
                const infoHead: string = getInfoHead(info);
                const textDocument: vscode.TextDocument = await vscode.workspace.openTextDocument({
                    language: info.contentModel ?? 'wikitext',
                    content: infoHead + "\r\r"
                });
                return textDocument;
            } else { return undefined; }
        } else {
            const info: Record<PageInfo, string | undefined> = {
                pageTitle: page.title,
                pageID: page.pageid?.toString(),
                revisionID: revision?.revid?.toString(),
                contentModel: content?.contentmodel,
                contentFormat: content?.contentformat
            };
            const infoHead: string = getInfoHead(info);
            const textDocument: vscode.TextDocument = await vscode.workspace.openTextDocument({
                language: modelNameToLanguage(info.contentModel),
                content: infoHead + "\r\r" + content?.["*"]
            });
            return textDocument;
        }
    }
    catch (error) {
        showMWErrorMessage('getPageCode', error);
    }
    finally {
        barMessage.dispose();
    }
}

export function getContentInfo(content: string): ContentInfo {
    const info: string | undefined = content.match(
        /(?<=<%--\s*\[PAGE_INFO\])[\s\S]*?(?=\[END_PAGE_INFO\]\s*--%>)/
    )?.[0];

    let pageInfo: Record<PageInfo, string | undefined> | undefined;
    if (info) {
        const getInfo = (infoName: PageInfo): string | undefined => {
            const nameFirst: string = infoName[0];
            const nameRest: string = infoName.substring(1);
            const reg = new RegExp(`(?<=[${nameFirst.toLowerCase()}${nameFirst.toUpperCase()}]${nameRest}\\s*=\\s*#).*?(?=#)`);
            return info.match(reg)?.[0];
        };
        pageInfo = {
            pageTitle: getInfo("pageTitle"),
            pageID: getInfo("pageID"),
            revisionID: getInfo("revisionID"),
            contentModel: getInfo("contentModel"),
            contentFormat: getInfo("contentFormat")
        };

        content = content.replace(/\s*(?:\/\*|--\[=\[)?\s*<%--\s*\[PAGE_INFO\][\s\S]*?\[END_PAGE_INFO\]\s*--%>\s*(?:\*\/|--\]=\])?\s*/, '');
    }

    return { content: content, info: pageInfo };
}

async function getValidTagList(tBot: MWBot): Promise<(number | string)[]> {
    const args: Record<string, string> = {
        action: Action.query,
        list: List.tags,
        tglimit: 'max',
        tgprop: alterNativeValues('active', 'defined')
    };

    const tagList: (number | string)[] = [];
    for (; ;) {
        const result: unknown = await tBot.request(args);
        const re: TagsResult = TagsConvert.toResult(result);

        tagList.push(
            ...re.query.tags.filter(tag =>
                tag.active !== undefined && tag.defined !== undefined
            ).map(tag => tag.name));
        if (re.continue !== undefined) { Object.assign(args, re.continue); }
        else { break; }
    }

    return tagList;
}
