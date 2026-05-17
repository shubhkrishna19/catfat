/**
 * CatfatIndia — Social Proof Popup
 *
 * Rotates "Customer from City purchased Product N min ago" cards in the
 * corner of the screen. Data source priority:
 *   1. Curated <script data-social-proof-data>.entries[] with name+city+time
 *   2. Auto-generated: pulled from collection products, paired with random
 *      first names + cities + relative time labels.
 *
 * Behaviour:
 *   - Honors prefers-reduced-motion (fewer animations, same content)
 *   - Honors sessionStorage 'catfat-sp-dismissed' (user closed = no more)
 *   - Pauses while page is hidden (visibilitychange)
 */

(function () {
  'use strict';

  // Re-init on Shopify section reload (theme editor live edits) — tear down
  // the previous instance so we don't end up with stacked rAF timers.
  function bootSocialProof() {
    initSocialProof();
  }

  function initSocialProof() {
  const popup = document.getElementById('catfat-social-proof');
  if (!popup) return;

  // Already dismissed this session?
  if (sessionStorage.getItem('catfat-sp-dismissed') === '1') {
    popup.remove();
    return;
  }

  const dataEl = document.querySelector('script[data-social-proof-data]');
  if (!dataEl) return;

  let payload;
  try {
    payload = JSON.parse(dataEl.textContent);
  } catch (e) {
    return;
  }

  const cfg = {
    interval: parseInt(popup.dataset.interval, 10) || 9000,
    displayDuration: parseInt(popup.dataset.displayDuration, 10) || 5500,
    startDelay: parseInt(popup.dataset.startDelay, 10) || 4000,
  };

  const names = payload.names || [];
  const cities = payload.cities || [];
  const timeLabels = payload.timeLabels || [];

  // Build the rotation list: only keep entries with a product + url.
  const rawEntries = (payload.entries || []).filter((e) => e && e.product && e.url && e.url !== '#');
  if (rawEntries.length === 0) {
    popup.remove();
    return;
  }

  // Hydrate empty name/city/time on auto entries
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const entries = rawEntries.map((e) => ({
    name: e.name || (names.length ? pick(names) : 'A Catfat customer'),
    city: e.city || (cities.length ? pick(cities) : ''),
    product: e.product,
    url: e.url,
    image: e.image || '',
    time: e.time || (timeLabels.length ? pick(timeLabels) : 'just now'),
  }));

  // Shuffle so each session feels fresh
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  // DOM refs
  const imgEl = popup.querySelector('[data-social-proof-image]');
  const nameEl = popup.querySelector('[data-social-proof-name]');
  const cityEl = popup.querySelector('[data-social-proof-city]');
  const cityWrap = popup.querySelector('.catfat-social-proof__from');
  const productEl = popup.querySelector('[data-social-proof-product]');
  const timeEl = popup.querySelector('[data-social-proof-time]');
  const linkEl = popup.querySelector('[data-social-proof-link]');
  const closeBtn = popup.querySelector('[data-social-proof-close]');

  let idx = 0;
  let visible = false;
  let timers = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function render(entry) {
    if (entry.image) {
      imgEl.src = entry.image;
      imgEl.alt = entry.product;
      imgEl.parentElement.style.display = '';
    } else {
      imgEl.parentElement.style.display = 'none';
    }
    nameEl.textContent = entry.name;
    if (entry.city) {
      cityEl.textContent = entry.city;
      cityWrap.style.display = '';
    } else {
      cityWrap.style.display = 'none';
    }
    productEl.textContent = entry.product;
    timeEl.textContent = entry.time;
    linkEl.href = entry.url;
  }

  function show() {
    if (!visible) {
      popup.hidden = false;
      // force reflow so the transition runs
      void popup.offsetWidth;
      popup.classList.add('is-visible');
      visible = true;
    }
  }

  function hide() {
    popup.classList.remove('is-visible');
    visible = false;
    // hide attribute after transition
    timers.push(setTimeout(() => {
      if (!visible) popup.hidden = true;
    }, 340));
  }

  function cycleOnce() {
    render(entries[idx % entries.length]);
    idx++;
    show();
    timers.push(setTimeout(() => {
      hide();
    }, cfg.displayDuration));
  }

  function startLoop() {
    clearTimers();
    timers.push(setTimeout(function loop() {
      cycleOnce();
      timers.push(setTimeout(loop, cfg.interval));
    }, cfg.startDelay));
  }

  closeBtn.addEventListener('click', () => {
    hide();
    sessionStorage.setItem('catfat-sp-dismissed', '1');
    clearTimers();
    timers.push(setTimeout(() => popup.remove(), 400));
  });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimers();
      hide();
    } else if (sessionStorage.getItem('catfat-sp-dismissed') !== '1') {
      startLoop();
    }
  });

  // Kick off
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoop, { once: true });
  } else {
    startLoop();
  }
  } // end initSocialProof

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootSocialProof, { once: true });
  } else {
    bootSocialProof();
  }

  // Theme editor live reload
  document.addEventListener('shopify:section:load', (event) => {
    if (event && event.target && event.target.querySelector && event.target.querySelector('#catfat-social-proof, [data-social-proof]')) {
      bootSocialProof();
    }
  });
})();
