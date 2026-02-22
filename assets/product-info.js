// Product Info JS - Product info interactions
// Handles product page info interactions like collapsible content, inventory, etc.

class ProductInfo extends HTMLElement {
  constructor() {
    super();
    this.infoContainer = this;
    this.siblingContainers = document.querySelectorAll('.product__info-container--');
    this.siblingWaiters = [];

    // Handle collapsible content
    this.querySelectorAll('.product__accordion').forEach((accordion) => {
      accordion.addEventListener('toggle', this.onAccordionToggle.bind(this));
    });

    // Handle inventory
    this.initInventory();

    // Handle pickup availability
    this.initPickupAvailability();
  }

  onAccordionToggle(event) {
    const accordion = event.target;
    const isOpen = accordion.hasAttribute('open');

    // Update aria-expanded
    const summary = accordion.querySelector('summary');
    if (summary) {
      summary.setAttribute('aria-expanded', !isOpen);
    }

    // Smooth animation
    const content = accordion.querySelector('.accordion__content');
    if (content) {
      if (isOpen) {
        content.style.maxHeight = '0';
        content.style.opacity = '0';
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
      }
    }
  }

  initInventory() {
    const inventoryElements = this.querySelectorAll('.product__inventory');
    if (!inventoryElements.length) return;

    // Listen for inventory updates
    document.addEventListener('product:variant-update', this.onVariantUpdate.bind(this));
  }

  onVariantUpdate(event) {
    const { variant } = event.detail;
    const inventoryElements = this.querySelectorAll('.product__inventory');

    inventoryElements.forEach((element) => {
      if (variant.available) {
        element.classList.remove('hidden');
        const inventoryQuantity = element.querySelector('.inventory__quantity');
        if (inventoryQuantity && variant.inventory_quantity !== undefined) {
          inventoryQuantity.textContent = variant.inventory_quantity;

          // Update inventory status
          const status = element.querySelector('.inventory__status');
          if (status) {
            if (variant.inventory_quantity <= 10) {
              status.textContent = window.theme.strings.lowStock || 'Low Stock';
              status.classList.add('low-stock');
            } else {
              status.textContent = window.theme.strings.inStock || 'In Stock';
              status.classList.remove('low-stock');
            }
          }
        }
      } else {
        element.classList.add('hidden');
      }
    });
  }

  initPickupAvailability() {
    const pickupContainer = this.querySelector('.pickup-availability-preview');
    if (!pickupContainer) return;

    // Handle pickup availability toggle
    pickupContainer.addEventListener('click', this.togglePickupAvailability.bind(this));
  }

  togglePickupAvailability(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const drawer = document.querySelector('#PickupAvailabilityDrawer');
    if (!drawer) return;

    if (button.classList.contains('pickup-availability-preview--available')) {
      drawer.classList.add('active');
      button.setAttribute('aria-expanded', 'true');
    }
  }

  waitForSiblings() {
    return new Promise((resolve) => {
      if (this.siblingContainers.length === 0) {
        resolve();
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const siblingsLoaded = Array.from(this.siblingContainers).every(
          (container) => container && container.clientHeight > 0
        );
        if (siblingsLoaded) {
          obs.disconnect();
          resolve();
        }
      });

      this.siblingContainers.forEach((container) => {
        if (container) {
          observer.observe(container, { attributes: true, childList: true, subtree: true });
        }
      });
    });
  }

  updateContent(html) {
    const container = this.infoContainer;
    const newContent = document.createElement('div');
    newContent.innerHTML = html;

    // Update inventory
    const newInventory = newContent.querySelector('.product__inventory');
    const currentInventory = container.querySelector('.product__inventory');
    if (newInventory && currentInventory) {
      currentInventory.innerHTML = newInventory.innerHTML;
    }

    // Update price
    const newPrice = newContent.querySelector('.price');
    const currentPrice = container.querySelector('.price');
    if (newPrice && currentPrice) {
      currentPrice.innerHTML = newPrice.innerHTML;
    }
  }
}

customElements.define('product-info', ProductInfo);

// Product Inventory Bar Component
class ProductInventory extends HTMLElement {
  constructor() {
    super();
    this.inventory = this.querySelector('.inventory');
    this.threshold = parseInt(this.dataset.threshold || '10');
  }

  connectedCallback() {
    this.updateInventory();
  }

  updateInventory() {
    if (!this.inventory) return;

    const quantity = parseInt(this.dataset.quantity || '0');

    if (quantity <= this.threshold) {
      this.inventory.classList.add('low');
      if (quantity === 0) {
        this.inventory.classList.add('out-of-stock');
      }
    } else {
      this.inventory.classList.remove('low', 'out-of-stock');
    }
  }
}

customElements.define('product-inventory', ProductInventory);

// Product Variant Inventory
class ProductVariantInventory extends HTMLElement {
  constructor() {
    super();
    this.variantIdInput = this.querySelector('[name="id"]');
    this.productId = this.dataset.productId;
    this.inventoryItems = JSON.parse(this.dataset.inventory || '[]');

    if (this.variantIdInput) {
      this.variantIdInput.addEventListener('change', this.onVariantChange.bind(this));
    }
  }

  onVariantChange() {
    const variantId = this.variantIdInput.value;
    this.updateInventoryForVariant(variantId);
  }

  updateInventoryForVariant(variantId) {
    const inventoryItem = this.inventoryItems.find((item) => item.variant_id === parseInt(variantId));

    if (inventoryItem) {
      const quantityEl = this.querySelector('.inventory__quantity');
      const statusEl = this.querySelector('.inventory__status');

      if (quantityEl) {
        quantityEl.textContent = inventoryItem.quantity;
      }

      if (statusEl) {
        if (inventoryItem.quantity <= 0) {
          statusEl.textContent = window.theme.strings.outOfStock || 'Out of Stock';
          statusEl.classList.add('out-of-stock');
        } else if (inventoryItem.quantity <= 10) {
          statusEl.textContent = window.theme.strings.lowStock || 'Low Stock';
          statusEl.classList.add('low-stock');
        } else {
          statusEl.textContent = window.theme.strings.inStock || 'In Stock';
          statusEl.classList.remove('low-stock', 'out-of-stock');
        }
      }

      // Dispatch event for other components
      this.dispatchEvent(new CustomEvent('product:variant-update', {
        bubbles: true,
        detail: { variant: { available: inventoryItem.quantity > 0, inventory_quantity: inventoryItem.quantity } }
      }));
    }
  }
}

customElements.define('product-variant-inventory', ProductVariantInventory);

// Share Button Component
class ShareButton extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('.share-button');
    this.button.addEventListener('click', this.copyToClipboard.bind(this));
  }

  async copyToClipboard() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      this.showSuccess();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  showSuccess() {
    const tooltip = this.querySelector('.share-button__tooltip');
    if (tooltip) {
      tooltip.classList.add('visible');
      setTimeout(() => {
        tooltip.classList.remove('visible');
      }, 2000);
    }
  }
}

customElements.define('share-button', ShareButton);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('product-info').forEach((info) => {
    // Product info is auto-initialized via custom element
  });
});
