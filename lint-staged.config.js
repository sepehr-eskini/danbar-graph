module.exports = {
    "**/*.{js,cjs,ts,ts}": ["eslint . --fix", "eslint ."],
    "**/*.ts?(x)": () => "npm run check-types",
    "**/*.{json,yaml}": ["prettier --write"],
}
