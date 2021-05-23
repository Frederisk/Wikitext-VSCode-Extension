/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { a, u, o, m, r, uncast, cast } from "./convertFunction";

/*
    ReadPageResult {
        warnings: Warnings {
            main: WarnMain {
                *: string
            }
        },
        batchcomplete?: string,
        query?: Query {
            normalized?: Jump[] {
                from?: string,
                to?: string
            },
            redirects?: Jump[] {
                from?: string,
                to?: string
            },
            pages?: {
                [key: string]: Page {
                    pageid?: number,
                    ns?: number,
                    title?: string,
                    revisions?: Revision[] {
                        revid?: number,
                        parentid?: number,
                        slots?: Slots {
                            main?: Main {
                                main?: Main {
                                    contentmodel?: string,
                                    contentformat?: string,
                                    *?: string
                                }
                            }
                        }
                        // Old
                        contentformat?: string,
                        contentmodel?: string,
                        *?: string
                    },
                    missing?: string,
                    invalidreason?: string,
                    invalid?: string
                }
            },
            interwiki?: Interwiki[] {
                title?: string,
                iw?: string
            }
        }
    }
 */

export interface ReadPageResult {
    warnings?: Warnings;
    batchcomplete?: string;
    query?: Query;
}

export interface Warnings {
    main?: WarnMain;
}

export interface WarnMain {
    "*"?: string;
}

export interface Query {
    normalized?: Jump[];
    redirects?: Jump[];
    pages?: { [key: string]: Page };
    interwiki?: Interwiki[];
}

export interface Interwiki {
    title?: string;
    iw?: string;
}

export interface Jump {
    from?: string;
    to?: string;
}

export interface Page {
    pageid?: number;
    ns?: number;
    title?: string;
    revisions?: Revision[];
    missing?: string;
    invalidreason?: string;
    invalid?: string;
}

export interface Revision {
    revid?: number;
    parentid?: number;
    slots?: Slots;
    /**
     * Outdated
     *
     * slots.main.contentformat: string
     */
    contentformat?: string;
    /**
     * Outdated
     *
     * slots.main.contentmodel: string
     */
    contentmodel?: string;
    /**
     * Outdated
     *
     * slots.main.*: string
     */
    "*"?: string;
}

export interface Slots {
    main?: Main;
}

export interface Main {
    contentmodel?: string;
    contentformat?: string;
    "*"?: string;
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

/* eslint-disable @typescript-eslint/naming-convention */
const readPageResultTypeMap: any = {
    "ReadPageResult": o([
        { json: "warnings", js: "warnings", typ: u(undefined, r("Warnings"))},
        { json: "batchcomplete", js: "batchcomplete", typ: u(undefined, "") },
        { json: "query", js: "query", typ: u(undefined, r("Query")) },
    ], false),
    "Warnings": o([
        { json: "main", js: "main", typ: u(undefined, r("WarnMain")) },
    ], false),
    "WarnMain": o([
        { json: "*", js: "*", typ: u(undefined, "") }
    ], false),
    "Query": o([
        { json: "normalized", js: "normalized", typ: u(undefined, a(r("Jump"))) },
        { json: "redirects", js: "redirects", typ: u(undefined, a(r("Jump"))) },
        { json: "pages", js: "pages", typ: u(undefined, m(r("Page"))) },
        { json: "interwiki", js: "interwiki", typ: u(undefined, a(r("Interwiki"))) },
    ], false),
    "Interwiki": o([
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "iw", js: "iw", typ: u(undefined, "") },
    ], false),
    "Jump": o([
        { json: "from", js: "from", typ: u(undefined, "") },
        { json: "to", js: "to", typ: u(undefined, "") },
    ], false),
    "Page": o([
        { json: "pageid", js: "pageid", typ: u(undefined, 0) },
        { json: "ns", js: "ns", typ: u(undefined, 0) },
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "revisions", js: "revisions", typ: u(undefined, a(r("Revision"))) },
        { json: "missing", js: "missing", typ: u(undefined, "") },
        { json: "invalidreason", js: "invalidreason", typ: u(undefined, "") },
        { json: "invalid", js: "invalid", typ: u(undefined, "") },
    ], false),
    "Revision": o([
        { json: "revid", js: "revid", typ: u(undefined, 0) },
        { json: "parentid", js: "parentid", typ: u(undefined, 0) },
        { json: "slots", js: "slots", typ: u(undefined, r("Slots")) },
        // Outdated
        { json: "contentmodel", js: "contentmodel", typ: u(undefined, "") },
        { json: "contentformat", js: "contentformat", typ: u(undefined, "") },
        { json: "*", js: "*", typ: u(undefined, "") },
    ], false),
    "Slots": o([
        { json: "main", js: "main", typ: u(undefined, r("Main")) },
    ], false),
    "Main": o([
        { json: "contentmodel", js: "contentmodel", typ: u(undefined, "") },
        { json: "contentformat", js: "contentformat", typ: u(undefined, "") },
        { json: "*", js: "*", typ: u(undefined, "") },
    ], false),
};
