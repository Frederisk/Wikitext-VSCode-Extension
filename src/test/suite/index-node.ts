/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Rowe Wilson Frederisk Holme. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import Mocha from 'mocha';

export function run(): Promise<void> {
    // Create the mocha test
    const mocha: Mocha = new Mocha({
        ui: 'tdd',
        color: true
    });
    // mocha.useColors(true);

    // Register the tdd globals before loading tests bundled by webpack.
    mocha.suite.emit("pre-require", globalThis, "bundled-tests", mocha);

    // Bundle all tests through webpack; PnP has no node_modules for runtime globs.
    const importAll = (r: __WebpackModuleApi.RequireContext) => r.keys().forEach(r);
    importAll(require.context('.', true, /\.test$/));

    return new Promise<void>((c, e): void => {
        try {
            // Run the mocha test
            mocha.run((failures: number) => {
                if (failures > 0) {
                    e(new Error(`${failures} tests failed.`));
                } else {
                    c();
                }
            });
        } catch (err) {
            console.error(err);
            e(err);
        }
    });
}
