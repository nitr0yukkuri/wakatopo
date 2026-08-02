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
    "take_screenshot.js",
  ]),
  {
    files: [
      "src/app/coldkeep/ColdKeepClient.tsx",
      "src/app/denshouo/DenshouoClient.tsx",
      "src/app/otenkigurashi/OtenkiGurashiClient.tsx",
      "src/components/canvas/CloudAscentCanvas.tsx",
      "src/components/canvas/Meteors.tsx",
      "src/components/canvas/MouseRepulsion.tsx",
      "src/components/canvas/SnowTransitionCanvas.tsx",
      "src/components/canvas/WaveTransitionCanvas.tsx",
      "src/components/canvas/abstractCore/useCoreParticles.ts",
    ],
    rules: {
      // R3F animation loops intentionally mutate Three.js refs and uniforms.
      "react-hooks/immutability": "off",
      // Procedural visual data is generated once inside memoized scene nodes.
      "react-hooks/purity": "off",
      // These client-only effects derive media-query/URL state after hydration.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["src/lib/otenkiToneBgm.ts"],
    rules: {
      // Tone.js instruments expose incompatible overloaded trigger signatures.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
