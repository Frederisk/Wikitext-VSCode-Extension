/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// To parse this data:
//
//   import { Convert, ReadPageResult } from "./file";
//
//   const readPageResult = Convert.toReadPageResult(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface ReadPageResult {
    parse?: Parse;
}

export interface Parse {
    title?:         string;
    pageid?:        number;
    text?:          Text;
    langlinks?:     any[];
    categories?:    any[];
    links?:         any[];
    templates?:     any[];
    images?:        any[];
    externallinks?: any[];
    sections?:      Section[];
    parsewarnings?: any[];
    displaytitle?:  string;
    iwlinks?:       any[];
    properties?:    any[];
}

export interface Section {
    toclevel?:   number;
    level?:      string;
    line?:       string;
    number?:     string;
    index?:      string;
    fromtitle?:  string;
    byteoffset?: number;
    anchor?:     string;
}

export interface Text {
    "*"?: string;
}

// Converts JSON types to/from your types
// and asserts the results at runtime
export class Convert {
    public static toReadPageResult(json: any): ReadPageResult {
        return cast(json, r("ReadPageResult"));
    }

    public static readPageResultToJson(value: ReadPageResult): any {
        return uncast(value, r("ReadPageResult"));
    }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) { return val; }
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) { return val; }
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) { return invalidValue("array", val); }
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = val[key];
            }
        });
        return result;
    }

    if (typ === "any") { return val; }
    if (typ === null) {
        if (val === null) { return val; }
        return invalidValue(typ, val);
    }
    if (typ === false) { return invalidValue(typ, val); }
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) { return transformEnum(typ, val); }
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") { return transformDate(val); }
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "ReadPageResult": o([
        { json: "parse", js: "parse", typ: u(undefined, r("Parse")) },
    ], false),
    "Parse": o([
        { json: "title", js: "title", typ: u(undefined, "") },
        { json: "pageid", js: "pageid", typ: u(undefined, 0) },
        { json: "text", js: "text", typ: u(undefined, r("Text")) },
        { json: "langlinks", js: "langlinks", typ: u(undefined, a("any")) },
        { json: "categories", js: "categories", typ: u(undefined, a("any")) },
        { json: "links", js: "links", typ: u(undefined, a("any")) },
        { json: "templates", js: "templates", typ: u(undefined, a("any")) },
        { json: "images", js: "images", typ: u(undefined, a("any")) },
        { json: "externallinks", js: "externallinks", typ: u(undefined, a("any")) },
        { json: "sections", js: "sections", typ: u(undefined, a(r("Section"))) },
        { json: "parsewarnings", js: "parsewarnings", typ: u(undefined, a("any")) },
        { json: "displaytitle", js: "displaytitle", typ: u(undefined, "") },
        { json: "iwlinks", js: "iwlinks", typ: u(undefined, a("any")) },
        { json: "properties", js: "properties", typ: u(undefined, a("any")) },
    ], false),
    "Section": o([
        { json: "toclevel", js: "toclevel", typ: u(undefined, 0) },
        { json: "level", js: "level", typ: u(undefined, "") },
        { json: "line", js: "line", typ: u(undefined, "") },
        { json: "number", js: "number", typ: u(undefined, "") },
        { json: "index", js: "index", typ: u(undefined, "") },
        { json: "fromtitle", js: "fromtitle", typ: u(undefined, "") },
        { json: "byteoffset", js: "byteoffset", typ: u(undefined, 0) },
        { json: "anchor", js: "anchor", typ: u(undefined, "") },
    ], false),
    "Text": o([
        { json: "*", js: "*", typ: u(undefined, "") },
    ], false),
};
