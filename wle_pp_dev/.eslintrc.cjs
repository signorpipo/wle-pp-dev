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
        "eslint:recommended"
    ],
    rules: {
        "semi": "error",
        "no-unused-vars": ["error", { "args": "none", "varsIgnorePattern": "^__" }],
        "deprecation/deprecation": "error",
        "@typescript-eslint/no-unused-vars": ["warn", { "args": "none", "varsIgnorePattern": "^__" }]
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
                "prefer-const": "error"
            }
        },
        {
            "files": ["*.d.ts"],
            "rules": {
                "no-unused-vars": "off"
            }
        }
    ]
};