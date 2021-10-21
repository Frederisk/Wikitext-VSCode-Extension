/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Part of the content comes from https://github.com/jasonwilliams/mediawiki-support/blob/master/src/webCitation.ts under license Apache-2.0

import * as vscode from "vscode";
import * as cheerio from "cheerio";
import fetch from "node-fetch";
import type { Response } from "node-fetch";
import { DateTime } from "luxon";
import { ArchiveConvert, ArchiveResult } from "../../interface_definition/archiveInterface";

export async function addWebCite(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const url: string | undefined = await vscode.window.showInputBox({
        prompt: "input the URL that you want to ref.",
        placeHolder: "https://sample.com",
        ignoreFocusOut: true
    });
    if (!url) { return undefined; }

    const barMessage: vscode.Disposable = vscode.window.setStatusBarMessage("Wikitext: Parsing...");
    try {
        const citeInfo: WebCiteInfo = new WebCiteInfo(url);
        await citeInfo.buildInfo();
        const result: string = citeInfo.toString(config.get("webCiteFormat") ?? "");

        const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
        const selection: vscode.Selection | undefined = editor?.selection;

        if (selection) {
            editor?.edit((editorBuilder: vscode.TextEditorEdit): void => {
                editorBuilder.insert(selection.active, result);
            });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`ErrorName: ${error.name}; ErrorMessage: ${error.message}.`);
        }
        else {
            vscode.window.showErrorMessage(`addWebCite ERROR: ${JSON.stringify(error)}.`);
        }
    }
    finally {
        barMessage.dispose();
    }
}

class WebCiteInfo {

    url: string;
    title?: string;
    accessDate: string;
    siteName?: string;
    publishDate?: string;
    archivedUrl?: string;
    archivedDate?: string;
    private archiveApiUrl: string;
    private metaData!: cheerio.Root;

    constructor(url: string) {
        this.url = url;
        this.accessDate = DateTime.utc().toISODate();
        this.archiveApiUrl = `https://archive.org/wayback/available?url=${url}`;
    }

    public toString(format: string): string {
        format = getReplacedString(format, "url", this.url);
        format = getReplacedString(format, "title", this.title);
        format = getReplacedString(format, "accessdate", this.accessDate);
        format = getReplacedString(format, "website", this.siteName);
        format = getReplacedString(format, "publicationdate", this.publishDate);
        format = getReplacedString(format, "archiveurl", this.archivedUrl);
        format = getReplacedString(format, "archivedate", this.archivedDate);
        return format.replace(/[\n\r]/g, ' ');
    }

    public async buildInfo(): Promise<void> {
        await this.fetchArchive();
        this.setTitle();
        this.setPublishedDate();
        this.setSiteName();
    }

    private async fetchArchive(): Promise<void> {
        // Fetch content and archive in parallel
        const websiteResponse: Promise<Response> = fetch(this.url);
        const archiveResponse: Promise<Response> = fetch(this.archiveApiUrl);
        const results: [Response, Response] = await Promise.all([websiteResponse, archiveResponse]);

        const websiteText: string = await results[0].text();
        this.metaData = cheerio.load(websiteText);

        const archiveJSON = await results[1].json();
        const re: ArchiveResult = ArchiveConvert.toArchiveResult(archiveJSON);

        // Check archive and get the closest
        if (re.archivedSnapshots.closest) {
            this.archivedUrl = re.archivedSnapshots.closest.url;
            this.archivedDate = DateTime.fromFormat(re.archivedSnapshots.closest.timestamp, "yyyyMMddhhmmss").toISODate();
        }
    }

    private setTitle(): void {
        this.title =
            this.getAttr("meta[property='og:og:title']") ||
            this.getAttr("meta[property='twitter:title']") ||
            this.getText("h1") ||
            this.getText("title");
    }

    private setPublishedDate(): void {
        const date =
            this.getAttr("meta[property='article:published_time']") ||
            this.getAttr("time", "datetime");
        if (date) {
            this.publishDate = DateTime.fromISO(date).toISODate();
        }
    }

    private setSiteName(): void {
        this.siteName =
            this.getAttr("meta[property='og:site_name']") ||
            this.getAttr("meta[property='twitter:site']");
    }

    private getAttr(ioName: string, attrName = "content"): string | undefined {
        const io: cheerio.Cheerio = this.metaData(ioName);
        if (io.length) {
            return io.attr(attrName) || undefined;
        }
    }

    private getText(ioName: string): string | undefined {
        const io: cheerio.Cheerio = this.metaData(ioName);
        if (io.length) {
            return io.text() || undefined;
        }
    }
}

/**
* Replace all argument.
*/
export function getReplacedString(formatStr: string, argStr: string, replaceStr: string | undefined): string {
    // /\{$arg\}/
    const argRegExp = new RegExp(`\\{\\$${argStr}\\}`, 'g');
    if (replaceStr) {
        // remove all <!arg> and </!arg>
        // /\<\/?\!arg\>/
        formatStr = formatStr.replace(new RegExp(`<\\/?!${argStr}>`, 'g'), '');
        // replace all {$arg}
        formatStr = formatStr.replace(argRegExp, replaceStr);
    }
    else {
        // remove all substring between <!arg> and </!arg>
        // /\<\!arg\>[\s\S]*?\<\/\!arg\>/
        formatStr = formatStr.replace(new RegExp(`<!${argStr}>[\\s\\S]*?<\\/!${argStr}>`, 'g'), '');
        // clear all argument
        formatStr = formatStr.replace(argRegExp, '');
    }
    return formatStr;
}
