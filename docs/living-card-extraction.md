# Living Card extraction (Issue #96)

The capture route is the portfolio adapter: it resolves weather/season from the
existing provider and URL, initializes the surrounding portfolio runtime, and
passes an explicit snapshot to `LivingCard`. The card does not read Zustand,
Next navigation state, or an external API.

- `LivingCard`: card layout and user-configurable title/preview label.
- `CardScene`: WebGL composition, explicit world and activity.
- `AbstractCoreVisual`, `WeatherVisual`, `WeatherEffectsVisual`: shared visual
  primitives. Existing portfolio adapters preserve their store-based behavior.
- The capture card deliberately omits interactive core pointer handling and
  portfolio-specific sun/moon social links.

The legacy 800×400 capture size, Clear-to-Morning mapping, and four HTML
attributes used by `scripts/weather_preview_state.mjs` are unchanged.
This is a rendering-boundary extraction, not a standalone Action release.
Next.js dynamic imports, Tailwind classes, viewport-sized weather effects,
shared shaders, and existing animation clocks remain dependencies; a standalone
host must provide them. Providers, manifest hashing, capture readiness, and
publishing are covered by the other issues under #95.

Regression commands: `npm run test:workflow`, `npx tsc --noEmit`,
`npx playwright test e2e/living-card.spec.ts e2e/otenkigurashi-weather.spec.ts`.
