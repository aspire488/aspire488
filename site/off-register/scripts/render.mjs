// Pure HTML renderers for the three data-driven sections of index.html. Every string is escaped.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const isExternal = (href) => /^https?:\/\//.test(href);
const ARROW = ' <span aria-hidden="true">&#8599;</span>';

function link(href, label, cls = '', arrow = true) {
  const c = cls ? ` class="${cls}"` : '';
  return isExternal(href)
    ? `<a${c} href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}${arrow ? ARROW : ''}</a>`
    : `<a${c} href="${/^(\.\.?\/|#)/.test(href) ? esc(href) : '#'}">${esc(label)}</a>`;
}

function linksOf(p) {
  if (p.links?.length) return p.links;
  return [
    p.page && { label: "how it's built", href: p.page },
    p.demo && { label: 'live app', href: p.demo },
    p.release && { label: `release ${p.release.tag}`, href: `${p.url}/releases/tag/${p.release.tag}` },
    { label: 'GitHub', href: p.url },
  ].filter(Boolean);
}

export function renderFeatured(projects) {
  return projects.map((p) => {
    const primary = p.page || p.url;
    const art = p.visual
      ? `\n        <a class="bench-art" href="${esc(primary)}" tabindex="-1" aria-hidden="true"><img src="./${esc(p.visual)}" alt="" width="120" height="120" loading="lazy"></a>`
      : '';
    return `      <li>${art}
        <h3>${link(primary, p.title, 'bench-name', false)}</h3>
        <p class="bench-what">${esc(p.what)}</p>
        <p class="bench-meta"><span>${esc(p.stack)}</span> <span>${esc(p.status)}</span></p>
        <p class="bench-links">${linksOf(p).map((l) => link(l.href, l.label)).join(' ')}</p>
      </li>`;
  }).join('\n');
}

// First status keyword that names a state; the full status is shown beside it. No match: no stamp.
const STAMPS = [[/not verified/i, 'unverified'], [/frozen/i, 'frozen'], [/alpha/i, 'alpha'], [/building/i, 'building'], [/shipped/i, 'shipped'], [/archived/i, 'archived']];
const stampOf = (status) => STAMPS.find(([re]) => re.test(status))?.[1] ?? '';

export function renderMore(projects) {
  const items = projects.map((p) => {
    const st = stampOf(p.status);
    const stamp = st ? `<span class="more-stamp" data-state="${st}">${st}</span>` : '';
    return `      <li>${link(p.url, p.title, 'more-name', false)}<span class="more-what">${esc(p.what)}</span>${stamp}<span class="more-meta">${esc(p.status)}</span></li>`;
  });
  return `<ul class="more">${items.join('')}</ul>`;
}

export function renderUpstream(c) {
  const groups = c.featured.map((g) => {
    const prs = [...g.prs].sort((a, b) => a.number - b.number).map((pr) => `<a href="${esc(pr.url)}" title="${esc(pr.title)}" target="_blank" rel="noopener noreferrer">#${pr.number}</a>`).join(' ');
    return `        <article class="up-item" data-repo="${esc(g.repo)}">
          <p class="up-kind">${esc(g.kind)}</p>
          <h3>${link(`https://github.com/${g.repo}`, g.name, '', false)}</h3>
          <p class="up-count"><b>${g.prs.length}</b> merged</p>
          <p class="up-note">${esc(g.note)}</p>
          <p class="up-prs">${prs}</p>
        </article>`;
  });
  const n = c.counts;
  return `<div class="up-feat">\n${groups.join('\n')}\n      </div>
      <p class="up-more">${n.merged} merged, ${n.open} open (drafts counted separately: ${n.draft}), ${n.closed} closed without merging. ${link(c.atlas, 'Explore the rest of my open-source work')}</p>`;
}

// Replaces the <!--@featured-->, <!--@more-->, <!--@upstream--> markers. Data is read lazily, only for markers present.
export function injectMarkers(html, { projects, contributions }) {
  const parts = {
    featured: () => renderFeatured(projects().featured),
    more: () => renderMore(projects().more),
    upstream: () => renderUpstream(contributions()),
  };
  for (const [name, render] of Object.entries(parts)) {
    const marker = `<!--@${name}-->`;
    if (html.includes(marker)) html = html.split(marker).join(render());
  }
  return html;
}
