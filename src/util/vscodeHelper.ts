import { MwnError } from 'mwn/build/error';
import * as vscode from 'vscode';

import type { TextEditor, TextEditorEdit } from 'vscode';

/**
 * Get `wikitext` workspace configuration object.
 *
 * If the result is `undefined`, 'null', or empty string, it will throw an error.
 * @param section A dot-separated identifier.
 * @returns The value `section` denotes.
 */
export function getConfig<T>(section: string): T | never {
    const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('wikitext');
    const value: T | undefined = config.get(section);
    if (value === undefined ||
        value === null ||
        (value instanceof String && value.length === 0)
    ) {
        throw new Error(`In the settings of Wikitext, the value of ${section} is empty. Please check and fill it.`);
    }
    return value;
}

/**
 * Force close the editor.
 *
 * @param editor The editor to close.
 */
export async function closeEditorForce(editor: TextEditor): Promise<void> {
    await editor?.edit((edit: TextEditorEdit): void =>
        // delete all text
        edit.delete(
            // the range of all document: from the beginning to the end
            new vscode.Range(
                new vscode.Position(0, 0), // beginning
                editor.document.lineAt(
                    editor.document.lineCount - 1
                ).rangeIncludingLineBreak.end // end
            )
        )
    ).then(async (): Promise<void> => {
        // close the activate editor
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    });
}

/**
 * Show an information message to users.
 *
 * @param msg The message to show.
 * @returns A thenable that resolves to the selected item or undefined when being dismissed.
 */
export async function showInfoMessageAsync(msg: string): Promise<string | undefined> {
    return await vscode.window.showInformationMessage(msg);
}

/**
 * Show an warning message to users.
 *
 * @param msg The message to show.
 * @returns A thenable that resolves to the selected item or undefined when being dismissed.
 */
export async function showWarningMessageAsync(msg: string): Promise<string | undefined> {
    return await vscode.window.showWarningMessage(msg);
}

/**
 * Show an error message via `Error`.
 *
 * @param error The error which provide message content to display.
 * @param moreInfo It will be expended to the error message.
 */
export async function showErrorMessageFromErrorAsync(error: unknown, moreInfo = ''): Promise<string | undefined> {
    if (error instanceof MwnError) {
        return await vscode.window.showErrorMessage(
            `MwnError. ErrorCode: '${error.code}'; ErrorInfo: '${error.info}'; ${moreInfo}`.trim()
        );
    } else if (error instanceof Error) {
        return await vscode.window.showErrorMessage(
            `ExtensionError. ErrorName: '${error.name}'; ErrorMessage: '${error.message}'; ${moreInfo}`.trim()
        );
    } else {
        return await vscode.window.showErrorMessage(
            `OtherError. ErrorName: '${JSON.stringify(error)}'; ${moreInfo}`.trim()
        );
    }
}

/**
 * Set a message to the status bar.
 *
 * @param msg The message to show.
 * @returns  A disposable which hides the status bar message.
 */
export function createStatusBarMessage(msg: string): vscode.Disposable {
    return vscode.window.setStatusBarMessage('Wikitext: ' + msg);
}
