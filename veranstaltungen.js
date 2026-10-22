// The website is only rebuilt on publishing: events whose time has passed since then are hidden on the overview,
// and an event page shows that it has taken place instead of the registration.
(() => {
  const heute = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
  const karten = [...document.querySelectorAll('.event-card[data-sichtbar-bis]')];
  for (const karte of karten) if (karte.dataset.sichtbarBis && karte.dataset.sichtbarBis < heute) karte.hidden = true;
  const leer = document.querySelector('.events-empty');
  if (leer && karten.every(k => k.hidden)) leer.hidden = false;
  const seite = document.querySelector('.event-page[data-ende]');
  if (seite?.dataset.ende && seite.dataset.ende < heute) {
    // An own page (de.html) may show the registration more than once.
    for (const el of seite.querySelectorAll('.event-signup')) el.hidden = true;
    for (const el of seite.querySelectorAll('.event-past')) el.hidden = false;
  }
})();
