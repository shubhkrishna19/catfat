const ON_CHANGE_DEBOUNCE_TIMER = 300;

const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
  variantChange: 'variant-change',
  cartError: 'cart-error',
};

const CART_ERRORS = {
  EMPTY_ITEM: 'You need to add at least 1 product',
  PRODUCT_NOT_FOUND: 'Product not found',
  INVALID_QUANTITY: 'Invalid quantity',
  OUT_OF_STOCK: 'Out of stock',
};
