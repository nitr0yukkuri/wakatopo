export const PORTFOLIO_SITE_URL = 'https://wakato.tech';
export const WRITING_SITE_URL = process.env.NEXT_PUBLIC_WRITING_SITE_URL || 'https://wakato.tech/writing';
export const WRITING_PATH = '/writing';
export const WRITING_OG_IMAGE = PORTFOLIO_SITE_URL + '/opengraph-image.png';

export function writingUrl(pathname = '') {
    const base = WRITING_SITE_URL.replace(/\/$/, '');
    return pathname ? base + '/' + pathname.replace(/^\//, '') : base;
}
