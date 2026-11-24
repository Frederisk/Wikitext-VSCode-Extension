const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
    {
        files: ["**/*.ts"],
        ignores: ["**/out", "**/dist", "**/*.d.ts", "**/webpack.config.js", "**/eslint.config.js"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 5,
            sourceType: "module"
        },
        rules: {
            "@typescript-eslint/naming-convention": "warn",
            semi: "warn",
            curly: "warn",
            eqeqeq: "warn",
            "no-throw-literal": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];
