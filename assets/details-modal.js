class DetailsModal extends HTMLElement {
  constructor() {
    super();
    this.detailsContainer = this.querySelector('details');
    this.summaryToggle = this.querySelector('summary');
    this.detailsContainer.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
    this.summaryToggle.addEventListener('click', this.onSummaryClick.bind(this));
    this.querySelector('button[type="button"]').addEventListener('click', this.close.bind(this));
  }

  isOpen() {
    return this.detailsContainer.hasAttribute('open');
  }

  onSummaryClick(event) {
    event.preventDefault();
    event.target.closest('details').toggleAttribute('open');
    this.setAccessibilityAttributes();
  }

  setAccessibilityAttributes() {
    const isOpen = this.isOpen();
    this.summaryToggle.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      this.focus();
      this.bodyLock();
    } else {
      this.bodyUnlock();
    }
  }

  bodyLock() {
    document.body.style.overflow = 'hidden';
  }

  bodyUnlock() {
    document.body.style.overflow = '';
  }

  close() {
    this.detailsContainer.removeAttribute('open');
    this.summaryToggle.setAttribute('aria-expanded', false);
    this.bodyUnlock();
  }
}

customElements.define('details-modal', DetailsModal);
