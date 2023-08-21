module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2022,
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
        "deprecation"
    ],
    extends: [
        "eslint:recommended"
    ],
    rules: {
        "no-unused-vars": ["warn", { "args": "none", "varsIgnorePattern": "^__" }],
        "deprecation/deprecation": "warn"
    },
    ignorePatterns: [
        "/node_modules/", "/deploy/", "/cache/", "/.editor/", "/languages/", "/.editor/", "/assets/", "/static/", "/**/.eslintrc.cjs"
    ],
    overrides: [
    ]
};