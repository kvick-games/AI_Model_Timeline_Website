import assert from 'node:assert/strict';
import {test} from 'node:test';
import worker from './timeline-worker.mjs';

test('canonical redirects keep the query and normalize the host and slash', async () => {
  for (const url of ['https://dreamatron.ai/timeline?focus=gpt', 'https://www.dreamatron.ai/timeline/?focus=gpt']) {
    const response = await worker.fetch(new Request(url));
    assert.equal(response.status, 308);
    assert.equal(response.headers.get('Location'), 'https://dreamatron.ai/timeline/?focus=gpt');
  }
});

test('serves assets from the Pages repository without sending account credentials', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(String(url), 'https://kvick-games.github.io/AI_Model_Timeline_Website/logos/openai.svg?v=2');
    assert.equal(options.headers.get('Cookie'), null);
    assert.equal(options.headers.get('Authorization'), null);
    assert.equal(options.headers.get('If-None-Match'), 'asset-version');
    return new Response('<svg/>', {headers: {'Content-Type': 'image/svg+xml', 'Set-Cookie': 'origin=1'}});
  });
  const response = await worker.fetch(new Request('https://dreamatron.ai/timeline/logos/openai.svg?v=2', {
    headers: {Cookie: 'session=private', Authorization: 'Bearer private', 'If-None-Match': 'asset-version'},
  }));
  assert.equal(await response.text(), '<svg/>');
  assert.equal(response.headers.get('Set-Cookie'), null);
  assert.equal(response.headers.get('Content-Type'), 'image/svg+xml');
});

test('preserves missing-asset status and HEAD requests', async (t) => {
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.method, 'HEAD');
    return new Response(null, {status: 404});
  });
  assert.equal((await worker.fetch(new Request('https://dreamatron.ai/timeline/missing.png', {method: 'HEAD'}))).status, 404);
});

test('origin directory redirects stay under the public timeline path', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.redirect('https://kvick-games.github.io/AI_Model_Timeline_Website/logos/?v=1', 301));
  const response = await worker.fetch(new Request('https://dreamatron.ai/timeline/logos?v=1'));
  assert.equal(response.headers.get('Location'), 'https://dreamatron.ai/timeline/logos/?v=1');
});

test('nearby website routes pass through unchanged', async (t) => {
  const request = new Request('https://dreamatron.ai/timelines?x=1');
  t.mock.method(globalThis, 'fetch', async (actual) => {
    assert.equal(actual, request);
    return new Response('website');
  });
  assert.equal(await (await worker.fetch(request)).text(), 'website');
});

test('rejects writes and reports unavailable origins without caching errors', async (t) => {
  assert.equal((await worker.fetch(new Request('https://dreamatron.ai/timeline/', {method: 'POST'}))).status, 405);
  t.mock.method(console, 'error', () => {});
  t.mock.method(globalThis, 'fetch', async () => {throw new Error('offline');});
  const response = await worker.fetch(new Request('https://dreamatron.ai/timeline/'));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
