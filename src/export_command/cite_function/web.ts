/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Part of the content comes from https://github.com/jasonwilliams/mediawiki-support/blob/master/src/webCitation.ts under license Apache-2.0

import * as vscode from "vscode";
import * as cheerio from "cheerio";
import fetch, { Response } from "node-fetch";
import { DateTime } from "luxon";
import { ArchiveConvert, ArchiveResult } from "../../interface_definition/archiveInterface";

export async function addWebCite(): Promise<void> {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

    const url: string | undefined = await vscode.window.showInputBox({
        prompt: "input the URL that you want to ref.",
        placeHolder: "https://sample.com",
        ignoreFocusOut: false
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
            editor?.edit((editorBuilder) => {
                editorBuilder.insert(selection.active, result);
            });
        }
    }
    catch (error: any) {
        vscode.window.showErrorMessage(`${error.code}! ${error.info}`);
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
        return format;
    }

    public async buildInfo(): Promise<void> {
        await this.fetchArchive();
        this.setTitle();
        this.setPublishedDate();
        this.setSiteName();
    }

    private async fetchArchive(): Promise<void> {
        // Fetch content and archive in parallel
        const websiteResponse = fetch(this.url);
        const archiveResponse = fetch(this.archiveApiUrl);
        const results: [Response, Response] = await Promise.all([websiteResponse, archiveResponse]);

        const websiteText: string = await results[0].text();
        this.metaData = cheerio.load(websiteText);

        const archiveJSON: ArchiveResult = await results[1].json();
        const re = ArchiveConvert.toArchiveResult(archiveJSON);
        console.log(archiveJSON);

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

    private getAttr(ioname: string, attrName: string = "content"): string | undefined {
        const io: cheerio.Cheerio = this.metaData(ioname);
        if (io.length) {
            return io.attr(attrName) || undefined;
        }
    }

    private getText(ioname: string): string | undefined {
        const io: cheerio.Cheerio = this.metaData(ioname);
        if (io.length) {
            return io.text() || undefined;
        }
    }
}

/**
* Repalce all argument.
*/
export function getReplacedString(formatStr: string, argStr: string, replaceStr: string | undefined): string {
    // /\{$arg\}/
    const argRegExp: RegExp = new RegExp(`\\{\\$${argStr}\\}`, 'g');
    if (replaceStr) {
        // remove all <!arg> and </!arg>
        // /\<\/?\!arg\>/
        formatStr = formatStr.replace(new RegExp(`<\\/?!${argStr}>`, 'g'), '');
        // replace all {$arg}
        formatStr = formatStr.replace(argRegExp, replaceStr);
    }
    else {
        // remove all substring betweem <!arg> and </!arg>
        // /\<\!arg\>[\s\S]*?\<\/\!arg\>/
        formatStr = formatStr.replace(new RegExp(`<!${argStr}>[\\s\\S]*?<\\/!${argStr}>`, 'g'), '');
        // clear all argument
        formatStr = formatStr.replace(argRegExp, '');
    }
    return formatStr;
}
