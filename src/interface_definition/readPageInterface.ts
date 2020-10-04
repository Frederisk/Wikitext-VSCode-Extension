/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { a, u, o, m, r, uncast, cast } from "./convertFunction";

export interface ReadPageResult {
    batchcomplete?: string;
    query?: Query;
}

export interface Query {
    normalized?: Normalized[];
    redirects?: Normalized[];
    pages?: { [key: string]: Page };
}

export interface Normalized {
    from?: string;
    to?: string;
}

export interface Page {
    pageid?: number;
    ns?: number;
    title?: string;
    revisions?: Revision[];
    missing?: string;
}

export interface Revision {
    revid?: number;
    parentid?: number;
    slots?: Slots;
}

export interface Slots {
    main?: Main;
}

export interface Main {
    contentmodel?: string;
    contentformat?: string;
    empty?: string;
}

/** ReadPageResultConvert */
export class ReadPageConvert {
    public static toReadPageResult(json: any): ReadPageResult {
        return cast(json, r("ReadPageResult"), readPageResultTypeMap);
    }

    public static readPageResultToJson(value: ReadPageResult): any {
        return uncast(value, r("ReadPageResult"), readPageResultTypeMap);
    }
}

export const readPageResultTypeMap: any = {
    "ReadPageResult": o([
        { json: "batchcomplete", js: "batchcomplete", typ: u(undefined, "") },
        { json: "query", js: "query", typ: u(undefined, r("Query")) },
    ], false),
    "Query": o([
        { json: "normalized", js: "normalized", typ: u(undefined, a(r("Normalized"))) },
        { json: "redirects", js: "redirects", typ: u(undefined, a(r("Normalized"))) },
        { json: "pages", js: "pages", typ: u(undefined, m(r("Page"))) },
    ], false),
    "Normalized": o([
        { json: "from", js: "from", typ: u(undefined, "") },
        { json: "to", js: "to", typ: u(undefined, "") },
    ], false),
    "Page": o([
        { json: "pageid", js: "pageid", typ: u(undefined, 0) },
        { json: "ns", js: "ns", typ: u(undefined, 0) },
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "revisions", js: "revisions", typ: u(undefined, a(r("Revision"))) },
        { json: "missing", js: "missing", typ: u(undefined, "") },
    ], false),
    "Revision": o([
        { json: "revid", js: "revid", typ: u(undefined, 0) },
        { json: "parentid", js: "parentid", typ: u(undefined, 0) },
        { json: "slots", js: "slots", typ: u(undefined, r("Slots")) },
    ], false),
    "Slots": o([
        { json: "main", js: "main", typ: u(undefined, r("Main")) },
    ], false),
    "Main": o([
        { json: "contentmodel", js: "contentmodel", typ: u(undefined, "") },
        { json: "contentformat", js: "contentformat", typ: u(undefined, "") },
        { json: "*", js: "empty", typ: u(undefined, "") },
    ], false),
};
