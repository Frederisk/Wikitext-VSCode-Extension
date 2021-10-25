import * as vscode from 'vscode';
import { instanceOfMWError } from '../../interface_definition/commonInterface';

export function showMWErrorMessage(name: string, error: unknown, moreInfo: string = ''): void {
    if (instanceOfMWError(error)) {
        vscode.window.showErrorMessage(`ErrorCode: ${error.code}; ErrorInfo: ${error.info}. ${moreInfo}`.trim());
    }
    else if (error instanceof Error) {
        vscode.window.showErrorMessage(`ErrorName: ${error.name}; ErrorMessage: ${error.message}. ${moreInfo}`.trim());
    }
    else {
        vscode.window.showErrorMessage(`${name} ERROR: ${JSON.stringify(error)}. ${moreInfo}`.trim());
    }
}
