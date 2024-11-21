/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

export type CommandFactory = (context: vscode.ExtensionContext, isBrowser: boolean) => ((...args: unknown[]) => unknown);

export class WikitextCommandRegistrar {
    private context: vscode.ExtensionContext;
    private isBrowser: boolean;
    constructor(context: vscode.ExtensionContext, isBrowser: boolean) {
        this.context = context;
        this.isBrowser = isBrowser;
    }

    public register(name: string, factory: CommandFactory) {
        const fullName = `wikitext.${name}`;
        const command: ((...args: unknown[]) => unknown) = factory(this.context, this.isBrowser);
        this.context.subscriptions.push(
            vscode.commands.registerCommand(fullName, command)
        );
    }
}
