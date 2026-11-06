'use strict';
document.documentElement.classList.add('js');
// Local confirmation only. No contact data is transmitted or persisted.
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
  nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Введите имя');
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
