import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // mobile/ is a separate Expo/React Native project living in this same
    // repo (for GitHub Desktop convenience) — it has its own package.json
    // and its own lint setup, and isn't part of the Next.js website build.
    // Added 2026-08-01 after discovering this omission was silently
    // breaking every production deploy since the native app was first
    // added to the repo (Next.js's build type-checks/lints everything
    // these configs match, and mobile/'s dependencies aren't installed by
    // the website's own `npm install`).
    "mobile/**",
  ]),
]);

export default eslintConfig;
