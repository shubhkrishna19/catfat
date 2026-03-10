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

// ============================================
// Mobile Menu Functions
// ============================================

class MenuDrawer extends HTMLElement {
  constructor() {
    super();
    this.drawer = this.querySelector('.menu-drawer');
    this.mainDetailsToggle = this.querySelector('details');
    
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

  isOpen() {
    return this.drawer.hasAttribute('open');
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;
    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;
    openDetailsElement === this.mainDetailsToggle ? this.closeMenu(this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');
    
    // Add animation class
    if (!isOpen) {
      summaryElement.parentNode.classList.add('menu-opening');
    }
  }

  onFocusOut() {
    setTimeout(() => {
      if (this.contains(document.activeElement)) return;
      this.closeMenu(this.mainDetailsToggle.querySelector('summary'));
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeMenu(summaryElement) {
    this.mainDetailsToggle.removeAttribute('open');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', false);
    this.closeAnimation(this.mainDetailsToggle);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    this.closeAnimation(detailsElement);
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
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.hasAttribute('overlay')) {
          detailsElement.removeAttribute('overlay');
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);


// ============================================
// Skeleton Loading Functions
// ============================================

function showSkeleton(element) {
  if (!element) return;
  
  const skeletonHTML = `
    <div class="skeleton-card">
      <div class="skeleton skeleton-image"></div>
      <div class="skeleton-card__content">
        <div class="skeleton skeleton-text skeleton-text-lg"></div>
        <div class="skeleton skeleton-text skeleton-text-sm"></div>
        <div class="skeleton skeleton-button"></div>
      </div>
    </div>
  `;
  
  element.innerHTML = skeletonHTML;
}

function hideSkeleton(element) {
  if (!element) return;
  element.classList.remove('loading');
  element.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

function initSkeletonLoading() {
  // Add skeleton class to product grids
  document.querySelectorAll('.collection__grid, .products-grid, .product-grid').forEach(grid => {
    grid.classList.add('loading');
  });
}

// Initialize skeleton loading for product grids
document.addEventListener('DOMContentLoaded', () => {
  // Show skeletons initially
  initSkeletonLoading();
  
  // Hide skeletons after content loads
  setTimeout(() => {
    document.querySelectorAll('.collection__grid, .products-grid, .product-grid').forEach(grid => {
      if (grid.querySelectorAll('.card-product, .product-card').length > 0) {
        grid.classList.remove('loading');
      }
    });
  }, 2000);
});


// ============================================
// Product Card Quick View
// ============================================

class QuickAddButton extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('button');
    this.button.addEventListener('click', this.onClick.bind(this));
  }

  onClick(event) {
    event.preventDefault();
    this.button.classList.add('loading');
    // Add quick add logic here
    setTimeout(() => {
      this.button.classList.remove('loading');
      this.button.textContent = 'Added!';
    }, 1000);
  }
}

customElements.define('quick-add-button', QuickAddButton);


// ============================================
// Initialize common components
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Custom elements are auto-initialized when defined
  
  // Initialize mobile menu drawer
  const menuDrawer = document.querySelector('.menu-drawer-container');
  if (menuDrawer) {
    menuDrawer.setAttribute('role', 'dialog');
    menuDrawer.setAttribute('aria-modal', 'true');
  }
  
  // Close menu when clicking outside
  document.addEventListener('click', (event) => {
    const menuDrawer = document.querySelector('.menu-drawer-container');
    const menuButton = document.querySelector('.menu-toggle');
    
    if (menuDrawer && menuDrawer.hasAttribute('open') && 
        !menuDrawer.contains(event.target) && 
        !menuButton.contains(event.target)) {
      menuDrawer.removeAttribute('open');
    }
  });
});
