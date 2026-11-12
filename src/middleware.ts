import { NextResponse, type NextRequest } from 'next/server';

// Edge middleware is supported by the existing OpenNext Cloudflare adapter.
// Do not migrate to Node.js proxy without first checking adapter support.
export function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-wakato-lang', request.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'ja');
    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = { matcher: ['/', '/about', '/github-planet', '/otenkigurashi', '/coldkeep', '/recaptcha-game', '/denshouo'] };
