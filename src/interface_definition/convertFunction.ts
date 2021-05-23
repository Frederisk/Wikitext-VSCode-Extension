/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

function invalidValue(typ: any, val: any, key: any = ''): never {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`,);
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

function transform(value: any, type: any, getProps: any, key: any, typeMap: any): any {
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
                return transform(val, typ, getProps, "", typeMap);
            } catch (_) { }
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
        return val.map(el => transform(el, typ, getProps, "", typeMap));
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
        Object.getOwnPropertyNames(props).forEach(item => {
            const prop = props[item];
            const v = Object.prototype.hasOwnProperty.call(val, item) ? val[item] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key, typeMap);
        });
        Object.getOwnPropertyNames(val).forEach(item => {
            if (!Object.prototype.hasOwnProperty.call(props, item)) {
                result[item] = transform(val[item], additional, getProps, item, typeMap);/* val[key]; */
            }
        });
        return result;
    }

    if (type === "any") { return value; }
    if (type === null) {
        if (value === null) { return value; }
        return invalidValue(type, value);
    }
    if (type === false) { return invalidValue(type, value); }
    while (typeof type === "object" && type.ref !== undefined) {
        type = typeMap[type.ref];
    }
    if (Array.isArray(type)) { return transformEnum(type, value); }
    if (typeof type === "object") {
        return type.hasOwnProperty("unionMembers") ? transformUnion(type.unionMembers, value)
            : type.hasOwnProperty("arrayItems") ? transformArray(type.arrayItems, value)
                : type.hasOwnProperty("props") ? transformObject(getProps(type), type.additional, value)
                    : invalidValue(type, value);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (type === Date && typeof value !== "number") { return transformDate(value); }
    return transformPrimitive(type, value);
}

export function cast<T>(val: any, typ: any, typeMap: any): T {
    return transform(val, typ, jsonToJSProps, "", typeMap);
}

export function uncast<T>(val: T, typ: any, typeMap: any): any {
    return transform(val, typ, jsToJSONProps, "", typeMap);
}

export function a(typ: any) {
    return { arrayItems: typ };
}

export function u(...typs: any[]) {
    return { unionMembers: typs };
}

export function o(props: { json: string; js: string; typ: any }[], additional: any) {
    return { props, additional };
}

export function m(additional: any) {
    return { props: [], additional };
}

export function r(name: string) {
    return { ref: name };
}
