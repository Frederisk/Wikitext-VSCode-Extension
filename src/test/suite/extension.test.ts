/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../extension';

// suite('Extension TestSuite', () => {
//     vscode.window.showInformationMessage('Start all tests.');

//     test('Sample Test', () => {
//         assert.strictEqual(-1, [1, 2, 3].indexOf(5));
//         assert.strictEqual(-1, [1, 2, 3].indexOf(0));
//     });
// });


import { alterNativeValues } from '../../export_command/wikimedia_function/args';
suite('WikimediaFunction Args TestSuite', () => {
    test('AlterNativeValues Test', () => {

        // Arrange
        // meta
        const first: string = "first", second = "second", third = "third", alt = "|";

        // Act
        const first_Second = alterNativeValues(first, second);
        const und_und_Third = alterNativeValues(undefined, undefined, third);

        // Assert
        assert.strictEqual(first_Second, first + alt + second);
        assert.strictEqual(und_und_Third, third);
    });
});

import { getContentInfo, IPageInfos, InfoType } from '../../export_command/wikimedia_function/core';
suite('WikimediaFunction Core TestSuite', () => {
    test('GetContentInfo Test', () => {

        // Arrange
        // meta
        const pageTitle = "Some String";
        const content = "Content here";
        // test set
        const hasStr = `<%--  [PAGE_INFO] ${InfoType.PageTitle}=  #${pageTitle}#  [END_PAGE_INFO] --%>\r${content}`;
        const noStr = content;
        const mutiStr = `<%-- [PAGE_INFO]
        Comment=#Please do not remove this struct. It's record contains some important informations of edit. This struct will be removed automatically after you push edits.#
        PageTitle=#User:Rowe Wilson Frederisk Holme#
        PageID=#6364830#
        RevisionID=#60746059#
        ContentModel=#wikitext#
        ContentFormat=#text/x-wiki#
        [END_PAGE_INFO] --%>
        {{Soft redirect|User:Роу Уилсон Фредериск Холм}}
        <!--{{produceEncouragement|count=1}}-->{{patrol}}`;

        // Act
        const hasInfo = getContentInfo(hasStr);
        const noInfo = getContentInfo(noStr);
        const mutiInfo = getContentInfo(mutiStr);

        // Assert
        // hasInfo
        assert.strictEqual(hasInfo.content, content, "hasInfo content faild");
        assert.deepStrictEqual(hasInfo.info, {
            PageTitle: pageTitle,
            PageID: undefined,
            RevisionID: undefined,
            ContentFormat: undefined,
            ContentModel: undefined
        }, "hasInfo info faild");
        // noInfo
        assert.strictEqual(noInfo.content, content, "noInfo content faild");
        assert.deepStrictEqual(noInfo.info, undefined, "noInfo info faild");
        // mutiInfo
        assert.notStrictEqual(mutiInfo.info, undefined, "mutiInfo info faild");
    });
});

import { parseArgs } from '../../export_command/uri_function/uri';
suite('URIFunction URI TestSuite', () => {

    test('Parse Test', () => {

        // Arrange
        // meta
        const arg1 = "arg1", arg2 = "arg2", bare = "string";
        // test sets
        const singleStr = `${arg1}=1`;
        const mutiStr = `${arg1}=1&${arg2}=2`;
        const bareStr = bare;
        const mutiWithBareStr = `${arg1}=1&${bare}`;

        // Act
        const singlePar = parseArgs(singleStr);
        const mutiPar = parseArgs(mutiStr);
        const barePar = parseArgs(bareStr);
        const mutiWithBarePar = parseArgs(mutiWithBareStr);

        // Assert
        // singlePar
        assert.strictEqual(singlePar[arg1], "1");
        // mutiPar
        assert.strictEqual(mutiPar[arg1], "1");
        assert.strictEqual(mutiPar[arg2], "2");
        // barePar
        assert.strictEqual(barePar[bare], "");
        // muti&barePar
        assert.strictEqual(mutiWithBarePar[arg1], "1");
        assert.strictEqual(mutiWithBarePar[bare], "");
    });
});

import { getReplacedString } from '../../export_command/cite_function/web';
suite('CiteFunction Web TestSuite', () => {
    test('GetReplacedString Test', () => {

        // Arrange
        // meta data
        const tagName = "title";
        const tagBegin = `<!${tagName}>`;
        const tagEnd = `</!${tagName}>`;
        const argStr = `{$${tagName}}`;
        const content = "some string here";
        const title = "TITLE";
        const noTitle = undefined;
        // test set
        const onlyContentStr = content + content;
        const onlyTagStr = tagBegin + content + tagEnd + content;
        const onlyArgStr = content + argStr + content;
        const bothInStr = tagBegin + content + argStr + content + tagEnd;
        const bothOutStr = tagBegin + content + tagEnd + content + argStr;

        //Act
        // title = "TITLE"
        const tOnlyContentStr = getReplacedString(onlyContentStr, tagName, title);
        const tOnlyTagStr = getReplacedString(onlyTagStr, tagName, title);
        const tOnlyArgStr = getReplacedString(onlyArgStr, tagName, title);
        const tBothInStr = getReplacedString(bothInStr, tagName, title);
        const tBothOutStr = getReplacedString(bothOutStr, tagName, title);
        // noTitle = undefined
        const nOnlyContentStr = getReplacedString(onlyContentStr, tagName, noTitle);
        const nOnlyTagStr = getReplacedString(onlyTagStr, tagName, noTitle);
        const nOnlyArgStr = getReplacedString(onlyArgStr, tagName, noTitle);
        const nBothInStr = getReplacedString(bothInStr, tagName, noTitle);
        const nBothOutStr = getReplacedString(bothOutStr, tagName, noTitle);

        // Assert
        // title
        assert.strictEqual(tOnlyContentStr, content + content, "title only content faild");
        assert.strictEqual(tOnlyTagStr, content + content, "title only tag faild");
        assert.strictEqual(tOnlyArgStr, content + title + content, "title only arg faild");
        assert.strictEqual(tBothInStr, content + title + content, "title both in faild");
        assert.strictEqual(tBothOutStr, content + content + title, "title both out faild");
        // notitle
        assert.strictEqual(nOnlyContentStr, content + content, "no only content faild");
        assert.strictEqual(nOnlyTagStr, content, "no only tag faild");
        assert.strictEqual(nOnlyArgStr, content + content, "no only arg faild");
        assert.strictEqual(nBothInStr, "", "no both in falid");
        assert.strictEqual(nBothOutStr, content, "no both out faild");
    });
});
