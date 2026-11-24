const UPSTREAM_ORIGIN = "https://living-planet.nitr0yukkuri.workers.dev";
const LEGACY_HOSTS = new Set([
  "living-planet.nitr0yukkuri.workers.dev",
  "wakato.tech",
  "www.wakato.tech",
]);

export default {
  async fetch(request, env) {
    const incomingUrl = new URL(request.url);
    const upstreamUrl = new URL(
      `${incomingUrl.pathname}${incomingUrl.search}`,
      UPSTREAM_ORIGIN,
    );

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.set("x-forwarded-host", incomingUrl.host);
    headers.set("x-forwarded-proto", incomingUrl.protocol.slice(0, -1));

    const requestInit = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      requestInit.body = request.body;
    }

    try {
      const upstreamResponse = await fetch(new Request(upstreamUrl, requestInit));
      const location = upstreamResponse.headers.get("location");

      if (!location) {
        return upstreamResponse;
      }

      let redirectUrl;
      try {
        redirectUrl = new URL(location, upstreamUrl);
      } catch {
        return upstreamResponse;
      }

      if (!LEGACY_HOSTS.has(redirectUrl.host)) {
        return upstreamResponse;
      }

      redirectUrl.protocol = incomingUrl.protocol;
      redirectUrl.host = incomingUrl.host;

      const responseHeaders = new Headers(upstreamResponse.headers);
      responseHeaders.set("location", redirectUrl.toString());

      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      });
    } catch {
      return env.ASSETS.fetch(request);
    }
  },
};
