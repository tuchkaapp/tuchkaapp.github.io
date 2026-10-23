'use strict';

// The preview images are exported Figma concepts, not screenshots of a released build.
const screenButtons = document.querySelectorAll('[data-screen]');
screenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    screenButtons.forEach((item) => {
      const selected = item === button;
      item.setAttribute('aria-pressed', String(selected));
      document.getElementById(`screen-${item.dataset.screen}`).hidden = !selected;
    });
  });
});

// Only verified URLs entered in site.config.json become public links.
fetch('site.config.json')
  .then((response) => {
    if (!response.ok) throw new Error('Site configuration unavailable');
    return response.json();
  })
  .then((config) => {
    document.querySelectorAll('[data-resource]').forEach((resource) => {
      const value = config[resource.dataset.resource];
      if (typeof value !== 'string' || resource.querySelector('a')) return;
      let url;
      try { url = new URL(value); } catch { return; }
      if (url.protocol !== 'https:') return;
      const link = document.createElement('a');
      link.href = url.href;
      link.textContent = resource.firstElementChild.textContent;
      const arrow = document.createElement('span');
      arrow.textContent = '↗';
      arrow.setAttribute('aria-hidden', 'true');
      link.append(arrow);
      resource.replaceChildren(link);
    });
    if (config.appStore) {
      const paragraph = document.querySelector('#release .release-intro p:last-child');
      paragraph.textContent = 'Приложение доступно в App Store. Документы и поддержка — ниже.';
      document.getElementById('release-title').textContent = 'Ваше важное — с вами.';
      const answer = document.querySelector('.faq-list details:last-child p');
      answer.replaceChildren('Скачайте Тучку по ссылке «Приложение в App Store» в разделе ниже.');
    }
  })
  .catch(() => { /* The static page retains honest pending states when offline. */ });
