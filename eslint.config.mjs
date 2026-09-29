import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [
    // ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),
    {
        files: ['**/*.ts'],
        ignores: ["**/out", "**/dist", "**/*.d.ts", "**/webpack.config.js", '**/eslint.config.mjs'],
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
