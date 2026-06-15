module.exports = {
    // Configuration for JavaScript files
    parser: "@typescript-eslint/parser",
    extends: ["airbnb-base", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended", "prettier"],
    rules: {
        "prettier/prettier": [
            "error",
            {
                semi: false,
                tabWidth: 4,
                singleQuote: false,
                endOfLine: "auto",
                arrowParens: "avoid",
                printWidth: 120,
            },
        ],
    },
    overrides: [
        // Configuration for TypeScript files
        {
            files: ["src/**/*.ts"],
            plugins: ["@typescript-eslint", "unused-imports", "simple-import-sort"],
            extends: ["airbnb-base", "airbnb-typescript", "plugin:prettier/recommended"],
            parserOptions: {
                project: "./tsconfig.json",
            },
            rules: {
                "prettier/prettier": [
                    "error",
                    {
                        semi: false,
                        tabWidth: 4,
                        singleQuote: false,
                        endOfLine: "auto",
                        arrowParens: "avoid",
                        printWidth: 120,
                    },
                ],
                "import/no-cycle": "off",
                "max-classes-per-file": "off",
                "class-methods-use-this": "off",
                "no-shadow": "off",
                "@typescript-eslint/no-shadow": "off",
                "react/jsx-filename-extension": "off",
                "react/react-in-jsx-scope": "off",
                "@typescript-eslint/comma-dangle": "off", // Avoid conflict rule between Eslint and Prettier
                "@typescript-eslint/consistent-type-imports": "error", // Ensure `import type` is used when it's necessary
                "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"], // Overrides Airbnb configuration and enable no-restricted-syntax
                "import/prefer-default-export": "off", // Named export is easier to refactor automatically
                "@typescript-eslint/no-unused-vars": "off",
                "simple-import-sort/imports": "error", // Import configuration for `eslint-plugin-simple-import-sort`
                "simple-import-sort/exports": "error", // Export configuration for `eslint-plugin-simple-import-sort`
                "unused-imports/no-unused-imports": "error",
                "unused-imports/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
                "no-param-reassign": "off",
                "@typescript-eslint/no-use-before-define": "off",
                "@typescript-eslint/naming-convention": [
                    "error",
                    {
                        selector: "variable",
                        format: ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"],
                    },
                    {
                        selector: "function",
                        format: ["camelCase", "PascalCase"],
                    },
                    {
                        selector: "typeLike",
                        format: [],
                        custom: {
                            regex: "^T_[A-Z][a-zA-Z]+$",
                            match: true,
                        },
                    },
                    {
                        selector: "interface",
                        format: [],
                        custom: {
                            regex: "^I_[A-Z][a-zA-Z]+$",
                            match: true,
                        },
                    },
                    {
                        selector: "enum",
                        format: [],
                        custom: {
                            regex: "^E_[A-Z][a-zA-Z]+$",
                            match: true,
                        },
                    },
                    {
                        selector: "class",
                        format: ["PascalCase"],
                    },
                ],
            },
        },
    ],
}
