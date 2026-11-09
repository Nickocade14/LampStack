const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    // md5.js is a third-party library, not our code
    ignores: ["node_modules/", "public/js/md5.js"],
  },
  js.configs.recommended,
  {
    files: ["public/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      // Plain browser scripts loaded with <script>, not modules
      sourceType: "script",
      globals: { ...globals.browser },
    },
    rules: {
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      semi: "error",
    },
  },
  {
    files: ["eslint.config.js"],
    languageOptions: { sourceType: "commonjs", globals: { ...globals.node } },
  },
];
