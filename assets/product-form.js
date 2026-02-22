// Product Form JS - Product form handling
// Handles product form submission, variant selection, and cart operations

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector('form');
    this.variantPicker = this.querySelector('variant-radios') || this.querySelector('variant-selects');
    this.submitButton = this.querySelector('[type="submit"]');
    this.submitButtonText = this.submitButton?.querySelector('span') || this.submitButton;
    this.originalSubmitButtonText = this.submitButtonText?.textContent || 'Add to cart';

    if (this.form) {
      this.form.addEventListener('submit', this.onFormSubmit.bind(this));
      this.form.addEventListener('change', this.onFormChange.bind(this));
    }

    if (this.variantPicker) {
      this.variantPicker.addEventListener('change', this.onVariantChange.bind(this));
    }

    this.handleProductOptions();
  }

  onFormSubmit(event) {
    event.preventDefault();

    if (this.submitButton.classList.contains('loading')) return;

    this.handleErrorMessage();

    const quantity = this.querySelector('quantity-input')?.value || 1;
    const formData = new FormData(this.form);
    formData.append('quantity', quantity);

    // Add selling plan if available
    const sellingPlanId = this.querySelector('[name="selling_plan_id"]')?.value;
    if (sellingPlanId) {
      formData.append('selling_plan_id', sellingPlanId);
    }

    this.submitButton.classList.add('loading');
    this.submitButton.setAttribute('aria-disabled', true);

    const config = fetchConfig('javascript');
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    delete config.headers['Content-Type'];

    fetch(window.Shopify.routes.root + 'cart/add.js', {
      ...config,
      body: formData
    })
    .then((response) => response.json())
    .then((response) => {
      if (response.status) {
        this.handleErrorMessage(response.description);
        const sellingPlanInput = this.form.querySelector('input[name="selling_plan_id"]');
        if (sellingPlanInput && response.description.includes('Selling Plan')) {
          this.showErrorMessage(window.theme.strings.sellingPlanError || 'Please select a selling plan');
        }
        return;
      }

      this.submitButton.classList.remove('loading');
      this.submitButton.setAttribute('aria-disabled', false);
      this.resetSubmitButtonText();

      // Dispatch custom event for cart update
      this.dispatchEvent(new CustomEvent('product:added', {
        bubbles: true,
        detail: { product: response, form: this.form }
      }));

      // Open cart drawer if enabled
      const cartDrawer = document.querySelector('cart-drawer') || document.getElementById('CartDrawer');
      if (cartDrawer) {
        cartDrawer.open();
      }

      // Publish to cart
      if (window.Shopify && window.Shopify.publish) {
        window.Shopify.publish('ProductAdded', { product: response });
      }
    })
    .catch((e) => {
      console.error('Product Form Error:', e);
      this.submitButton.classList.remove('loading');
      this.submitButton.setAttribute('aria-disabled', false);
      this.resetSubmitButtonText();
      this.handleErrorMessage(e.message);
    });
  }

  onFormChange(event) {
    this.handleOptionChange();
  }

  onVariantChange(event) {
    this.updateVariantInputs();
    this.handleOptionChange();
  }

  handleProductOptions() {
    const variantPicker = this.variantPicker;
    if (!variantPicker) return;

    const productJson = document.querySelector('[id^="ProductJson-"]');
    if (productJson) {
      this.product = JSON.parse(productJson.textContent);
    }

    this.updateVariantInputs();
    this.handleOptionChange();
  }

  updateVariantInputs() {
    const variantPicker = this.variantPicker;
    if (!variantPicker) return;

    const formData = new FormData(this.form);
    const selectedOptions = [];
    const selectedVariantInput = this.querySelector('[name="id"]');

    // Get selected options from form
    formData.forEach((value, name) => {
      if (name.startsWith('option-')) {
        selectedOptions.push(value);
      }
    });

    // Find matching variant
    if (this.product) {
      const selectedVariant = this.product.variants.find((variant) => {
        return variant.options.every((option, index) => option === selectedOptions[index]);
      });

      if (selectedVariant && selectedVariantInput) {
        selectedVariantInput.value = selectedVariant.id;
        this.selectedVariant = selectedVariant;

        // Update price display
        this.updatePriceDisplay(selectedVariant);

        // Update availability
        this.updateAvailability(selectedVariant);

        // UpdateSKU
        this.updateSKU(selectedVariant);

        // Update barcode
        this.updateBarcode(selectedVariant);
      }
    }
  }

  handleOptionChange() {
    const variantPicker = this.variantPicker;
    if (!variantPicker) return;

    const selectedVariantInput = this.querySelector('[name="id"]');
    const variantId = selectedVariantInput?.value;

    if (!variantId || variantId === '') {
      this.submitButton.classList.add('disabled');
      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButtonText.textContent = window.theme.strings.unavailable || 'Unavailable';
    } else {
      this.submitButton.classList.remove('disabled');
      this.submitButton.setAttribute('aria-disabled', false);
      this.resetSubmitButtonText();
    }
  }

  updatePriceDisplay(variant) {
    const priceContainer = this.closest('.product__info')?.querySelector('.price-item--regular');
    const compareAtPriceContainer = this.closest('.product__info')?.querySelector('.price-item--sale');

    if (priceContainer) {
      priceContainer.textContent = this.formatMoney(variant.price);
    }

    if (compareAtPriceContainer && variant.compare_at_price > variant.price) {
      compareAtPriceContainer.textContent = this.formatMoney(variant.compare_at_price);
      compareAtPriceContainer.closest('.price__sale')?.classList.remove('hidden');
    } else {
      compareAtPriceContainer?.closest('.price__sale')?.classList.add('hidden');
    }
  }

  updateAvailability(variant) {
    const availabilityContainer = this.closest('.product__info')?.querySelector('.product__availability');
    if (!availabilityContainer) return;

    if (variant.available) {
      availabilityContainer.textContent = window.theme.strings.inStock || 'In Stock';
      availabilityContainer.classList.remove('out-of-stock');
    } else {
      availabilityContainer.textContent = window.theme.strings.outOfStock || 'Out of Stock';
      availabilityContainer.classList.add('out-of-stock');
    }
  }

  updateSKU(variant) {
    const skuContainer = this.closest('.product__info')?.querySelector('.product__sku');
    if (!skuContainer) return;

    if (variant.sku) {
      skuContainer.textContent = variant.sku;
      skuContainer.classList.remove('hidden');
    } else {
      skuContainer.classList.add('hidden');
    }
  }

  updateBarcode(variant) {
    const barcodeContainer = this.closest('.product__info')?.querySelector('.product__barcode');
    if (!barcodeContainer) return;

    if (variant.barcode) {
      barcodeContainer.textContent = variant.barcode;
      barcodeContainer.classList.remove('hidden');
    } else {
      barcodeContainer.classList.add('hidden');
    }
  }

  formatMoney(cents) {
    const moneyFormat = window.theme.moneyFormat || '${{amount}}';
    return moneyFormat.replace('{{amount}}', (cents / 100).toFixed(2));
  }

  resetSubmitButtonText() {
    this.submitButtonText.textContent = this.originalSubmitButtonText;
  }

  handleErrorMessage(errorMessage = false) {
    this.errorMessageContainer = this.errorMessageContainer || this.querySelector('.product-form__error-message-wrapper');
    if (!this.errorMessageContainer) return;

    this.errorMessageContainer.classList.toggle('hidden', !errorMessage);
    if (errorMessage) {
      this.errorMessageContainer.querySelector('.product-form__error-message').textContent = errorMessage;
    }
  }

  showErrorMessage(message) {
    this.handleErrorMessage(message);
  }
}

customElements.define('product-form', ProductForm);

// Variant Radios Component
class VariantRadios extends HTMLElement {
  constructor() {
    super();
    this.type = 'radio';
    this.addEventListener('change', this.onChange.bind(this));
  }

  onChange(event) {
    this.updateOptions();
    this.updateMasterId();
    this.updateVisuals();
    this.moveProductInfo();
  }

  updateOptions() {
    const options = Array.from(this.querySelectorAll('input[type="radio"], select')).map((element) => {
      return element.value;
    });
    this.options = options;
  }

  updateMasterId() {
    const productJson = document.querySelector('[id^="ProductJson-"]');
    if (!productJson) return;

    const product = JSON.parse(productJson.textContent);
    const selectedVariant = product.variants.find((variant) => {
      return variant.options.every((option, index) => option === this.options[index]);
    });

    const masterSelect = this.querySelector('[name="id"]');
    if (masterSelect && selectedVariant) {
      masterSelect.value = selectedVariant.id;
      masterSelect.dispatchEvent(new Event('change'));
    }
  }

  updateVisuals() {
    const productJson = document.querySelector('[id^="ProductJson-"]');
    if (!productJson) return;

    const product = JSON.parse(productJson.textContent);
    const selectedVariant = product.variants.find((variant) => {
      return variant.options.every((option, index) => option === this.options[index]);
    });

    // Update radio button states
    this.querySelectorAll('.variant__input').forEach((input) => {
      const optionName = input.name;
      const optionValue = input.value;
      const isSelected = this.options[this.querySelectorAll(`[name="${optionName}"]`).indexOf(input)] === optionValue;

      input.checked = isSelected;

      // Update label styling
      const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
      if (label) {
        label.classList.toggle('selected', isSelected);
        label.classList.toggle('disabled', selectedVariant && !selectedVariant.available && isSelected);
      }
    });
  }

  moveProductInfo() {
    const productInfo = document.querySelector('.product__info');
    if (!productInfo) return;

    const mediaContainer = document.querySelector('.product__media-container');
    if (!mediaContainer) return;

    const mediaQuery = window.matchMedia('(min-width: 1200px)');
    if (mediaQuery.matches) {
      // Move product info to the correct position
      const destination = mediaContainer.querySelector('.product__info-wrapper');
      if (destination && productInfo.parentElement !== destination) {
        destination.appendChild(productInfo);
      }
    }
  }
}

customElements.define('variant-radios', VariantRadios);

// Variant Selects Component
class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onChange.bind(this));
  }

  onChange(event) {
    this.updateOptions();
    this.updateMasterId();
  }

  updateOptions() {
    const options = Array.from(this.querySelectorAll('select')).map((select) => select.value);
    this.options = options;
  }

  updateMasterId() {
    const productJson = document.querySelector('[id^="ProductJson-"]');
    if (!productJson) return;

    const product = JSON.parse(productJson.textContent);
    const selectedVariant = product.variants.find((variant) => {
      return variant.options.every((option, index) => option === this.options[index]);
    });

    const masterSelect = this.querySelector('[name="id"]');
    if (masterSelect && selectedVariant) {
      masterSelect.value = selectedVariant.id;
      masterSelect.dispatchEvent(new Event('change'));
    }
  }
}

customElements.define('variant-selects', VariantSelects);

// Initialize product forms on page load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('product-form').forEach((form) => {
    // Forms are automatically initialized via custom element
  });
});
