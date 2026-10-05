const storyButtons = [...document.querySelectorAll('.practice-open')];
function closeStory(button) {
  button.setAttribute('aria-expanded', 'false');
  button.closest('.practice-card').classList.remove('is-open');
  document.getElementById(button.getAttribute('aria-controls')).hidden = true;
}
for (const button of storyButtons) {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  button.closest('.practice-card').addEventListener('click', event => {
    if (!event.target.closest('button') && !window.getSelection().toString()) button.click();
  });
  button.addEventListener('click', () => {
    const opening = button.getAttribute('aria-expanded') !== 'true';
    storyButtons.forEach(closeStory);
    if (!opening) return;
    button.setAttribute('aria-expanded', 'true');
    button.closest('.practice-card').classList.add('is-open');
    panel.hidden = false;
    const heading = panel.querySelector('h2');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  });
  panel.querySelector('.practice-close').addEventListener('click', () => { closeStory(button); button.focus(); });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { closeStory(button); button.focus(); } });
}
const pause = document.querySelector('.practice-pause');
pause.addEventListener('click', () => {
  const paused = pause.getAttribute('aria-pressed') !== 'true';
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Laufband fortsetzen' : 'Laufband pausieren';
  document.querySelector('.practice-track').classList.toggle('is-paused', paused);
});
