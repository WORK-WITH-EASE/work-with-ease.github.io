// Count contact link activations, not completed bookings or sent messages.
(() => {
  const config = document.currentScript?.dataset;
  if (!config) return;

  function bookingKey(url) {
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.origin + url.pathname.replace(/\/+$/, '');
  }

  const bookings = new Set();
  for (const address of [config.bookingDe, config.bookingEn]) {
    try {
      const key = bookingKey(new URL(address));
      if (key) bookings.add(key);
    } catch (_) { /* An invalid configured address must not affect the links. */ }
  }
  const email = (config.email || '').trim().toLowerCase();

  function contactClick(event) {
    if (event.defaultPrevented || (event.type === 'click' ? event.button !== 0 : event.button !== 1)) return;
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const link = target?.closest('a[href]');
    if (!link) return;

    let name;
    try {
      const url = new URL(link.getAttribute('href'), document.baseURI);
      if (bookings.has(bookingKey(url))) name = 'Terminbuchung: Klick';
      else if (email && url.protocol === 'mailto:' && decodeURIComponent(url.pathname).toLowerCase() === email) name = 'E-Mail: Klick';
    } catch (_) { return; }

    // The shared Plausible initializer queues this call if its async tracker is still loading.
    // No link URL, mail subject or message is attached, and navigation is never delayed.
    if (name && typeof window.plausible === 'function') window.plausible(name);
  }

  document.addEventListener('click', contactClick);
  document.addEventListener('auxclick', contactClick);
})();
