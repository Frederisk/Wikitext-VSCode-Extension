/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { o, u, r, a, uncast, cast } from "./convertFunction";

/** <root> */
export interface ReadPageResult {
    api?: Api;
}

/** api */
export interface Api {
    $?: ApiClass;
    query?: Query[];
}

/** api. */
export interface ApiClass {
    batchcomplete?: string;
}

/** query */
export interface Query {
    normalized?: Normalized[];
    redirects?: Redirect[];
    pages?: QueryPage[];
    interwiki?: Interwiki[];
}

/** interwiki */
export interface Interwiki {
    i?: IElement[];
}

/** i */
export interface IElement {
    $?: I;
}

/** i. */
export interface I {
    title?: string;
    iw?: string;
}

/** normalized */
export interface Normalized {
    n?: NElement[];
}

/** n/r */
export interface NElement {
    $?: N;
}

/** n/r. */
export interface N {
    from?: string;
    to?: string;
}

/** pages */
export interface QueryPage {
    page?: PagePage[];
}

/** page */
export interface PagePage {
    $?: Page;
    revisions?: Revision[];
}

/** page. */
export interface Page {
    _idx?: string;
    pageid?: string;
    ns?: string;
    title?: string;
    missing?: string;
    invalidreason?: string;
    invalid?: string;
}

/** revisions */
export interface Revision {
    rev?: Rev[];
}
/** rev */
export interface Rev {
    $?: RevInfo;
    slots?: RevSlot[];
}

/** rev. */
export interface RevInfo {
    revid?: string;
    parentid?: string;
}

/** slots */
export interface RevSlot {
    slot?: SlotSlot[];
}

/** slot */
export interface SlotSlot {
    _?: string;
    $?: Slot;
}

/** slot. */
export interface Slot {
    contentmodel?: string;
    contentformat?: string;
    role?: string;
    "xml:space"?: string;
}

/** redirects */
export interface Redirect {
    r?: NElement[];
}

/** ReadPageResultConvert */
export class Convert {
    public static toReadPageResult(json: any): ReadPageResult {
        return cast(json, r("ReadPageResult"), readPageResultTypeMap);
    }

    public static readPageResultToJson(value: ReadPageResult): any {
        return uncast(value, r("ReadPageResult"), readPageResultTypeMap);
    }
}


export const readPageResultTypeMap: any = {
    "ReadPageResult": o([
        { json: "api", js: "api", typ: u(undefined, r("Api")) },
    ], false),
    "Api": o([
        { json: "$", js: "$", typ: u(undefined, r("ApiClass")) },
        { json: "query", js: "query", typ: u(undefined, a(r("Query"))) },
    ], false),
    "ApiClass": o([
        { json: "batchcomplete", js: "batchcomplete", typ: u(undefined, "") },
    ], false),
    "Query": o([
        { json: "normalized", js: "normalized", typ: u(undefined, a(r("Normalized"))) },
        { json: "redirects", js: "redirects", typ: u(undefined, a(r("Redirect"))) },
        { json: "pages", js: "pages", typ: u(undefined, a(r("QueryPage"))) },
        { json: "interwiki", js: "interwiki", typ: u(undefined, a(r("Interwiki"))) },
    ], false),
    "Interwiki": o([
        { json: "i", js: "i", typ: u(undefined, a(r("IElement"))) },
    ], false),
    "IElement": o([
        { json: "$", js: "$", typ: u(undefined, r("I")) },
    ], false),
    "I": o([
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "iw", js: "iw", typ: u(undefined, "") },
    ], false),
    "Normalized": o([
        { json: "n", js: "n", typ: u(undefined, a(r("NElement"))) },
    ], false),
    "NElement": o([
        { json: "$", js: "$", typ: u(undefined, r("N")) },
    ], false),
    "N": o([
        { json: "from", js: "from", typ: u(undefined, "") },
        { json: "to", js: "to", typ: u(undefined, "") },
    ], false),
    "QueryPage": o([
        { json: "page", js: "page", typ: u(undefined, a(r("PagePage"))) },
    ], false),
    "PagePage": o([
        { json: "$", js: "$", typ: u(undefined, r("Page")) },
        { json: "revisions", js: "revisions", typ: u(undefined, a(r("Revision"))) },
    ], false),
    "Page": o([
        { json: "_idx", js: "_idx", typ: u(undefined, "") },
        { json: "pageid", js: "pageid", typ: u(undefined, "") },
        { json: "ns", js: "ns", typ: u(undefined, "") },
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "missing", js: "missing", typ: u(undefined, "") },
        { json: "invalidreason", js: "invalidreason", typ: u(undefined, "") },
        { json: "invalid", js: "invalid", typ: u(undefined, "") },
    ], false),
    "Revision": o([
        { json: "rev", js: "rev", typ: u(undefined, a(r("Rev"))) },
    ], false),
    "Rev": o([
        { json: "$", js: "$", typ: u(undefined, r("RevInfo")) },
        { json: "slots", js: "slots", typ: u(undefined, a(r("RevSlot"))) },
    ], false),
    "RevInfo": o([
        { json: "revid", js: "revid", typ: u(undefined, "") },
        { json: "parentid", js: "parentid", typ: u(undefined, "") },
    ], false),
    "RevSlot": o([
        { json: "slot", js: "slot", typ: u(undefined, a(r("SlotSlot"))) },
    ], false),
    "SlotSlot": o([
        { json: "_", js: "_", typ: u(undefined, "") },
        { json: "$", js: "$", typ: u(undefined, r("Slot")) },
    ], false),
    "Slot": o([
        { json: "contentmodel", js: "contentmodel", typ: u(undefined, "") },
        { json: "contentformat", js: "contentformat", typ: u(undefined, "") },
        { json: "role", js: "role", typ: u(undefined, "") },
        { json: "xml:space", js: "xml:space", typ: u(undefined, "") },
    ], false),
    "Redirect": o([
        { json: "r", js: "r", typ: u(undefined, a(r("NElement"))) },
    ], false),
};
