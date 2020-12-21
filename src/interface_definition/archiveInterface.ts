/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { a, u, o, m, r, cast, uncast } from "./convertFunction";

// https://archive.org/help/wayback_api.php
export interface ArchiveResult {
    archived_snapshots: ArchivedSnapshots;
    url: string;
}

export interface ArchivedSnapshots {
    closest?: Closest;
}

export interface Closest {
    available: boolean;
    url: string;
    timestamp: string;
    status: string;
}

export class ArchiveConvert {
    public static toArchiveResult(json: any): ArchiveResult {
        return cast(json, r("ArchiveResult"), archiveTypeMap);
    }

    public static archiveResultToJson(value: ArchiveResult): any {
        return uncast(value, r("ArchiveResult"), archiveTypeMap);
    }
}

const archiveTypeMap: any = {
    "ArchiveResult": o([
        { json: "archived_snapshots", js: "archived_snapshots", typ: r("ArchivedSnapshots") },
        { json: "url", js: "url", typ: "" },
    ], false),
    "ArchivedSnapshots": o([
        { json: "closest", js: "closest", typ: u(undefined, r("Closest")) },
    ], false),
    "Closest": o([
        { json: "available", js: "available", typ: true },
        { json: "url", js: "url", typ: "" },
        { json: "timestamp", js: "timestamp", typ: "" },
        { json: "status", js: "status", typ: "" },
    ], false),
};
