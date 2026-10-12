// Show cases: with several screenshots, buttons switch between them. Without JavaScript all screenshots stay visible.
for (const shots of document.querySelectorAll('.case-shots')) {
  const tabs = shots.querySelector('.case-tabs');
  if (!tabs) continue;
  const buttons = [...tabs.querySelectorAll('button')];
  const figures = [...shots.querySelectorAll('.case-shot')];
  const show = index => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.shot === String(index))));
    figures.forEach(f => f.classList.toggle('is-current', f.dataset.shot === String(index)));
  };
  buttons.forEach(b => b.addEventListener('click', () => show(b.dataset.shot)));
  tabs.hidden = false;
  shots.classList.add('is-switchable');
  show(0);
}
