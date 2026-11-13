import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

const config = defineCloudflareConfig({ incrementalCache: kvIncrementalCache });

// Images are served as pre-optimized assets (images.unoptimized = true).
// Next 16.4's unused image optimizer otherwise pulls native sharp into workerd.
config.buildCommand = "npm run build && node scripts/prepare-cloudflare-build.mjs";

export default config;
