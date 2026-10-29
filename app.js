'use strict';
document.documentElement.classList.add('js');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('site-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.dataset.open = 'false';
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.dataset.open = String(open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
// These images are labelled interface concepts, not released app screenshots.
const screenButtons = document.querySelectorAll('[data-screen]');
screenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    screenButtons.forEach((item) => {
      const selected = item === button;
      item.setAttribute('aria-pressed', String(selected));
      document.getElementById('screen-' + item.dataset.screen).hidden = !selected;
    });
  });
});
// A real App Store URL can be configured later without changing the layout.
fetch('site.config.json')
  .then((response) => {
    if (!response.ok) throw new Error('Site configuration unavailable');
    return response.json();
  })
  .then((config) => {
    if (typeof config.appStore !== 'string') return;
    const url = new URL(config.appStore);
    if (url.protocol !== 'https:' || url.hostname !== 'apps.apple.com') return;
    const link = document.createElement('a');
    link.href = url.href;
    link.textContent = 'Тучка в App Store ↗';
    document.querySelector('[data-app-store]').replaceChildren(link);
    document.querySelector('[data-download-answer]').replaceChildren('Приложение доступно в App Store: ', link.cloneNode(true));
  })
  .catch(() => { /* Static navigation and document links do not depend on this request. */ });

// Demo form: validate locally and show a confirmation without transmitting or storing details.
const contactDialog = document.getElementById('contact-dialog');
const contactForm = document.getElementById('contact-form');
const contactIntro = document.getElementById('contact-intro');
const contactReady = document.getElementById('contact-ready');
const contactDirect = document.getElementById('contact-direct');
let contactOpener;
function closeContact() {
  contactDialog.close();
  contactOpener?.focus();
}
document.querySelectorAll('[data-contact-open]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (typeof contactDialog.showModal !== 'function') return;
    event.preventDefault();
    closeMenu();
    contactOpener = link;
    contactDialog.showModal();
    document.getElementById('contact-name').focus();
  });
});
contactDialog.querySelector('.dialog-close').addEventListener('click', closeContact);
contactDialog.querySelector('[data-contact-done]').addEventListener('click', closeContact);
contactDialog.addEventListener('click', (event) => {
  if (event.target !== contactDialog) return;
  const bounds = contactDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeContact();
});
contactDialog.addEventListener('close', () => {
  contactForm.reset();
  document.getElementById('contact-name').setCustomValidity('');
  contactForm.hidden = false;
  contactIntro.hidden = false;
  contactDirect.hidden = false;
  contactReady.hidden = true;
  contactDialog.setAttribute('aria-labelledby', 'contact-dialog-title');
  contactDialog.setAttribute('aria-describedby', 'contact-dialog-description');
  contactOpener?.focus();
});
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const nameInput = document.getElementById('contact-name');
  nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Введите имя.');
  if (!contactForm.reportValidity()) return;
  contactForm.hidden = true;
  contactIntro.hidden = true;
  contactDirect.hidden = true;
  contactReady.hidden = false;
  contactDialog.setAttribute('aria-labelledby', 'contact-ready-title');
  contactDialog.setAttribute('aria-describedby', 'contact-ready-description');
  document.getElementById('contact-ready-title').focus();
});
document.getElementById('contact-name').addEventListener('input', (event) => {
  event.target.setCustomValidity('');
});
