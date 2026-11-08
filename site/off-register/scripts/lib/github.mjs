// Minimal GitHub client for the data pipelines: token auth, retries with backoff, rate-limit waits.
const API = 'https://api.github.com';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function token() {
  const t = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!t) throw new Error('GITHUB_TOKEN is not set (locally: GITHUB_TOKEN=$(gh auth token) npm run data)');
  return t;
}

// Retries 5xx, network errors and secondary rate limits; waits out a primary limit if it resets within 90 s.
export async function gh(path, { method = 'GET', body, raw = false, accept = 'application/vnd.github+json', allow404 = false } = {}) {
  for (let attempt = 1; ; attempt++) {
    let res;
    try {
      res = await fetch(path.startsWith('http') ? path : API + path, {
        method, body: body && JSON.stringify(body),
        headers: { authorization: `Bearer ${token()}`, accept, 'x-github-api-version': '2022-11-28', 'user-agent': 'aspire488-portfolio-data' },
        signal: AbortSignal.timeout(20000),
      });
    } catch (e) {
      if (attempt >= 4) throw e;
      await sleep(1000 * 2 ** attempt); continue;
    }
    if (res.status === 404 && allow404) return null;
    const remaining = +res.headers.get('x-ratelimit-remaining');
    if ((res.status === 403 || res.status === 429) && attempt < 4) {
      const reset = +res.headers.get('x-ratelimit-reset') * 1000 - Date.now();
      const retryAfter = +res.headers.get('retry-after') * 1000;
      const wait = retryAfter || (remaining === 0 ? reset + 1000 : 2000 * 2 ** attempt);
      if (wait > 90000) throw new Error(`GitHub rate limit: resets in ${Math.round(wait / 1000)} s`);
      await sleep(wait); continue;
    }
    if (res.status >= 500 && attempt < 4) { await sleep(1000 * 2 ** attempt); continue; }
    if (!res.ok) throw new Error(`GitHub ${method} ${path}: ${res.status} ${(await res.text()).slice(0, 200)}`);
    return raw ? res : res.json();
  }
}

export async function graphql(query, variables = {}) {
  const out = await gh('/graphql', { method: 'POST', body: { query, variables } });
  if (out.errors?.length) throw new Error('GraphQL: ' + out.errors.map((e) => e.message).join('; '));
  return out.data;
}

// Count items on a paginated list endpoint with one request (per_page=1, read the last page number).
export async function countPages(path) {
  const res = await gh(`${path}${path.includes('?') ? '&' : '?'}per_page=1`, { raw: true, allow404: true });
  if (!res) return 0;
  const last = /[?&]page=(\d+)>; rel="last"/.exec(res.headers.get('link') ?? '');
  if (last) return +last[1];
  return (await res.json()).length;
}

// Is a public URL actually up? HEAD first, GET if the host refuses HEAD.
export async function isLive(url, tries = 3) {
  for (let i = 0; i < tries; i++) { const r = await probe(url); if (r !== null) return r; await sleep(1500 * (i + 1)); }
  return false;
}
// true/false when the host answered definitively; null on a timeout or 5xx, so the caller retries
async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', signal: AbortSignal.timeout(10000), headers: { 'user-agent': 'aspire488-portfolio-data' } });
      if (res.ok) return true;
      if (res.status >= 500) return null;
      if (res.status !== 405 && res.status !== 403) return false;
    } catch { return null; }
  }
  return false;
}
