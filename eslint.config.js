// Lint gate for game code. This is wired into `npm run build` (see package.json)
// because Vite/Rollup does NOT catch references to undefined variables or
// functions: the bundler treats an unresolved identifier as a possible global,
// so `spawnEnemy()` or a typo'd `palyer` builds clean and only throws a
// ReferenceError at runtime when that code path runs (e.g. a button click).
// `no-undef` catches that exact class statically, before the player hits it.
// Kept correctness-only and quiet on good code: no-undef errors (and block the
// build); unused vars warn (do not block).
import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: { ...globals.browser },
        },
        rules: {
            "no-undef": "error",
            "no-unused-vars": "warn",
        },
    },
];
