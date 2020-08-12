import * as querystring from "querystring";
import { IncomingMessage, RequestOptions, ClientRequest } from "http";
import {request} from "https";
import { getHost } from "../host_function/host";
import * as vscode from "vscode";

export function sendRequest(queryInput: querystring.ParsedUrlQueryInput, callback?: ((res: IncomingMessage) => void)) : void{
    const args: string = querystring.stringify(queryInput);
    const opts: RequestOptions = getRequestOptions(10000, args);
    
    const req: ClientRequest = request(opts, callback);
    // write arguments.
    req.write(args);
    // call end methord.
    req.end();
}

function getRequestOptions(timeout: number, args : string): RequestOptions{
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");
    // get host
    const host: string | undefined = getHost();
    /** target content */
    const opts: RequestOptions = {
        hostname: host,
        path: config.get("apiPath"),
        method: "POST",
        timeout: timeout,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(args)
        }
    };
    return opts;
}
