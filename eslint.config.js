module.exports = {
  files: ["src/**/*.ts"],
  ignores: ["node_modules", "dist", "build"],
  languageOptions: {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      project: "./tsconfig.json",
    },
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    // Outras regras
  },
};
