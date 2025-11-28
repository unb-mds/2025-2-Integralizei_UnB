import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    // Ignorar pastas que não devem ser verificadas
    ignores: [
      "node_modules/",
      ".venv/",
      "venv/",
      "__pycache__/",
      "instance/",
      "coverage/",
      "login-service/" // O login-service tem seu próprio package.json
    ],
  },
];