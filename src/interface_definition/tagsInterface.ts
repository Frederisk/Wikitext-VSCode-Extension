/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { a, cast, o, r, TypeMap, u, uncast } from "./convertFunction";

/*
    TagsResult {
        batchcomplete?: string,
        continue?: Continue {
            tgcontinue: string,
            continue: string
        },
        query: Query {
            tags: Tag[] {
                name: string,
                defined?: string,
                active?: string
            }
        },
        limits?: Limits {
            tags?: number
        }
    }
*/

export interface TagsResult {
    batchcomplete?: string;
    continue?: Continue;
    query: Query;
    limits?: Limits;
}

export interface Continue {
    tgcontinue: string;
    continue: string;
}

export interface Limits {
    tags: number;
}

export interface Query {
    tags: Tag[];
}

export interface Tag {
    name: string;
    defined?: string;
    active?: string;
}

export class TagsConvert {
    public static toTagsResult(json: unknown): TagsResult {
        return cast(json, r("TagsResult"), tagsTypeMap);
    }

    public static tagsResultToJson(value: TagsResult): unknown {
        return uncast(value, r("TagsResult"), tagsTypeMap);
    }
}

/* eslint-disable @typescript-eslint/naming-convention */
const tagsTypeMap: TypeMap = {
    "TagsResult": o([
        { json: "batchcomplete", js: "batchcomplete", typ: u(undefined, "") },
        { json: "continue", js: "continue", typ: u(undefined, r("Continue")) },
        { json: "query", js: "query", typ: r("Query") },
        { json: "limits", js: "limits", typ: u(undefined, r("Limits")) },
    ], false),
    "Continue": o([
        { json: "tgcontinue", js: "tgcontinue", typ: "" },
        { json: "continue", js: "continue", typ: "" },
    ], false),
    "Limits": o([
        { json: "tags", js: "tags", typ: 0 },
    ], false),
    "Query": o([
        { json: "tags", js: "tags", typ: a(r("Tag")) },
    ], false),
    "Tag": o([
        { json: "name", js: "name", typ: "" },
        { json: "defined", js: "defined", typ: u(undefined, "") },
        { json: "active", js: "active", typ: u(undefined, "") },
    ], false),
};
