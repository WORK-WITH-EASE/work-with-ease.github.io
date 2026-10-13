const toggle = document.querySelector('.menu-toggle');
const mobile = document.getElementById('mobile-nav');
function closeMenu() { mobile.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') === 'true'; toggle.setAttribute('aria-expanded', String(!open)); mobile.hidden = open; });
mobile.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
// Contact buttons in the header and the hero lead to the contact section of the page, or of the home page.
document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
  closeMenu();
  const target = document.getElementById('kontakt');
  if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  else location.href = '/#kontakt';
}));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobile.hidden) { closeMenu(); toggle.focus(); } });
matchMedia('(min-width:1281px)').addEventListener('change', event => { if(event.matches) closeMenu(); });
document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.scroll)?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})));
// Offer tabs: keep the current tab in view and fade the edge where more tabs are hidden.
const offerTabs = document.querySelector('.offer-tabs-row');
if (offerTabs) {
  const current = offerTabs.querySelector('[aria-current]');
  if (current) {
    const overflow = current.getBoundingClientRect().right - offerTabs.getBoundingClientRect().right;
    if (overflow > 0) offerTabs.scrollLeft += overflow + 48;
  }
  const fade = () => {
    offerTabs.classList.toggle('fade-left', offerTabs.scrollLeft > 4);
    offerTabs.classList.toggle('fade-right', offerTabs.scrollLeft + offerTabs.clientWidth < offerTabs.scrollWidth - 4);
  };
  offerTabs.addEventListener('scroll', fade, { passive: true });
  addEventListener('resize', fade);
  fade();
}
// The header wraps onto two lines on narrow screens; sticky elements below it need its real height.
const header = document.querySelector('.header');
new ResizeObserver(() => document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px')).observe(header);
