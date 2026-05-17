class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.form = this.querySelector('form');
    this.resetButton = this.querySelector('button[type="reset"]');
    this.dropdown = this.querySelector('[data-guided-dropdown]');
    this.recentSection = this.querySelector('[data-recent-section]');
    this.recentList = this.querySelector('[data-recent-list]');
    this.clearHistoryButton = this.querySelector('[data-clear-history]');
    this.historyKey = 'catfat-search-history';
    this.historyLimit = 6;

    this.onInput = this.onInput.bind(this);
    this.onReset = this.onReset.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onRecentClick = this.onRecentClick.bind(this);
    this.onClearHistory = this.onClearHistory.bind(this);
  }

  connectedCallback() {
    if (!this.input) return;

    this.input.addEventListener('input', this.onInput);
    this.input.addEventListener('search', this.onInput);
    this.input.addEventListener('focus', this.onFocusIn);
    this.resetButton?.addEventListener('click', this.onReset);
    this.form?.addEventListener('submit', this.onSubmit);
    this.recentList?.addEventListener('click', this.onRecentClick);
    this.clearHistoryButton?.addEventListener('click', this.onClearHistory);

    if (this.dropdown) {
      document.addEventListener('click', this.onDocumentClick);
      this.renderRecentSearches();
      this.storeInitialTerm();
    }

    this.onInput();
  }

  disconnectedCallback() {
    this.input?.removeEventListener('input', this.onInput);
    this.input?.removeEventListener('search', this.onInput);
    this.input?.removeEventListener('focus', this.onFocusIn);
    this.resetButton?.removeEventListener('click', this.onReset);
    this.form?.removeEventListener('submit', this.onSubmit);
    this.recentList?.removeEventListener('click', this.onRecentClick);
    this.clearHistoryButton?.removeEventListener('click', this.onClearHistory);
    document.removeEventListener('click', this.onDocumentClick);
  }

  onInput() {
    if (!this.input) return;

    if (!this.input.value) {
      this.resetButton?.classList.add('hidden');
    } else {
      this.resetButton?.classList.remove('hidden');
    }

    if (this.dropdown) {
      this.openDropdown();
    }
  }

  onFocusIn() {
    if (this.dropdown) {
      this.openDropdown();
    }
  }

  onReset(event) {
    event.preventDefault();
    if (!this.input) return;
    this.input.value = '';
    this.input.focus();
    this.onInput();
  }

  onSubmit() {
    const value = this.input?.value?.trim();
    if (value) {
      this.saveSearchTerm(value);
    }
  }

  onRecentClick(event) {
    const link = event.target.closest('[data-recent-term]');
    if (!link || !this.input) return;
    this.input.value = link.dataset.recentTerm || '';
    this.openDropdown();
  }

  onClearHistory() {
    this.setHistory([]);
    this.renderRecentSearches();
  }

  onDocumentClick(event) {
    if (this.contains(event.target)) return;
    this.closeDropdown();
  }

  openDropdown() {
    this.classList.add('is-open');
  }

  closeDropdown() {
    this.classList.remove('is-open');
  }

  storeInitialTerm() {
    const initialTerm = this.dataset.initialSearchTerm?.trim();
    if (initialTerm) {
      this.saveSearchTerm(initialTerm);
      this.renderRecentSearches();
    }
  }

  getHistory() {
    try {
      const history = window.localStorage.getItem(this.historyKey);
      const parsed = JSON.parse(history || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  setHistory(history) {
    try {
      window.localStorage.setItem(this.historyKey, JSON.stringify(history));
    } catch (error) {
      /* no-op */
    }
  }

  saveSearchTerm(term) {
    const normalized = term.trim();
    if (!normalized) return;

    const nextHistory = [normalized, ...this.getHistory().filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(
      0,
      this.historyLimit
    );

    this.setHistory(nextHistory);
  }

  renderRecentSearches() {
    if (!this.recentSection || !this.recentList) return;

    const history = this.getHistory();
    if (!history.length) {
      this.recentSection.hidden = true;
      this.recentList.hidden = true;
      return;
    }

    this.recentSection.hidden = false;
    this.recentList.hidden = false;
    this.recentList.innerHTML = history
      .map(
        (term) =>
          `<a class="search-page__recent-link" href="/search?q=${encodeURIComponent(term)}" data-recent-term="${this.escapeHtml(
            term
          )}">${this.escapeHtml(term)}</a>`
      )
      .join('');
  }

  escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }
}

if (!customElements.get('search-form')) {
  customElements.define('search-form', SearchForm);
}
