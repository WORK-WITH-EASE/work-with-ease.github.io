// Blog articles: a click on an image opens it large in a dialog; × , Esc or a click beside the image close it.
// Without JavaScript the link opens the image file itself.
(() => {
  const links = [...document.querySelectorAll('.blog-image-link')];
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'bildvorschau';
  dialog.setAttribute('aria-label', 'Bildvorschau');
  dialog.innerHTML = '<button type="button" class="bildvorschau-zu" aria-label="Bild schließen">×</button><figure><img alt=""><figcaption></figcaption></figure>';
  document.body.append(dialog);
  const img = dialog.querySelector('img'), caption = dialog.querySelector('figcaption');
  for (const link of links) link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    const source = link.querySelector('img');
    img.src = link.href;
    img.alt = source?.alt || '';
    caption.textContent = source?.alt || '';
    caption.hidden = !caption.textContent;
    dialog.showModal();
  });
  dialog.querySelector('.bildvorschau-zu').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target.tagName === 'FIGURE') dialog.close(); });
  dialog.addEventListener('close', () => img.removeAttribute('src'));
})();
