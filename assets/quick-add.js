// Quick Add JS - Quick add to cart functionality
// Enables quick product addition from collection pages without leaving the page

class QuickAdd {
  constructor(element) {
    this.element = element;
    this.quickAddButton = element.querySelector('.quick-add__submit');
    this.productForm = element.querySelector('product-form');
    this.variantId = element.querySelector('[name="id"]')?.value;

    if (this.quickAddButton) {
      this.quickAddButton.addEventListener('click', this.onQuickAddClick.bind(this));
    }
  }

  onQuickAddClick(event) {
    event.preventDefault();

    const quickAddButton = event.currentTarget;
    const productForm = this.productForm;

    if (productForm) {
      productForm.dispatchEvent(new CustomEvent('quick-add-start', {
        bubbles: true,
        detail: { quickAddButton }
      }));

      productForm.requestSubmit().then(() => {
        productForm.dispatchEvent(new CustomEvent('quick-add-success', {
          bubbles: true,
          detail: { quickAddButton }
        }));
      }).catch((error) => {
        productForm.dispatchEvent(new CustomEvent('quick-add-error', {
          bubbles: true,
          detail: { quickAddButton, error }
        }));
      });
    }
  }
}

class QuickAddModal {
  constructor() {
    this.quickAddModal = document.getElementById('QuickAddModal');
    this.quickAddModalContent = this.quickAddModal?.querySelector('.quick-add__content');
    this.quickAddModalTemplate = this.quickAddModal?.querySelector('.quick-add__template');
    this.modalContent = this.quickAddModal?.querySelector('.quick-add__modal');
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('quick-add:modal', this.onQuickAddModal.bind(this));
    if (this.quickAddModal) {
      this.quickAddModal.addEventListener('keyup', (event) => {
        if (event.code.toUpperCase() === 'ESCAPE') this.close();
      });
    }
  }

  onQuickAddModal(event) {
    const productUrl = event.detail?.productUrl;
    if (productUrl) {
      this.open(productUrl);
    }
  }

  open(productUrl) {
    fetch(`${productUrl}?section_id=quick-add`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const quickAddModalContent = html.querySelector('#QuickAddModal .quick-add__content');

        if (quickAddModalContent && this.modalContent) {
          this.modalContent.innerHTML = '';
          this.modalContent.appendChild(quickAddModalContent);
          this.quickAddModalContent = this.modalContent;
          this.quickAddModal.classList.add('quick-add--is-active');
          this.quickAddModalContent.querySelector('.product-form')?.classList.remove('hidden');

          const quickAddSubmit = this.quickAddModalContent.querySelector('.quick-add__submit');
          if (quickAddSubmit) {
            quickAddSubmit.addEventListener('click', (event) => {
              event.preventDefault();
              const productForm = this.quickAddModalContent.querySelector('product-form');
              if (productForm) {
                productForm.dispatchEvent(new CustomEvent('quick-add-start', {
                  bubbles: true,
                  detail: { quickAddButton: quickAddSubmit }
                }));
                productForm.requestSubmit().then(() => {
                  productForm.dispatchEvent(new CustomEvent('quick-add-success', {
                    bubbles: true,
                    detail: { quickAddButton: quickAddSubmit }
                  }));
                }).catch((error) => {
                  productForm.dispatchEvent(new CustomEvent('quick-add-error', {
                    bubbles: true,
                    detail: { quickAddButton: quickAddSubmit, error }
                  }));
                });
              }
            });
          }

          const variantPicker = this.quickAddModalContent.querySelector('variant-radios');
          if (variantPicker) {
            variantPicker.addEventListener('change', () => {
              this.updateQuickAddState();
            });
          }

          this.openAnimation();
        }
      })
      .catch((e) => {
        console.error('Quick Add Modal Error:', e);
      })
      .finally(() => {
        // Hide loading state
      });
  }

  close() {
    this.quickAddModal.classList.remove('quick-add--is-active');
    this.quickAddModalContent?.querySelector('.product-form')?.classList.add('hidden');
    this.closeAnimation();
    document.body.removeEventListener('quick-add:modal');
  }

  openAnimation() {
    this.quickAddModal.style.animation = 'quickAddFadeIn 0.3s ease forwards';
  }

  closeAnimation() {
    this.quickAddModal.style.animation = 'quickAddFadeOut 0.3s ease forwards';
  }

  updateQuickAddState() {
    const productForm = this.quickAddModalContent?.querySelector('product-form');
    const quickAddSubmit = this.quickAddModalContent?.querySelector('.quick-add__submit');
    const selectedVariant = productForm?.querySelector('[name="id"]')?.value;

    if (selectedVariant) {
      quickAddSubmit?.classList.remove('hidden');
      quickAddSubmit?.querySelector('span')?.classList.remove('hidden');
      quickAddSubmit?.querySelector('.loading-overlay__spinner')?.classList.add('hidden');
    } else {
      quickAddSubmit?.classList.add('hidden');
    }
  }
}

class QuickAddList {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('.quick-add').forEach((element) => {
      new QuickAdd(element);
    });
  }
}

// Initialize Quick Add
document.addEventListener('DOMContentLoaded', () => {
  window.quickAdd = new QuickAddList();

  // Initialize modal
  if (document.getElementById('QuickAddModal')) {
    window.quickAddModal = new QuickAddModal();
  }
});

// CSS Animations injection
const quickAddStyles = `
  @keyframes quickAddFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes quickAddFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = quickAddStyles;
document.head.appendChild(styleSheet);

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.QuickAdd = QuickAdd;
  window.QuickAddModal = QuickAddModal;
  window.QuickAddList = QuickAddList;
}
