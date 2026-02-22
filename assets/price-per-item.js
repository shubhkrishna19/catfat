// Price Per Item JS - Price per item calculations
// Handles volume pricing and price-per-item display

class PricePerItem extends HTMLElement {
  constructor() {
    super();
    this.container = this;
    this.variantIdInput = this.querySelector('[name="id"]');
    this.productForm = this.closest('product-form') || document.querySelector('product-form');
    this.quantityInput = this.querySelector('quantity-input') || document.querySelector('quantity-input');

    this.prices = JSON.parse(this.dataset.prices || '[]');
    this.thresholds = JSON.parse(this.dataset.thresholds || '[]');

    if (this.variantIdInput) {
      this.variantIdInput.addEventListener('change', this.onVariantChange.bind(this));
    }

    if (this.quantityInput) {
      this.quantityInput.addEventListener('change', this.onQuantityChange.bind(this));
    }

    this.init();
  }

  init() {
    this.updatePricePerItem();
  }

  onVariantChange() {
    this.updatePricePerItem();
  }

  onQuantityChange() {
    this.updatePricePerItem();
  }

  getQuantity() {
    const quantityEl = this.quantityInput?.querySelector('input');
    return parseInt(quantityEl?.value || '1');
  }

  getCurrentVariantId() {
    return this.variantIdInput?.value;
  }

  updatePricePerItem() {
    const quantity = this.getQuantity();
    const variantId = this.getCurrentVariantId();

    if (!variantId) return;

    // Find the applicable price tier
    const priceTier = this.findPriceTier(quantity);

    if (priceTier) {
      this.updateDisplay(priceTier, quantity);
    }
  }

  findPriceTier(quantity) {
    // Sort thresholds in descending order
    const sortedThresholds = [...this.thresholds].sort((a, b) => b - a);

    for (const threshold of sortedThresholds) {
      if (quantity >= threshold) {
        const priceKey = `price_${threshold}`;
        const price = this.prices.find((p) => p.threshold === threshold);
        if (price) {
          return price;
        }
      }
    }

    // Return default price (first tier)
    return this.prices[0];
  }

  updateDisplay(priceTier, quantity) {
    const priceEl = this.querySelector('.price-per-item__price');
    const compareAtEl = this.querySelector('.price-per-item__compare');
    const savingsEl = this.querySelector('.price-per-item__savings');
    const badgeEl = this.querySelector('.price-per-item__badge');

    if (priceEl) {
      priceEl.textContent = this.formatMoney(priceTier.price);
    }

    if (compareAtEl && priceTier.compare_at_price) {
      compareAtEl.textContent = this.formatMoney(priceTier.compare_at_price);
      compareAtEl.classList.remove('hidden');
    }

    if (savingsEl && priceTier.savings) {
      const savingsPercent = Math.round((priceTier.savings / priceTier.compare_at_price) * 100);
      savingsEl.textContent = `-${savingsPercent}%`;
      savingsEl.classList.remove('hidden');
    }

    if (badgeEl && priceTier.threshold) {
      badgeEl.textContent = `Buy ${priceTier.threshold}+ to save`;
      badgeEl.classList.remove('hidden');
    }

    // Update the price in product form
    this.updateProductFormPrice(priceTier);
  }

  updateProductFormPrice(priceTier) {
    const productInfo = this.closest('.product__info');
    if (!productInfo) return;

    const priceContainer = productInfo.querySelector('.price');
    if (priceContainer) {
      const priceItem = priceContainer.querySelector('.price-item--regular');
      if (priceItem) {
        priceItem.textContent = this.formatMoney(priceTier.price);
      }
    }
  }

  formatMoney(cents) {
    const moneyFormat = window.theme?.moneyFormat || '${{amount}}';
    return moneyFormat.replace('{{amount}}', (cents / 100).toFixed(2));
  }
}

customElements.define('price-per-item', PricePerItem);

// Volume Pricing Table
class VolumePricingTable extends HTMLElement {
  constructor() {
    super();
    this.table = this;
    this.variantIdInput = this.querySelector('[name="id"]');
    this.quantityInput = this.querySelector('quantity-input input');

    this.pricingTiers = JSON.parse(this.dataset.tiers || '[]');
    this.basePrice = parseInt(this.dataset.basePrice || '0');

    if (this.variantIdInput) {
      this.variantIdInput.addEventListener('change', this.updateActiveTier.bind(this));
    }

    if (this.quantityInput) {
      this.quantityInput.addEventListener('input', this.updateActiveTier.bind(this));
    }

    this.init();
  }

  init() {
    this.updateActiveTier();
  }

  getQuantity() {
    return parseInt(this.quantityInput?.value || '1');
  }

  getCurrentVariantId() {
    return this.variantIdInput?.value;
  }

  updateActiveTier() {
    const quantity = this.getQuantity();
    const rows = this.querySelectorAll('.volume-pricing__row');

    rows.forEach((row) => {
      const minQty = parseInt(row.dataset.minQuantity || '0');
      const maxQty = parseInt(row.dataset.maxQuantity || '999999');
      const tier = this.pricingTiers.find((t) => t.min === minQty);

      if (tier && quantity >= minQty && quantity <= maxQty) {
        row.classList.add('is-active');
        row.classList.remove('is-empty');

        // Update price display in row
        const priceEl = row.querySelector('.volume-pricing__price');
        if (priceEl && tier.price) {
          priceEl.textContent = this.formatMoney(tier.price);
        }

        // Update discount
        const discountEl = row.querySelector('.volume-pricing__discount');
        if (discountEl && tier.discount) {
          discountEl.textContent = `-${tier.discount}%`;
        }
      } else {
        row.classList.remove('is-active');
      }
    });

    // Update current price display
    this.updateCurrentPrice(quantity);
  }

  updateCurrentPrice(quantity) {
    const currentPriceEl = this.querySelector('.volume-pricing__current-price');
    if (!currentPriceEl) return;

    const activeTier = this.pricingTiers.find((tier) => {
      return quantity >= tier.min && quantity <= tier.max;
    });

    if (activeTier) {
      currentPriceEl.textContent = this.formatMoney(activeTier.price);
    } else {
      currentPriceEl.textContent = this.formatMoney(this.basePrice);
    }
  }

  formatMoney(cents) {
    const moneyFormat = window.theme?.moneyFormat || '${{amount}}';
    return moneyFormat.replace('{{amount}}', (cents / 100).toFixed(2));
  }
}

customElements.define('volume-pricing-table', VolumePricingTable);

// Price Per Item Container - manages multiple price displays
class PricePerItemContainer extends HTMLElement {
  constructor() {
    super();
    this.pricePerItemEl = this.querySelector('price-per-item');
    this.volumePricingEl = this.querySelector('volume-pricing-table');

    this.productForm = this.closest('product-form');
    this.variantIdInput = this.querySelector('[name="id"]');
    this.quantityInput = this.querySelector('quantity-input');

    if (this.productForm) {
      this.productForm.addEventListener('change', this.onFormChange.bind(this));
    }

    if (this.variantIdInput) {
      this.variantIdInput.addEventListener('change', this.onVariantChange.bind(this));
    }
  }

  onFormChange(event) {
    if (event.target.name === 'id' || event.target.tagName === 'QUANTITY-INPUT') {
      this.syncWithForm();
    }
  }

  onVariantChange() {
    this.syncWithForm();
  }

  syncWithForm() {
    // Sync variant ID
    const formVariantId = this.productForm?.querySelector('[name="id"]')?.value;
    if (formVariantId && this.variantIdInput && this.variantIdInput.value !== formVariantId) {
      this.variantIdInput.value = formVariantId;
      this.variantIdInput.dispatchEvent(new Event('change'));
    }

    // Sync quantity
    const formQuantity = this.productForm?.querySelector('quantity-input input')?.value;
    const containerQuantity = this.quantityInput?.querySelector('input')?.value;
    if (formQuantity && containerQuantity && formQuantity !== containerQuantity) {
      this.quantityInput.value = formQuantity;
      this.quantityInput.dispatchEvent(new Event('change'));
    }
  }
}

customElements.define('price-per-item-container', PricePerItemContainer);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('price-per-item, volume-pricing-table, price-per-item-container').forEach((el) => {
    // Auto-initialized via custom element
  });
});
