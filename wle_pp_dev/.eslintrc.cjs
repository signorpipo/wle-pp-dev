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
        "deprecation",
        "@typescript-eslint/eslint-plugin"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        "semi": "error",
        "no-unused-vars": ["error", { "args": "none", "varsIgnorePattern": "^__" }],
        "deprecation/deprecation": "error",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off"
    },
    ignorePatterns: [
        "/dev/",
        "/assets/",
        "/static/",
        "/node_modules/",
        "/deploy/",
        "/cache/",
        "/languages/",
        "/.editor/",
        ".eslintrc.cjs"
    ],
    overrides: [
        {
            "files": ["*.ts"],
            "rules": {
                "@typescript-eslint/explicit-function-return-type": [
                    "error",
                    { "allowExpressions": true }
                ]
            }
        }
    ]
};