/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off",
  },
};
