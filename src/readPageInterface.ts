// To parse this data:
//
//   import { Convert, ReadPageResult } from "./file";
//
//   const readPageResult = Convert.toReadPageResult(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface ReadPageResult {
    api?: Api;
}

export interface Api {
    $?:     ApiClass;
    query?: Query[];
}

export interface ApiClass {
    batchcomplete?: string;
}

export interface Query {
    normalized?: Normalized[];
    redirects?:  Redirect[];
    pages?:      QueryPage[];
}

export interface Normalized {
    n?: NElement[];
}

export interface NElement {
    $?: N;
}

export interface N {
    from?: string;
    to?:   string;
}

export interface QueryPage {
    page?: PagePage[];
}

export interface PagePage {
    $?:         Page;
    revisions?: Revision[];
}

export interface Page {
    _idx?:   string;
    pageid?: string;
    ns?:     string;
    title?:  string;
}

export interface Revision {
    rev?: Rev[];
}

export interface Rev {
    slots?: RevSlot[];
}

export interface RevSlot {
    slot?: SlotSlot[];
}

export interface SlotSlot {
    _?: string;
    $?: Slot;
}

export interface Slot {
    contentmodel?:  string;
    contentformat?: string;
    role?:          string;
    "xml:space"?:   string;
}

export interface Redirect {
    r?: NElement[];
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
        if (typeof typ === typeof val) return val;
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
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
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

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
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
    ], false),
    "Revision": o([
        { json: "rev", js: "rev", typ: u(undefined, a(r("Rev"))) },
    ], false),
    "Rev": o([
        { json: "slots", js: "slots", typ: u(undefined, a(r("RevSlot"))) },
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
