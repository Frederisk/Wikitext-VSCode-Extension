import fetch, { Response } from "node-fetch";
import * as cheerio from "cheerio";
import { DateTime } from "luxon";

interface IArchiveResponse {
    archived_snapshots: {
        closest?: {
            available: boolean;
            url: string;
            timestamp: string;
            status: string;
        };
    };
    url: string;
}

export class WebCiteInfo {

    url: string;
    title: string | undefined;
    accessDate: string;
    siteName: string | undefined;
    publishDate: string | undefined;
    archivedUrl: string | undefined;
    archivedDate: string | undefined;
    private archiveApiUrl: string;
    private metaData!: cheerio.Root;

    constructor(url: string) {
        this.url = url;
        this.accessDate = DateTime.utc().toISODate();
        this.archiveApiUrl = "https://archive.org/wayback/available?url=" + url;
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

        const archiveJSON: IArchiveResponse = await results[1].json();

        // Check archive and get the closest
        if (archiveJSON.archived_snapshots.closest) {
            this.archivedUrl = archiveJSON.archived_snapshots.closest.url;
            this.archivedDate = DateTime.fromFormat(archiveJSON.archived_snapshots.closest.timestamp, "yyyyMMddhhmmss").toISODate();
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
    const argRegExp: RegExp = new RegExp(`\\{\\$${argStr}\\}`);
    if (replaceStr) {
        // remove all <!arg> and </!arg>
        // /\<\/?\!arg\>/
        formatStr = formatStr.split(new RegExp(`\\<\\/?\\!${argStr}\\>`)).join("");
        // replace all {$arg}
        formatStr = formatStr.split(argRegExp).join(replaceStr);
    }
    else {
        // remove all substring betweem <!arg> and </!arg>
        // /\<\!arg\>[\s\S]*?\<\/\!arg\>/
        formatStr = formatStr.split(new RegExp(`\\<\\!${argStr}\\>[\\s\\S]*?\\<\\/\\!${argStr}\\>`)).join("");
        // clear all argument
        formatStr = formatStr.split(argRegExp).join("");
    }
    return formatStr;
}