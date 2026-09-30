const PUBLIC_HOST = 'dreamatron.ai';
const PUBLIC_PATH = '/timeline/';
const ORIGIN = 'https://kvick-games.github.io';
const ORIGIN_PATH = '/AI_Model_Timeline_Website/';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // The trailing wildcard also matches query strings on /timeline. Leave
    // similarly named website paths (such as /timelines) at their original host.
    if (url.pathname !== '/timeline' && !url.pathname.startsWith(PUBLIC_PATH)) {
      return fetch(request);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: {Allow: 'GET, HEAD'},
      });
    }

    if (url.hostname !== PUBLIC_HOST || url.protocol !== 'https:' || url.pathname === '/timeline') {
      url.protocol = 'https:';
      url.host = PUBLIC_HOST;
      if (url.pathname === '/timeline') url.pathname = PUBLIC_PATH;
      return Response.redirect(url.href, 308);
    }

    const upstream = new URL(ORIGIN);
    upstream.pathname = ORIGIN_PATH + url.pathname.slice(PUBLIC_PATH.length);
    upstream.search = url.search;
    // Never send Dreamatron account cookies or authorization to the public origin.
    const headers = new Headers();
    for (const name of ['Accept', 'Accept-Encoding', 'If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) {
      const value = request.headers.get(name);
      if (value !== null) headers.set(name, value);
    }

    try {
      const response = await fetch(upstream, {method: request.method, headers, redirect: 'manual'});
      const result = new Response(response.body, response);
      result.headers.delete('Set-Cookie');
      const location = result.headers.get('Location');
      if (location) {
        const target = new URL(location, upstream);
        if (target.origin === ORIGIN && target.pathname.startsWith(ORIGIN_PATH)) {
          target.host = PUBLIC_HOST;
          target.pathname = PUBLIC_PATH + target.pathname.slice(ORIGIN_PATH.length);
          result.headers.set('Location', target.href);
        }
      }
      if (result.headers.get('Content-Type')?.includes('text/html')) {
        result.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }
      result.headers.set('X-Content-Type-Options', 'nosniff');
      return result;
    } catch (error) {
      console.error(JSON.stringify({message: 'Timeline origin unavailable', error: String(error)}));
      return new Response('The timeline is temporarily unavailable. Please try again shortly.', {
        status: 502,
        headers: {'Cache-Control': 'no-store'},
      });
    }
  },
};
