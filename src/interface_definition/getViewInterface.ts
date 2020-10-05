/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { a, u, o, m, r, cast, uncast } from "./convertFunction";

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
    text?: Headhtml;
    displaytitle?: string;
    headhtml?: Headhtml;
}

export interface Headhtml {
    "*"?: string;
}

export interface Redirect {
    from?: string;
    to?: string;
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class GetViewConvert {
    public static toGetViewResult(json: any): GetViewResult {
        return cast(json, r("GetViewResult"), getViewTypeMap);
    }
    public static GetViewResultToJson(value: GetViewResult): any {
        return uncast(value, r("GetViewResult"), getViewTypeMap);
    }
}

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
        { json: "text", js: "text", typ: u(undefined, r("Headhtml")) },
        { json: "displaytitle", js: "displaytitle", typ: u(undefined, "") },
        { json: "headhtml", js: "headhtml", typ: u(undefined, r("Headhtml")) },
    ], false),
    "Headhtml": o([
        { json: "*", js: "*", typ: u(undefined, "") },
    ], false),
    "Redirect": o([
        { json: "from", js: "from", typ: u(undefined, "") },
        { json: "to", js: "to", typ: u(undefined, "") },
    ], false),
};
