const { ESLint } = require("eslint");

module.exports = {
  files: ["src/**/*.ts"],
  ignores: ["node_modules", "dist", "build"],
  languageOptions: {
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    // Adicione outras regras específicas que desejar
  },
};
