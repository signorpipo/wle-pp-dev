module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "tsconfig.json",
        tsconfigRootDir: __dirname
    },
    env: {
        browser: true
    },
    globals: {
    },
    plugins: [
        "@typescript-eslint/eslint-plugin",
        "deprecation"
    ],
    extends: [
        "eslint:recommended"
    ],
    rules: {
        "deprecation/deprecation": "warn",
        "no-unused-vars": ["warn", { "args": "none", "varsIgnorePattern": "^__" }]
    },
    ignorePatterns: [
        "/node_modules/", "/deploy/", "/cache/", "/.editor/", "/languages/", "/.editor/", "/assets/", "/static/", "/**/.eslintrc.cjs"
    ],
    overrides: [
    ]
};