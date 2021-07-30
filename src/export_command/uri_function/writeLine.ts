import * as vscode from 'vscode';
export function writeLine(query: string): void {
    vscode.window.showInformationMessage(query);
}