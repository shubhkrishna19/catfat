class SearchForm extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input[type="search"]');
    this.resetButton = this.querySelector('button[type="reset"]');
    if (this.input) {
      this.input.addEventListener('input', this.onInput.bind(this));
      this.input.addEventListener('search', this.onInput.bind(this));
      this.resetButton?.addEventListener('click', this.onReset.bind(this));
    }
  }

  onInput() {
    if (!this.input.value) {
      this.resetButton?.classList.add('hidden');
    } else {
      this.resetButton?.classList.remove('hidden');
    }
  }

  onReset(event) {
    event.preventDefault();
    this.input.value = '';
    this.input.focus();
    this.onInput();
  }
}

customElements.define('search-form', SearchForm);
