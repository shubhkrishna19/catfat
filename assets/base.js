// Base JavaScript functions

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
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` },
    credentials: 'same-origin',
  };
}

class MutationObserverComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.onDOMReady();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  onDOMReady() {
    this.init();
  }

  init() {
    // Override in subclasses
  }

  cleanup() {
    // Override in subclasses
  }
}

// Initialize common components
document.addEventListener('DOMContentLoaded', () => {
  // Custom elements are auto-initialized when defined
});
