/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
//@ts-check

"use strict";

const path = require('path');
const webpack = require('webpack');

/** @type {webpack.Configuration} */
const webConfig = {
    context: __dirname,
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    target: "webworker", // web extensions run in a webworker context
    entry: {
        "extension-web": "./src/extension-web.ts", // source of the web extension main file
        "test/suite/index-web": "./src/test/suite/index-web.ts", // source of the web extension test runner
    },
    output: {
        filename: "[name].js",
        path: path.join(__dirname, "./dist"),
        libraryTarget: "commonjs",
    },
    resolve: {
        mainFields: ["browser", "module", "main"], // look for `browser` entry point in imported node modules
        extensions: [".ts", ".js"], // support ts-files and js-files
        alias: {
            // provides alternate implementation for node module and source files
        },
        fallback: {
            // Webpack 5 no longer polyfills Node.js core modules automatically.
            // see https://webpack.js.org/configuration/resolve/#resolvefallback
            // for the list of Node.js core module polyfills.
            assert: require.resolve('assert'),
            http: require.resolve('stream-http'),
            https: require.resolve('https-browserify'),
            url: require.resolve('url/'),
            crypto: require.resolve('crypto-browserify'),
            zlib: require.resolve('browserify-zlib'),
            stream: require.resolve('stream-browserify'),
            querystring: require.resolve('querystring-es3'),
            path: require.resolve('path-browserify'),
            os: require.resolve('os-browserify/browser'),
            // request: require.resolve('browser-request'),
            tls: require.resolve('tls-browserify'),
            net: require.resolve('net'),
            async_hooks: require.resolve('async-hook-browser'),
            fs: require.resolve('browserify-fs'),
            buffer: require.resolve('buffer'),
            vm: false,
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
        ],
    },
    plugins: [
        // Work around for Buffer is undefined:
        // https://github.com/webpack/changelog-v5/issues/10
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            process: "process/browser", // provide a shim for the global `process` variable
        }),
    ],
    externals: {
        vscode: "commonjs vscode", // ignored because it doesn't exist
    },
    performance: {
        hints: false,
    },
    devtool: "nosources-source-map", // create a source map that points to the original source file
};

/**@type {webpack.Configuration} */
const nodeConfig = {
    context: __dirname,
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    // entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    entry: {
        'extension-node': "./src/extension-node.ts", // source of the node extension main file
        'test/suite/index-node': "./src/test/suite/index-node.ts", // source of the node extension test runner
        "test/suite/extension.test": "./src/test/suite/extension.test.ts", // create a separate file for the tests, to be found by glob
        "test/runTest": "./src/test/runTest", // used to start the VS Code test runner (@vscode/test-electron)
    },
    output: { // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",
    },
    resolve: {
        mainFields: ["module", "main"],
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [{
            test: /\.ts$/,
            exclude: /node_modules/,
            use: [{
                loader: 'ts-loader',
            }]
        }]
    },
    externals: {
        vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        mocha: "commonjs mocha", // don't bundle
        '@vscode/test-electron': "commonjs @vscode/test-electron" // don't bundle
    },
    performance: {
        hints: false
    },
    // mode: "production"
    devtool: 'nosources-source-map', // create a source map that points to the original source file
};

module.exports = [webConfig, nodeConfig];
