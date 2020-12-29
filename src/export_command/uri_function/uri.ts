/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { action, alterNativeValues, prop, contextModel } from '../wikimedia_function/args';
import { getView } from '../wikimedia_function/view';

interface Parameters {
    [Key: string]: string;
}

export class WikitextUriHandler implements vscode.UriHandler {

    private uriPath?: string;
    private uriFSPath?: string;
    private uriParameters?: Parameters;

    handleUri = (uri: vscode.Uri): void => {
        // vscode://rowewilsonfrederiskholme.wikitext/WriteLine?你好，世界！
        switch (uri.path) {
            // Write
            case "/WriteLine":
            case "/Write":
                vscode.window.showInformationMessage(uri.query);
                break;
            // Action:
            default:
                this.uriPath = uri.path;
                this.uriFSPath = uri.fsPath;
                this.uriParameters = WikitextUriHandler.parseArgs(uri.query);
                this.act();
                break;
        }
    }

    private act(): void {
        switch (this.uriPath) {
            case "/ViewPage":
                break;
            default:
                break;
        }
    }

    async viewPage(query: string): Promise<void> {
        const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("wikitext");

        const args: any = {
            'action': action.parse,
            'prop': alterNativeValues(
                prop.text,
                prop.displayTitle,
                prop.categoriesHTML,
                (config.get("getCss") ? prop.headHTML : undefined)
            ),
        };
        if (config.get("redirects")) {
            args['redirects'] = "true";
        }

        const pars: Parameters = WikitextUriHandler.parseArgs(query);
        if (pars["PageID"]) {
            args["pageid"] = pars["PageID"];
        }
        else if (pars["Page"]) {
            args["page"] = pars["Page"];
        }
        else if (pars["Text"]) {
            args["text"] = pars["Text"];
            args['contentmodel'] = contextModel.wikitext;
            args['pst'] = "yes";
        }
        else {
            return undefined;
        }
        getView("pageViewer", "WikiViewer", args);
    }

    static parseArgs(query: string): Parameters {
        const queries = query.split("&");
        let pars: Parameters = {};
        for (const item of queries) {
            const eq: number = item.indexOf("=");
            if (eq >= 0) {
                pars[item.substring(0, eq)] = item.substring(eq + 1);
            }
            else {
                pars[item] = "";
            }
        }
        return pars;
    }
}
