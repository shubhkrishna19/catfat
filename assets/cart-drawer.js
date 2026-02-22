// Cart Drawer JS - Cart drawer interactions
// Handles cart drawer open/close, item updates, and cart operations

class CartDrawer extends HTMLElement {
  constructor() {
    super();
    this.drawer = this;
    this.drawerContainer = this.querySelector('.drawer__inner');
    this.drawerHeader = this.querySelector('.drawer__header');
    this.drawerBody = this.querySelector('.drawer__body');
    this.drawerFooter = this.querySelector('.drawer__footer');
    this.closeButton = this.querySelector('.drawer__close');
    this.cartItems = this.querySelector('.cart-items');
    this.cartEmpty = this.querySelector('.cart-empty');
    this.cartTotal = this.querySelector('.cart-total');
    this.cartNote = this.querySelector('.cart-note');

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', this.close.bind(this));
    }

    // Click outside to close
    this.addEventListener('click', (event) => {
      if (event.target === this.drawer) {
        this.close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.classList.contains('active')) {
        this.close();
      }
    });

    // Cart note toggle
    const noteToggle = this.querySelector('.cart-note__toggle');
    if (noteToggle) {
      noteToggle.addEventListener('click', this.toggleCartNote.bind(this));
    }

    // Cart item remove buttons
    this.addEventListener('click', (event) => {
      const removeButton = event.target.closest('.cart-item__remove');
      if (removeButton) {
        const lineKey = removeButton.dataset.lineKey;
        this.removeItem(lineKey);
      }
    });

    // Quantity changes
    this.addEventListener('change', (event) => {
      const quantityInput = event.target.closest('.quantity__input');
      if (quantityInput) {
        const lineKey = quantityInput.dataset.lineKey;
        const quantity = parseInt(quantityInput.value);
        this.updateItemQuantity(lineKey, quantity);
      }
    });
  }

  open() {
    this.classList.add('active');
    document.body.classList.add('overflow-hidden');
    document.body.style.paddingRight = `${this.getScrollbarWidth()}px`;

    // Trap focus
    this.focusableElements = getFocusableElements(this.drawer);
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];

    trapFocus(this.drawer, this.firstFocusable);

    // Fetch cart data
    this.fetchCart();

    // Dispatch event
    this.dispatchEvent(new CustomEvent('cart:open'));
  }

  close() {
    this.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
    document.body.style.paddingRight = '';

    removeTrapFocus();

    // Dispatch event
    this.dispatchEvent(new CustomEvent('cart:close'));
  }

  getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  async fetchCart() {
    try {
      const response = await fetch(`${window.Shopify.routes.root}cart.js`);
      const cart = await response.json();

      this.renderCart(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  renderCart(cart) {
    if (!cart.items || cart.items.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();
    this.renderCartItems(cart.items);
    this.renderCartTotals(cart);
    this.renderCartFooter(cart);
  }

  renderCartItems(items) {
    if (!this.cartItems) return;

    const itemsHtml = items.map((item, index) => this.renderCartItem(item, index + 1)).join('');
    this.cartItems.innerHTML = itemsHtml;
  }

  renderCartItem(item, line) {
    const image = item.image ? `<img src="${item.image}" alt="${item.title}" class="cart-item__image">` : '';
    const variantTitle = item.variant_title ? `<span class="cart-item__variant">${item.variant_title}</span>` : '';
    const properties = this.renderItemProperties(item.properties);

    return `
      <div class="cart-item" data-key="${item.key}">
        <div class="cart-item__media">
          ${image}
        </div>
        <div class="cart-item__details">
          <a href="${item.url}" class="cart-item__title">${item.product_title}</a>
          ${variantTitle}
          ${properties}
          <div class="cart-item__price">
            ${this.renderItemPrice(item)}
          </div>
          <div class="cart-item__quantity">
            <quantity-input class="quantity">
              <button class="quantity__button" name="minus" type="button">-</button>
              <input
                class="quantity__input"
                type="number"
                name="updates[]"
                data-line-key="${item.key}"
                value="${item.quantity}"
                min="0"
                aria-label="Quantity for ${item.title}"
              >
              <button class="quantity__button" name="plus" type="button">+</button>
            </quantity-input>
            <button class="cart-item__remove" data-line-key="${item.key}" aria-label="Remove ${item.title}">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderItemProperties(properties) {
    if (!properties || Object.keys(properties).length === 0) return '';

    return Object.entries(properties)
      .filter(([key, value]) => value && key !== '_bundle_id')
      .map(([key, value]) => `<span class="cart-item__property">${key}: ${value}</span>`)
      .join('');
  }

  renderItemPrice(item) {
    if (item.line_price === item.original_line_price) {
      return `<span class="price">${this.formatMoney(item.line_price)}</span>`;
    }

    return `
      <span class="price price--end">${this.formatMoney(item.line_price)}</span>
      <span class="price price--compare">${this.formatMoney(item.original_line_price)}</span>
    `;
  }

  renderCartTotals(cart) {
    if (!this.cartTotal) return;

    const subtotal = this.formatMoney(cart.total_price);
    const shipping = cart.taxes_shipping_calc_at_checkout ?
      `<span>${window.theme.strings.shippingAtCheckout || 'Shipping calculated at checkout'}</span>` :
      '';

    this.cartTotal.innerHTML = `
      <div class="cart-total__row">
        <span>${window.theme.strings.subtotal || 'Subtotal'}</span>
        <span class="cart-total__subtotal">${subtotal}</span>
      </div>
      <div class="cart-total__row cart-total__shipping">
        ${shipping}
      </div>
    `;
  }

  renderCartFooter(cart) {
    if (!this.drawerFooter) return;

    const checkoutUrl = `${window.Shopify.routes.root}cart`;

    this.drawerFooter.innerHTML = `
      <a href="${checkoutUrl}" class="button button--primary cart-checkout__button">
        ${window.theme.strings.checkout || 'Check out'}
      </a>
      <button class="cart-continue__button" onclick="window.location.href='/collections/all'">
        ${window.theme.strings.continueShopping || 'Continue Shopping'}
      </button>
    `;
  }

  showEmptyState() {
    if (this.cartItems) {
      this.cartItems.classList.add('hidden');
    }
    if (this.cartEmpty) {
      this.cartEmpty.classList.remove('hidden');
    }
    if (this.cartTotal) {
      this.cartTotal.classList.add('hidden');
    }
    if (this.drawerFooter) {
      this.drawerFooter.classList.add('hidden');
    }
  }

  hideEmptyState() {
    if (this.cartItems) {
      this.cartItems.classList.remove('hidden');
    }
    if (this.cartEmpty) {
      this.cartEmpty.classList.add('hidden');
    }
    if (this.cartTotal) {
      this.cartTotal.classList.remove('hidden');
    }
    if (this.drawerFooter) {
      this.drawerFooter.classList.remove('hidden');
    }
  }

  toggleCartNote() {
    const noteContent = this.querySelector('.cart-note__content');
    if (noteContent) {
      noteContent.classList.toggle('hidden');
    }
  }

  async updateItemQuantity(lineKey, quantity) {
    try {
      const response = await fetch(`${window.Shopify.routes.root}cart/change.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: lineKey,
          quantity: quantity
        })
      });

      const cart = await response.json();
      this.renderCart(cart);

      // Dispatch event for cart updates
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  async removeItem(lineKey) {
    try {
      const response = await fetch(`${window.Shopify.routes.root}cart/change.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: lineKey,
          quantity: 0
        })
      });

      const cart = await response.json();
      this.renderCart(cart);

      // Dispatch event for cart updates
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart } }));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  formatMoney(cents) {
    const moneyFormat = window.theme?.moneyFormat || '${{amount}}';
    return moneyFormat.replace('{{amount}}', (cents / 100).toFixed(2));
  }
}

customElements.define('cart-drawer', CartDrawer);

// Cart Items Component
class CartItems extends HTMLElement {
  constructor() {
    super();
    this.cart = this.closest('cart-drawer') || document.querySelector('cart-drawer');
  }
}

customElements.define('cart-items', CartItems);

// Cart Note Component
class CartNote extends HTMLElement {
  constructor() {
    super();
    this.note = this.querySelector('.note');
    this.toggle = this.querySelector('.cart-note__toggle');

    if (this.toggle) {
      this.toggle.addEventListener('click', () => {
        this.classList.toggle('is-active');
        if (this.note) {
          this.note.classList.toggle('hidden');
        }
      });
    }

    if (this.note) {
      this.note.addEventListener('change', debounce((event) => {
        this.saveNote(event.target.value);
      }, 500));
    }
  }

  saveNote(note) {
    fetch(`${window.Shopify.routes.root}cart/update.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        note: note
      })
    });
  }
}

customElements.define('cart-note', CartNote);

// Initialize cart drawer
document.addEventListener('DOMContentLoaded', () => {
  const cartDrawer = document.getElementById('CartDrawer');
  if (cartDrawer) {
    window.cartDrawer = cartDrawer;
  }

  // Listen for product added events to open cart
  document.addEventListener('product:added', (event) => {
    if (window.cartDrawer) {
      window.cartDrawer.open();
    }
  });
});

// Helper function for debouncing
function debounce(func, wait) {
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

// Export for global use
if (typeof window !== 'undefined') {
  window.CartDrawer = CartDrawer;
}
