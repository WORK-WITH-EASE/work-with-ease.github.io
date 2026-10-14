// Blog overview: filters all articles by search term and tag in the browser.
// Without an active filter the generated pages (25 articles each) stay visible as they are.
(() => {
  const source = document.getElementById('blog-daten');
  const filter = document.querySelector('.blog-filter');
  if (!source || !filter) return;
  const articles = JSON.parse(source.textContent);
  const perPage = 25;
  const input = filter.querySelector('input[type=search]');
  const tagBox = filter.querySelector('.blog-filter-tags');
  const count = filter.querySelector('.blog-count');
  const staticParts = document.querySelectorAll('[data-static]');
  const grid = document.createElement('div');
  grid.className = 'blog-grid';
  const pages = document.createElement('nav');
  pages.className = 'blog-pages';
  pages.setAttribute('aria-label', 'Seiten der Treffer');
  document.querySelector('.blog-results').prepend(grid, pages);

  const normalize = text => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss');
  for (const a of articles) a.suchtext = normalize([a.titel, a.untertitel, a.auszug, a.anriss || '', a.autoren.join(' '), a.tags.join(' ')].join(' '));
  const tagCounts = new Map();
  for (const a of articles) for (const t of a.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
  const tags = [...tagCounts.keys()].sort((x, y) => x.localeCompare(y, 'de'));

  const el = (tag, props = {}, ...children) => { const node = Object.assign(document.createElement(tag), props); node.append(...children.filter(c => c != null && c !== '')); return node; };
  const tagList = list => el('ul', { className: 'blog-tags' }, ...list.map(t => el('li', {}, el('a', { href: '/blog/#tag=' + encodeURIComponent(t), textContent: t }))));

  function card(a) {
    const meta = el('p', { className: 'blog-meta' });
    if (a.entwurf) meta.append(el('span', { className: 'blog-draft-tag', textContent: 'Entwurf' }), ' ');
    if (a.linkedin) meta.append(el('span', { className: 'blog-post-tag', textContent: 'LinkedIn-Post' }), ' ');
    meta.append(el('time', { dateTime: a.datum, textContent: a.datumText }), ' · ' + a.autoren.join(', ').replace(/, ([^,]*)$/, ' und $1'));
    // LinkedIn posts: a small note card with the opening lines, its image (if any) beside the text.
    if (a.linkedin) return el('article', { className: 'blog-card blog-card-post' + (a.bild ? ' blog-card-post-bild' : '') },
      el('div', { className: 'blog-post-inner' },
        a.bild ? el('img', { className: 'blog-card-image', src: a.bild, alt: '', loading: 'lazy', decoding: 'async' }) : null,
        el('div', { className: 'blog-card-body' }, meta,
          el('h2', {}, el('a', { href: a.url, textContent: a.titel })),
          a.anriss ? el('p', { className: 'blog-card-excerpt', textContent: a.anriss }) : null,
          a.tags.length ? tagList(a.tags) : null)));
    return el('article', { className: 'blog-card' },
      a.bild ? el('img', { className: 'blog-card-image', src: a.bild, alt: '', loading: 'lazy', decoding: 'async' }) : null,
      el('div', { className: 'blog-card-body' }, meta,
        el('h2', {}, el('a', { href: a.url, textContent: a.titel })),
        a.untertitel ? el('p', { className: 'blog-card-subtitle', textContent: a.untertitel }) : null,
        a.auszug ? el('p', { className: 'blog-card-excerpt', textContent: a.auszug }) : null,
        a.tags.length ? tagList(a.tags) : null));
  }

  function readState() {
    const p = new URLSearchParams(location.hash.slice(1));
    return { suche: p.get('suche') || '', tag: p.get('tag') || '', seite: Math.max(1, parseInt(p.get('seite'), 10) || 1) };
  }
  function writeState(state) {
    const p = new URLSearchParams();
    if (state.suche) p.set('suche', state.suche);
    if (state.tag) p.set('tag', state.tag);
    if (state.seite > 1) p.set('seite', state.seite);
    const hash = p.toString();
    history.replaceState(null, '', hash ? '#' + hash : location.pathname);
  }

  let state = readState();
  function render() {
    if (document.activeElement !== input) input.value = state.suche;
    for (const b of tagBox.children) b.setAttribute('aria-pressed', String(b.dataset.tag === state.tag));
    const active = Boolean(state.suche.trim() || state.tag);
    for (const part of staticParts) part.hidden = active;
    grid.hidden = pages.hidden = !active;
    grid.replaceChildren();
    pages.replaceChildren();
    if (!active) { count.textContent = ''; return; }
    const words = normalize(state.suche).split(/\s+/).filter(Boolean);
    const hits = articles.filter(a => (!state.tag || a.tags.includes(state.tag)) && words.every(w => a.suchtext.includes(w)));
    const total = Math.max(1, Math.ceil(hits.length / perPage));
    state.seite = Math.min(state.seite, total);
    count.textContent = hits.length === 1 ? '1 Artikel gefunden' : `${hits.length} Artikel gefunden`;
    if (!hits.length) grid.append(el('p', { className: 'blog-empty', textContent: 'Keine passenden Artikel. Suchbegriff oder Tag ändern.' }));
    grid.append(...hits.slice((state.seite - 1) * perPage, state.seite * perPage).map(card));
    if (total > 1) for (let n = 1; n <= total; n++) {
      const b = el('button', { type: 'button', textContent: String(n) });
      if (n === state.seite) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', () => { state.seite = n; writeState(state); render(); grid.scrollIntoView({ block: 'start' }); });
      pages.append(b);
    }
  }

  for (const t of tags) {
    const b = el('button', { type: 'button', textContent: `${t} (${tagCounts.get(t)})` });
    b.dataset.tag = t;
    b.addEventListener('click', () => { state = { ...state, tag: state.tag === t ? '' : t, seite: 1 }; writeState(state); render(); });
    tagBox.append(b);
  }
  input.addEventListener('input', () => { state = { ...state, suche: input.value, seite: 1 }; writeState(state); render(); });
  // Tag links in cards and articles point to /blog/#tag=…
  addEventListener('hashchange', () => { state = readState(); render(); grid.scrollIntoView({ block: 'start' }); });
  filter.hidden = false;
  render();
})();
