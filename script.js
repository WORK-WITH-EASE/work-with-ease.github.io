const site = document.getElementById('ease-drafts');
const notice = site.querySelector('.booking');
site.querySelectorAll('[data-book]').forEach(button => {
  button.addEventListener('click', () => {
    notice.textContent = 'Entwurf: Hier wird später die Terminbuchung geöffnet. Der Buchungslink ist noch nicht hinterlegt.';
    notice.hidden = false;
  });
});
site.querySelectorAll('[data-pending-page]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    notice.textContent = 'Die Detailseite „' + link.textContent + '“ ist für einen späteren Schritt vorgesehen.';
    notice.hidden = false;
  });
});
