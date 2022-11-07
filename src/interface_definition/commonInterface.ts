/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { u, o, r, TypeMap } from "./convertFunction";

//#region Error

export interface MWError {
    code: string;
    info: string;
    "*": string;
}

export const mWErrorTypeMapInline: { json: string; js: string; typ: any; } = {
    json: "warnings", js: "warnings", typ: u(undefined, r("MWError"))
};

/* eslint-disable @typescript-eslint/naming-convention */
export const mWErrorTypeMapOutline: TypeMap = {
    "MWError": o([
        { json: "code", js: "code", typ: "" },
        { json: "info", js: "info", typ: "" },
        { json: "*", js: "*", typ: "" }
    ], false),
};

export function instanceOfMWError(o: any): o is MWError {
    return ('code' in o) && ('info' in o) && ('*' in o);
}

//#endregion Error

//#region Warnings

export interface MWWarnings {
    main: WarnMain;
}

export interface WarnMain {
    "*": string;
}

export const mWWarningsTypeMapInline: { json: string; js: string; typ: any; } = {
    json: "warnings", js: "warnings", typ: u(undefined, r("MWWarnings"))
};

export const mWWarningsTypeMapOutline: any = {
    "MWWarnings": o([
        { json: "main", js: "main", typ: r("WarnMain") },
    ], false),
    "WarnMain": o([
        { json: "*", js: "*", typ: "" },
    ], false),
};

export function instanceOfMWWarnings(o: any): o is MWWarnings {
    return 'main' in o;
}

//#endregion Warnings
