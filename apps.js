// App library: a click on a card opens the app's details in a dialog; ×, Esc or a click beside it close it.
// Without JavaScript the cards jump to the details listed below the overview.
(() => {
  const section = document.querySelector('.app-details');
  if (!section) return;
  const details = [...section.querySelectorAll('.app-detail')];
  const dialog = document.getElementById('app-box').content.firstElementChild;
  document.body.append(dialog);
  const slot = dialog.querySelector('.app-box-slot');
  let current = null;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Thumbnails switch the large screenshot; a click on it shows it across the whole box, a second click brings the text back.
  for (const detail of details) {
    const main = detail.querySelector('.app-shot-main img'), thumbs = [...detail.querySelectorAll('.app-thumbs button')];
    thumbs.forEach(b => b.addEventListener('click', () => {
      Object.assign(main, { src: b.dataset.src, alt: b.dataset.alt, width: b.dataset.breite, height: b.dataset.hoehe });
      thumbs.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
    main?.addEventListener('click', () => { if (dialog.open) detail.classList.toggle('is-zoomed'); });
  }

  function show(detail) {
    if (current) { current.classList.remove('is-zoomed'); section.append(current); }
    current = detail;
    slot.replaceChildren(detail);
    slot.scrollTop = 0;
    dialog.setAttribute('aria-labelledby', detail.querySelector('h2').id);
    history.replaceState(null, '', '#' + detail.id);
    if (!dialog.open) dialog.showModal();
    if (!reduced()) { slot.classList.remove('is-entering'); void slot.offsetWidth; slot.classList.add('is-entering'); }
  }
  const step = dir => show(details[(details.indexOf(current) + dir + details.length) % details.length]);
  const fromHash = () => details.find(d => '#' + d.id === location.hash);

  document.querySelectorAll('.app-card[href^="#app-"]').forEach(card => card.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    show(document.getElementById(card.hash.slice(1)));
  }));
  dialog.querySelector('.app-box-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.app-box-prev').addEventListener('click', () => step(-1));
  dialog.querySelector('.app-box-next').addEventListener('click', () => step(1));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  // Esc first leaves the large screenshot, then closes the box.
  dialog.addEventListener('cancel', event => { if (current?.classList.contains('is-zoomed')) { event.preventDefault(); current.classList.remove('is-zoomed'); } });
  dialog.addEventListener('keydown', event => {
    if (event.target.closest('a, input, textarea') || event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
  dialog.addEventListener('close', () => {
    const card = document.querySelector(`.app-card[href="#${current.id}"]`);
    current.classList.remove('is-zoomed');
    section.append(current);
    current = null;
    history.replaceState(null, '', location.pathname + location.search);
    card?.focus({ preventScroll: true });
  });
  addEventListener('hashchange', () => { const d = fromHash(); if (d) show(d); });

  section.hidden = true;
  // A link like apps.html#app-tueren opens that app directly, e.g. from a show case or an article.
  const linked = fromHash();
  if (linked) show(linked);
})();
