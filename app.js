import {submitContactRequest} from './contact-api.mjs?v=20261030-live-mail';
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

// Show confirmation only after the protected handler confirms SMTP acceptance.
const contactDialog = document.getElementById('contact-dialog');
const contactForm = document.getElementById('contact-form');
const contactIntro = document.getElementById('contact-intro');
const contactReady = document.getElementById('contact-ready');
const contactStatus=document.getElementById('contact-status');
const contactSubmit=contactForm.querySelector('[type=submit]');
let contactRequest=null;
let captchaToken='';
let captchaWidget;
let contactConfig;
let captchaLoading=false;
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
    ensureContactChallenge();
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
  contactRequest?.abort();
  contactRequest=null;
  contactSubmit.disabled=false;
  contactSubmit.textContent='Отправить заявку';
  contactStatus.textContent='';
  captchaToken='';
  if(captchaWidget!==undefined) window.turnstile?.reset(captchaWidget);
  contactDialog.setAttribute('aria-labelledby', 'contact-dialog-title');
  contactDialog.setAttribute('aria-describedby', 'contact-dialog-description');
  contactOpener?.focus();
});
async function ensureContactChallenge(){
  if(captchaWidget!==undefined || captchaLoading) return;
  captchaLoading=true;
  try{
    const response=await fetch('site.config.json',{cache:'no-store'});
    if(!response.ok)throw new Error();
    contactConfig=await response.json();
    if(!contactConfig.turnstileSiteKey || !contactConfig.contactEndpoint)throw new Error();
    if(!window.turnstile){
      await new Promise((resolve,reject)=>{
        let script=document.querySelector('script[data-contact-challenge]');
        if(!script){script=document.createElement('script');script.dataset.contactChallenge='true';script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;document.head.append(script);}
        script.addEventListener('load',resolve,{once:true});
        script.addEventListener('error',()=>{script.remove();reject(new Error());},{once:true});
      });
    }
    captchaWidget=window.turnstile.render('#contact-challenge',{sitekey:contactConfig.turnstileSiteKey,action:'contact',theme:'light',size:'flexible',
      callback:(token)=>{captchaToken=token;},
      'expired-callback':()=>{captchaToken='';},
      'error-callback':()=>{captchaToken='';contactStatus.textContent='Проверка не загрузилась. Закройте форму и попробуйте ещё раз.';}});
  }catch{contactStatus.textContent='Отправка временно недоступна. Напишите на contact-support@tuchkapp.ru.';}
  finally{captchaLoading=false;}
}
contactForm.addEventListener('submit',async(event)=>{
  event.preventDefault();
  if(contactRequest)return;
  const nameInput=document.getElementById('contact-name');
  const emailInput=document.getElementById('contact-email');
  nameInput.setCustomValidity(nameInput.value.trim()?'':'Введите имя.');
  if(!contactForm.reportValidity())return;
  if(!captchaToken){contactStatus.textContent='Дождитесь проверки защиты от спама и попробуйте снова.';return;}
  const token=captchaToken;
  captchaToken='';
  const controller=new AbortController();contactRequest=controller;
  contactSubmit.disabled=true;contactSubmit.textContent='Отправляем…';contactStatus.textContent='';
  const timeout=setTimeout(()=>controller.abort(),30000);
  try{
    await submitContactRequest({name:nameInput.value,email:emailInput.value,token,
      botcheck:document.getElementById('contact-botcheck').checked,endpoint:contactConfig.contactEndpoint},{signal:controller.signal});
    if(contactRequest!==controller || !contactDialog.open)return;
    contactForm.hidden=true;contactIntro.hidden=true;contactDirect.hidden=true;contactReady.hidden=false;contactForm.reset();
    contactDialog.setAttribute('aria-labelledby','contact-ready-title');contactDialog.setAttribute('aria-describedby','contact-ready-description');
    document.getElementById('contact-ready-title').focus();
  }catch(error){
    if(contactRequest!==controller || !contactDialog.open)return;
    contactStatus.textContent=error.message==='challenge'?'Проверка устарела. Пройдите её ещё раз и повторите отправку.':'Не удалось подтвердить отправку. Попробуйте позже или напишите на contact-support@tuchkapp.ru.';
    if(captchaWidget!==undefined)window.turnstile?.reset(captchaWidget);
  }finally{
    clearTimeout(timeout);
    if(contactRequest===controller){contactRequest=null;contactSubmit.disabled=false;contactSubmit.textContent='Отправить заявку';}
  }
});
document.getElementById('contact-name').addEventListener('input', (event) => {
  event.target.setCustomValidity('');
});
