import * as vscode from 'vscode';

export type CommandFactory = (context: vscode.ExtensionContext) => ((...args: unknown[]) => unknown);

export class WikitextCommandRegistrar {
    private context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public register(name: string, factory: CommandFactory) {
        const fullName = `wikitext.${name}`;
        const command: ((...args: unknown[]) => unknown) = factory(this.context);
        this.context.subscriptions.push(
            vscode.commands.registerCommand(fullName, command)
        );
    }
}
