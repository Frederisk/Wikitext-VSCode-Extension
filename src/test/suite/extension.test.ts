/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
});


import { alterNativeValues } from '../../export_command/wikimedia_function/args';
suite('wikimedia function test suite', () => {
    test('alterNativeValues test', () => {
        const first: string = "first", second = "second", third = "third", alt = "|";

        assert.strictEqual(alterNativeValues(first, second), first + alt + second);
        assert.strictEqual(alterNativeValues(undefined, undefined, third),third);
    });
});
