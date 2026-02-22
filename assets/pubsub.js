let queue = [];
let isProcessing = false;

const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',
  quantityUpdate: 'quantity-update',
  variantChange: 'variant-change',
  cartError: 'cart-error',
};

function publish(eventName, data) {
  queue.push({ eventName, data });
  if (!isProcessing) {
    isProcessing = true;
    requestAnimationFrame(processQueue);
  }
}

function processQueue() {
  const { eventName, data } = queue.shift() || {};
  if (eventName) {
    document.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
  if (queue.length > 0) {
    requestAnimationFrame(processQueue);
  } else {
    isProcessing = false;
  }
}

function subscribe(eventName, callback) {
  document.addEventListener(eventName, (event) => callback(event.detail));
}
