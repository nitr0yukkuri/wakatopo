# Cloudflare Pages aliases

This Pages project keeps the full portfolio on the existing Cloudflare Worker and proxies requests to it. That preserves Next.js server rendering, language headers, and the client-side 3D experience without converting the application to a static export.

## Cloudflare Pages settings

- Project name: `wakato-lp`
- Deploy type: Direct Upload
- Upload the contents of this directory, keeping `_worker.js` and `index.html` at the archive root.
- Expected Pages hostname after project creation: `wakato-lp.pages.dev`. This PR does not create the Pages project, so confirm the hostname in Cloudflare before deploying.
- `wakato.pages.dev` is already serving an unrelated attendance-management service, so do not point portfolio DNS at that hostname.

The `_worker.js` file proxies every request to the current Cloudflare Worker and keeps the `pages.dev` hostname in the browser. `index.html` is a readable fallback if the upstream Worker cannot be reached.

Direct Upload projects are updated by uploading a new deployment; Cloudflare does not allow switching such a project to Git integration later.

## SEO and DNS cutover

The application on `main` still sets `metadataBase` and its sitemap URL to `https://wakato.tech`. This proxy alone does not migrate canonical URLs, sitemap, robots, or language alternates. Choose the final hostname and update those values before making the Pages hostname the production address.

Only configure a custom domain after confirming that its registration and DNS are under your control. This PR does not change DNS records.

## is-a.dev

After the `wakato.is-a.dev` registration is approved by is-a.dev, add it as a custom domain to this Pages project and point it to `wakato-lp.pages.dev`. is-a.dev requests must be prepared and submitted by the account owner, following that service's rules; the registry explicitly prohibits AI-generated registration requests.
