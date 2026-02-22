// Magnify JS - Image zoom on hover
// Handles product image magnification on hover

class Magnify extends HTMLElement {
  constructor() {
    super();
    this.imageContainer = this.querySelector('.magnify__image-wrapper');
    this.image = this.querySelector('.magnify__image');
    this.lens = this.querySelector('.magnify__lens');
    this.result = this.querySelector('.magnify__result');

    this.scale = parseFloat(this.dataset.scale || '2');
    this.touchSupport = 'ontouchstart' in window;

    if (this.imageContainer && this.image) {
      this.init();
    }
  }

  init() {
    this.boundingBox = null;
    this.imgWidth = null;
    this.imgHeight = null;

    // Wait for image to load
    if (this.image.complete) {
      this.setupMagnify();
    } else {
      this.image.addEventListener('load', () => this.setupMagnify());
    }

    // Handle window resize
    window.addEventListener('resize', this.debounce(() => this.setupMagnify(), 250));
  }

  setupMagnify() {
    this.boundingBox = this.imageContainer.getBoundingClientRect();
    this.imgWidth = this.image.width;
    this.imgHeight = this.image.height;

    if (this.lens) {
      // Set lens size based on scale
      const lensWidth = this.boundingBox.width / this.scale;
      const lensHeight = this.boundingBox.height / this.scale;
      this.lens.style.width = `${lensWidth}px`;
      this.lens.style.height = `${lensHeight}px`;
    }

    if (this.result && this.image) {
      // Set result background size
      this.result.style.backgroundImage = `url('${this.image.src}')`;
      this.result.style.backgroundSize = `${this.imgWidth * this.scale}px ${this.imgHeight * this.scale}px`;
    }
  }

  onMouseMove(event) {
    if (!this.boundingBox) return;

    const { left, top, width, height } = this.boundingBox;
    const x = event.clientX - left;
    const y = event.clientY - top;

    // Calculate lens position
    let lensX = x - (parseFloat(this.lens?.style.width || '100') / 2);
    let lensY = y - (parseFloat(this.lens?.style.height || '100') / 2);

    // Constrain lens within image bounds
    lensX = Math.max(0, Math.min(lensX, width - parseFloat(this.lens?.style.width || '100')));
    lensY = Math.max(0, Math.min(lensY, height - parseFloat(this.lens?.style.height || '100')));

    if (this.lens) {
      this.lens.style.left = `${lensX}px`;
      this.lens.style.top = `${lensY}px`;
    }

    // Calculate background position for result
    if (this.result) {
      const bgX = -(lensX * this.scale);
      const bgY = -(lensY * this.scale);
      this.result.style.backgroundPosition = `${bgX}px ${bgY}px`;
    }
  }

  onMouseEnter() {
    if (this.lens) {
      this.lens.classList.add('is-active');
    }
    if (this.result) {
      this.result.classList.add('is-active');
    }
  }

  onMouseLeave() {
    if (this.lens) {
      this.lens.classList.remove('is-active');
    }
    if (this.result) {
      this.result.classList.remove('is-active');
    }
  }

  debounce(func, wait) {
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
}

customElements.define('magnify', Magnify);

// Product Image Gallery with Zoom
class ProductGalleryMagnify extends HTMLElement {
  constructor() {
    super();
    this.gallery = this;
    this.thumbnails = this.querySelectorAll('.product__thumbnail-item');
    this.mainImage = this.querySelector('.product__media-item--main');
    this.mainImageImg = this.mainImage?.querySelector('img');
    this.mediaList = this.querySelector('.product__media-list');

    this.currentIndex = 0;
    this.zoomEnabled = true;

    this.init();
  }

  init() {
    // Thumbnail click handlers
    this.thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener('click', () => {
        this.goToSlide(index);
      });
    });

    // Initialize zoom on main image
    if (this.mainImageImg) {
      this.setupZoom();
    }

    // Keyboard navigation
    document.addEventListener('keydown', this.onKeyDown.bind(this));

    // Handle media change events
    document.addEventListener('product:variant-change', this.onVariantChange.bind(this));
  }

  setupZoom() {
    this.mainImageImg.addEventListener('mousemove', this.onZoomMove.bind(this));
    this.mainImageImg.addEventListener('mouseenter', this.onZoomEnter.bind(this));
    this.mainImageImg.addEventListener('mouseleave', this.onZoomLeave.bind(this));
  }

  onZoomMove(event) {
    if (!this.zoomEnabled) return;

    const rect = this.mainImageImg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Apply zoom transform
    const zoomScale = 2;
    const translateX = (x - 50) * (zoomScale - 1);
    const translateY = (y - 50) * (zoomScale - 1);

    this.mainImageImg.style.transformOrigin = `${x}% ${y}%`;
    this.mainImageImg.style.transform = `scale(${zoomScale})`;
  }

  onZoomEnter() {
    if (!this.zoomEnabled) return;
    this.mainImageImg.style.transition = 'transform 0.1s ease-out';
  }

  onZoomLeave() {
    this.mainImageImg.style.transform = 'scale(1)';
    this.mainImageImg.style.transition = 'transform 0.3s ease';
  }

  goToSlide(index) {
    if (index < 0 || index >= this.thumbnails.length) return;

    // Update thumbnail active state
    this.thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('is-active', i === index);
    });

    // Update main image
    const mediaItems = this.mediaList?.querySelectorAll('.product__media-item');
    if (mediaItems && mediaItems[index]) {
      mediaItems.forEach((item, i) => {
        item.classList.toggle('is-active', i === index);
      });

      // Get new image
      const newImg = mediaItems[index].querySelector('img');
      if (newImg && this.mainImageImg) {
        this.mainImageImg.src = newImg.src;
        this.mainImageImg.alt = newImg.alt;

        // Re-setup zoom with new image
        this.mainImageImg = newImg;
        this.setupZoom();
      }
    }

    this.currentIndex = index;
  }

  nextSlide() {
    const nextIndex = (this.currentIndex + 1) % this.thumbnails.length;
    this.goToSlide(nextIndex);
  }

  prevSlide() {
    const prevIndex = (this.currentIndex - 1 + this.thumbnails.length) % this.thumbnails.length;
    this.goToSlide(prevIndex);
  }

  onKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      this.prevSlide();
    } else if (event.key === 'ArrowRight') {
      this.nextSlide();
    }
  }

  onVariantChange(event) {
    const { media } = event.detail;
    if (media) {
      // Find and show the matching media
      const mediaItems = this.mediaList?.querySelectorAll('.product__media-item');
      mediaItems?.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img && img.src === media.src) {
          this.goToSlide(index);
        }
      });
    }
  }
}

customElements.define('product-gallery-magnify', ProductGalleryMagnify);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('magnify, product-gallery-magnify').forEach((el) => {
    // Auto-initialized via custom element
  });
});
