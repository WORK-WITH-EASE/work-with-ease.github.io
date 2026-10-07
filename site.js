const toggle = document.querySelector('.menu-toggle');
const mobile = document.getElementById('mobile-nav');
const dialog = document.querySelector('.preview-dialog');
function closeMenu() { mobile.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!open)); mobile.hidden = open; });
mobile.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  if (button.dataset.preview === 'Unverbindlich sprechen') {
    const target = document.getElementById('kontakt');
    if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    else location.href = '/#kontakt';
    return;
  }
  dialog.querySelector('h2').textContent = button.dataset.preview;
  dialog.querySelector('p:not(.eyebrow)').textContent = button.dataset.preview === 'Kontakt aufnehmen' ? 'Der Kontaktbereich ist gestaltet. Der Buchungslink wird noch ergänzt.' : 'Diese Unterseite folgt im nächsten Schritt. Derzeit sehen Sie den Entwurf der Startseite.';
  dialog.showModal();
}));
document.querySelectorAll('.dialog-close,.dialog-back').forEach(button => button.addEventListener('click', () => dialog.close()));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobile.hidden) { closeMenu(); toggle.focus(); } });
matchMedia('(min-width:1281px)').addEventListener('change', event => { if(event.matches) closeMenu(); });
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.scroll)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})));
