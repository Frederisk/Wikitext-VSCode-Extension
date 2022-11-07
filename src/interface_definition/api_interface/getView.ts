/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MWError, mWErrorTypeMapInline, mWErrorTypeMapOutline, MWWarnings, mWWarningsTypeMapInline, mWWarningsTypeMapOutline } from "./commonInterface";
import { a, u, o, r, cast, uncast, TypeMap } from "../convertFunction";
import { staticObjectConverter } from "../IObjectConverter";


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
            code: string,
            info: string,
            *: string
        },
        warnings?: MWWarnings {
            main: WarnMain {
                *: string
            }
        }
        servedby?: string
    }
 */

export interface GetViewResult {
    parse?: Parse;
    error?: MWError;
    warnings?: MWWarnings;
    servedby?: string;
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
@staticObjectConverter<ViewConvert>()
export class ViewConvert {
    public static toResult(json: unknown): GetViewResult {
        return cast(json, r("GetViewResult"), getViewTypeMap);
    }
    public static resultToJson(value: GetViewResult): unknown {
        return uncast(value, r("GetViewResult"), getViewTypeMap);
    }
}

/* eslint-disable @typescript-eslint/naming-convention */
const getViewTypeMap: TypeMap = {
    "GetViewResult": o([
        { json: "parse", js: "parse", typ: u(undefined, r("Parse")) },
        mWErrorTypeMapInline,
        mWWarningsTypeMapInline,
        { json: "servedby", js: "servedby", typ: u(undefined, "") },
    ], false),
    ...mWErrorTypeMapOutline,
    ...mWWarningsTypeMapOutline,
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
