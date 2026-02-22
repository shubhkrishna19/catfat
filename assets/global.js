function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));
  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }
  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });
  if (summary.closest('details-drawer')) summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus(elementToFocus);

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return;

    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    if ((event.target === container || event.target === first) && event.shiftKey) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;
  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;
  openDetailsElement.removeAttribute('open');
  openDetailsElement.querySelector('summary').focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })
    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

class MenuDrawer extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector('details');
    this.content = document.getElementById('menu-drawer-container');
    this.header = document.querySelector('header').getBoundingClientRect();
    this.footer = document.querySelector('.footer').getBoundingClientRect();

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary =>
      summary.addEventListener('click', this.onSummaryClick.bind(this))
    );
    this.querySelectorAll('button').forEach(button =>
      button.addEventListener('click', this.onCloseButtonClick.bind(this))
    );
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;
    this.onCloseButtonClick(event);
    this.close();
    this.querySelector(':focus').blur();
  }

  onSummaryClick(event) {
    const summary = event.currentTarget;
    const parentMenuElement = summary.parentElement;
    const isOpen = parentMenuElement.hasAttribute('open');
    const isFirstLevel = parentMenuElement.closest('nav').length === 1;

    if (isOpen && isFirstLevel) {
      event.preventDefault();
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (!this.contains(document.activeElement)) this.close();
    })
  }

  onCloseButtonClick(event) {
    event.preventDefault();
    this.close();
  }

  close() {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => details.removeAttribute('open'));
    removeTrapFocus(this.mainDetailsToggle);
    this.closeAnimation(this.mainDetailsToggle);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  setup() {
    this.header = document.querySelector('header').getBoundingClientRect();
  }

  onSummaryClick(event) {
    super.onSummaryClick(event);
    if (!this.animations) this.animations = this.content.getAnimations();
  }
}

customElements.define('header-drawer', HeaderDrawer);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    this.resetPosition();
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));

    this.slider.addEventListener('scroll', this.onScroll.bind(this));
  }

  initPages() {
    this.pages = Math.ceil(this.sliderItems.length - 4);
    if (this.currentPageElement && this.pageTotalElement) {
      this.pageTotalElement.textContent = this.pages;
    }
  }

  resetPosition() {
    this.currentPage = 1;
    this.updateCurrentPage();
  }

  updateCurrentPage() {
    this.currentPageElement.textContent = this.currentPage;
    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
    }
  }

  scrollToPage(currentPage, targetElement) {
    const page = parseInt(currentPage);
    const targetPage = page > this.pages ? 1 : page;
    const index = Math.max(0, Math.min(targetPage - 1, this.pages - 1));
    const scrollTo = this.sliderItems[index].offsetLeft;
    this.slider.scrollTo({ left: scrollTo, behavior: 'smooth' });
    this.currentPage = targetPage;
    this.updateCurrentPage();
  }

  onButtonClick(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const scrollTo = target.name === 'next' ? 'next' : 'previous';
    this.scrollToPage(scrollTo === 'next' ? this.currentPage + 1 : this.currentPage - 1, target);
  }

  onScroll() {
    if (this.slider.classList.contains('is-scrolling')) return;
    this.slider.classList.add('is-scrolling');
    clearTimeout(this.mtimeout);
    this.mtimeout = setTimeout(() => {
      this.slider.classList.remove('is-scrolling');
      this.updateCurrentPage();
    }, 250);
  }
}

customElements.define('slider-component', SliderComponent);
