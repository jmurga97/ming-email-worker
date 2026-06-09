import path from "node:path";
import { fileURLToPath } from "node:url";

import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import tseslint from "typescript-eslint";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const typeScriptFiles = ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"];
const sharedParserOptions = {
  projectService: true,
  tsconfigRootDir: rootDir,
};

const typeCheckedConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: typeScriptFiles,
}));

export default defineConfig(
  {
    ignores: [
      "dist/**",
      ".wrangler/**",
      "node_modules/**",
      "worker-configuration.d.ts",
      "*.config.js",
      "bun.lock",
    ],
  },
  {
    files: typeScriptFiles,
    ...js.configs.recommended,
  },
  ...typeCheckedConfigs,
  {
    files: typeScriptFiles,
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.worker,
      },
      parserOptions: sharedParserOptions,
      sourceType: "module",
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      eqeqeq: ["error", "always"],
      "max-depth": ["warn", 4],
      "max-lines-per-function": [
        "warn",
        {
          max: 80,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-params": ["warn", 6],
      "no-console": ["warn", { allow: ["error", "log"] }],
      "no-unused-vars": "off",
      "no-warning-comments": [
        "warn",
        {
          location: "anywhere",
          terms: ["fix", "fixme", "todo", "xxx"],
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": ["error", { caseSensitive: false, ignore: ["^bun:test$"] }],
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
    settings: {
      ...importPlugin.flatConfigs.typescript.settings,
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: path.join(rootDir, "tsconfig.json"),
        },
        node: {
          extensions: [".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".d.ts"],
        },
      },
    },
  },
  {
    files: ["src/app/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*", "../../*", "../../../*"],
              message: "Use internal aliases in application entrypoints.",
            },
            {
              regex: "^@/modules/[^/]+/(?!routes$).+",
              message: "The app layer may import only module entrypoints.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/shared/**/*.ts"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: rootDir,
          zones: [
            {
              target: "./src/shared",
              from: ["./src/app/**/*", "./src/modules/*/routes.ts", "./src/modules/*/routes/**/*"],
              message: "Shared code must not depend on app or HTTP routes.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/modules/*/services/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/app(?:/.*)?$",
              message: "Services must not depend on the app layer.",
            },
            {
              regex: "^@/modules/[^/]+/routes(?:$|/.*)",
              message: "Services must not depend on routes.",
            },
          ],
        },
      ],
    },
  },
);
