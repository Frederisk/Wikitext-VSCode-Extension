/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { a, u, o, m, r, cast, uncast } from "./convertFunction";

/*
    GetViewResult {
        parse?: Parse {
            title?: string,
            pageid?: number,
            redirects?: Redirect[] {
                from?: string,
                to?: string
            },
            text?: HtmlContent {
                *: string
            },
            displaytitle?: string,
            headhtml?: HtmlContent {
                *: string
            },
            categorieshtml?: CategoriesHTML {
                *: string
            }
        },
        error?: Error {
            code?: string,
            info?: string,
            *: string
        },
        servedby?: string
    }
 */

export interface GetViewResult {
    parse?: Parse;
    error?: Error;
    servedby?: string;
}

export interface Error {
    code?: string;
    info?: string;
    "*"?: string;
}

export interface Parse {
    title?: string;
    pageid?: number;
    redirects?: Redirect[];
    text?: HtmlContent;
    displaytitle?: string;
    headhtml?: HtmlContent;
    categorieshtml?: HtmlContent;
}

export interface HtmlContent {
    "*"?: string;
}

export interface Redirect {
    from?: string;
    to?: string;
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class ViewConverter {
    public static toGetViewResult(json: any): GetViewResult {
        return cast(json, r("GetViewResult"), getViewTypeMap);
    }
    public static getViewResultToJson(value: GetViewResult): any {
        return uncast(value, r("GetViewResult"), getViewTypeMap);
    }
}

/* eslint-disable @typescript-eslint/naming-convention */
const getViewTypeMap: any = {
    "GetViewResult": o([
        { json: "parse", js: "parse", typ: u(undefined, r("Parse")) },
        { json: "error", js: "error", typ: u(undefined, r("Error")) },
        { json: "servedby", js: "servedby", typ: u(undefined, "") },
    ], false),
    "Error": o([
        { json: "code", js: "code", typ: u(undefined, "") },
        { json: "info", js: "info", typ: u(undefined, "") },
        { json: "*", js: "*", typ: u(undefined, "") },
    ], false),
    "Parse": o([
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "pageid", js: "pageid", typ: u(undefined, 0) },
        { json: "redirects", js: "redirects", typ: u(undefined, a(r("Redirect"))) },
        { json: "text", js: "text", typ: u(undefined, r("HtmlContent")) },
        { json: "displaytitle", js: "displaytitle", typ: u(undefined, "") },
        { json: "headhtml", js: "headhtml", typ: u(undefined, r("HtmlContent")) },
        { json: "categorieshtml", js: "categorieshtml", typ: u(undefined, r("HtmlContent")) },
    ], false),
    "HtmlContent": o([
        { json: "*", js: "*", typ: u(undefined, "") },
    ], false),
    "Redirect": o([
        { json: "from", js: "from", typ: u(undefined, "") },
        { json: "to", js: "to", typ: u(undefined, "") },
    ], false),
};
