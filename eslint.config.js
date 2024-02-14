const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettierRecommended = require("eslint-plugin-prettier/recommended");
const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    prettierRecommended,
    {
        ignores: ["node_modules", "dist"],
    },
    {
        languageOptions: {
            ecmaVersion: 2021,
            globals: { ...globals.node, ...globals.browser, ...globals.es2015 },
        },
        rules: {
            "no-unused-vars": ["warn", { varsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
        },
    },
    {
        files: ["**/*.spec.ts"],
        languageOptions: {
            globals: globals.jest,
        },
    },
];
