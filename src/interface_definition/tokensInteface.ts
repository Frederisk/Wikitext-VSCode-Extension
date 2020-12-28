/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { a, u, o, m, r, cast, uncast } from "./convertFunction";

/*
    TokensResult {
        batchcomplete?: string,
        query?: Query {
            tokens?: Tokens {
                csrftoken?: string
            }
        }
    }
 */

export interface TokensResult {
    batchcomplete?: string;
    query?: Query;
}

export interface Query {
    tokens?: Tokens;
}

export interface Tokens {
    csrftoken?: string;
}

export class TokensConvert {
    public static toTokensResult(json: any): TokensResult {
        return cast(json, r("TokensResult"), tokensTypeMap);
    }

    public static tokensResultToJson(value: TokensResult): any {
        return uncast(value, r("TokensResult"), tokensTypeMap);
    }
}

const tokensTypeMap: any = {
    "TokensResult": o([
        { json: "batchcomplete", js: "batchcomplete", typ: u(undefined, "") },
        { json: "query", js: "query", typ: u(undefined, r("Query")) },
    ], false),
    "Query": o([
        { json: "tokens", js: "tokens", typ: u(undefined, r("Tokens")) },
    ], false),
    "Tokens": o([
        { json: "csrftoken", js: "csrftoken", typ: u(undefined, "") },
    ], false),
};
