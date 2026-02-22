// Show More JS - Show more/less functionality
// Handles expandable content sections with show more/less toggle

class ShowMore extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('.show-more__button');
    this.content = this.querySelector('.show-more__content');

    if (this.button && this.content) {
      this.init();
    }
  }

  init() {
    this.button.addEventListener('click', this.toggle.bind(this));

    // Check if we need to show/hide based on initial state
    this.updateButtonState();

    // Listen for window resize to update visibility
    window.addEventListener('resize', this.debounce(this.updateButtonState.bind(this), 250));
  }

  toggle(event) {
    event.preventDefault();
    const isExpanded = this.content.classList.contains('is-expanded');

    if (isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand() {
    this.content.classList.add('is-expanded');
    this.content.style.maxHeight = this.content.scrollHeight + 'px';
    this.button.classList.add('is-active');
    this.button.setAttribute('aria-expanded', 'true');

    const buttonText = this.button.querySelector('.show-more__text');
    const buttonTextHidden = this.button.querySelector('.show-more__text--hidden');

    if (buttonText && buttonTextHidden) {
      buttonText.classList.add('hidden');
      buttonTextHidden.classList.remove('hidden');
    }
  }

  collapse() {
    this.content.classList.remove('is-expanded');
    this.content.style.maxHeight = '0';
    this.button.classList.remove('is-active');
    this.button.setAttribute('aria-expanded', 'false');

    const buttonText = this.button.querySelector('.show-more__text');
    const buttonTextHidden = this.button.querySelector('.show-more__text--hidden');

    if (buttonText && buttonTextHidden) {
      buttonText.classList.remove('hidden');
      buttonTextHidden.classList.add('hidden');
    }
  }

  updateButtonState() {
    const containerHeight = this.content.scrollHeight;
    const currentHeight = this.content.clientHeight;

    // If content is taller than container, show button
    if (containerHeight > currentHeight && !this.content.classList.contains('is-expanded')) {
      this.button.classList.remove('hidden');
    }
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

customElements.define('show-more', ShowMore);

// Collection Show More - for filtering and sorting
class CollectionShowMore extends HTMLElement {
  constructor() {
    super();
    this.container = this.querySelector('.collection__grid');
    this.button = this.querySelector('.show-more__button');
    this.totalItems = parseInt(this.dataset.totalItems || '0');
    this.itemsPerPage = parseInt(this.dataset.itemsPerPage || '12');
    this.currentPage = 1;
    this.loading = false;

    if (this.button) {
      this.button.addEventListener('click', this.loadMore.bind(this));
    }
  }

  async loadMore(event) {
    event.preventDefault();

    if (this.loading) return;
    this.loading = true;

    const currentItems = this.container.querySelectorAll('.grid__item').length;

    if (currentItems >= this.totalItems) {
      this.button.classList.add('hidden');
      this.loading = false;
      return;
    }

    this.button.classList.add('loading');
    this.button.setAttribute('aria-disabled', true);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', this.currentPage + 1);

      const response = await fetch(url.toString());
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const newItems = doc.querySelectorAll('.grid__item');
      newItems.forEach((item) => {
        this.container.appendChild(item);
      });

      this.currentPage++;
      this.updateButtonState();
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      this.button.classList.remove('loading');
      this.button.setAttribute('aria-disabled', false);
      this.loading = false;
    }
  }

  updateButtonState() {
    const currentItems = this.container.querySelectorAll('.grid__item').length;

    if (currentItems >= this.totalItems) {
      this.button.classList.add('hidden');
    }
  }
}

customElements.define('collection-show-more', CollectionShowMore);

// Product Card Show More - for truncated descriptions
class ProductCardShowMore extends HTMLElement {
  constructor() {
    super();
    this.content = this.querySelector('.card__show-more-content');
    this.button = this.querySelector('.card__show-more-button');

    if (this.content && this.button) {
      this.content.style.maxHeight = this.dataset.maxHeight || '60px';
      this.button.addEventListener('click', this.toggle.bind(this));
    }
  }

  toggle(event) {
    event.preventDefault();
    const isExpanded = this.content.classList.contains('is-expanded');

    if (isExpanded) {
      this.content.classList.remove('is-expanded');
      this.content.style.maxHeight = this.dataset.maxHeight || '60px';
      this.button.classList.remove('is-active');
    } else {
      this.content.classList.add('is-expanded');
      this.content.style.maxHeight = this.content.scrollHeight + 'px';
      this.button.classList.add('is-active');
    }
  }
}

customElements.define('product-card-show-more', ProductCardShowMore);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('show-more').forEach((element) => {
    // Auto-initialized via custom element
  });
});
