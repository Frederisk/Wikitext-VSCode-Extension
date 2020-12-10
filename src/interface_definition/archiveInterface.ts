/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// https://archive.org/help/wayback_api.php
export interface IArchiveResult {
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
