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
        "semi": "error",
        "no-unused-vars": ["error", { "args": "none", "varsIgnorePattern": "^__" }],
        "deprecation/deprecation": "error"
    },
    ignorePatterns: [
        "/node_modules/",
        "/deploy/",
        "/cache/",
        "/languages/",
        "/.editor/",
        "/assets/",
        "/static/",
        ".eslintrc.cjs"
    ],
    overrides: [
    ]
};