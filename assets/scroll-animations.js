/**
 * Scroll Animations Base Module
 * Provides common scroll-triggered animation patterns
 * Uses GSAP 3.12+ with ScrollTrigger
 * 
 * Features:
 * - Reversible scroll-scrubbed animations
 * - Reduced-motion support
 * - Batch animation for performance
 * - Common parallax and card reveal patterns
 */

(function() {
  'use strict';

  // Wait for GSAP to be ready
  function waitForGsap(callback) {
    if (window.gsap && window.ScrollTrigger) {
      callback(window.gsap, window.ScrollTrigger);
    } else {
      window.addEventListener('gsap-ready', function handler(e) {
        window.removeEventListener('gsap-ready', handler);
        callback(e.detail.gsap, e.detail.ScrollTrigger);
      });
    }
  }

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parallax effect: element moves slower than scroll
  function parallaxEffect(element, speed = 0.5, options = {}) {
    waitForGsap((gsap, ScrollTrigger) => {
      if (!element) return;

      if (prefersReducedMotion) {
        // Reduced motion: no parallax
        return;
      }

      gsap.to(element, {
        y: () => window.innerHeight * speed,
        scrollTrigger: {
          trigger: element,
          start: 'top center',
          end: 'bottom center',
          scrub: 1, // 1-second lag for smooth following
          markers: false,
          ...options
        }
      });
    });
  }

  // Card reveal: fade in + slide up on scroll
  function cardReveal(elements, options = {}) {
    const defaultOptions = {
      duration: 0.6,
      delay: 0.1,
      y: 40,
      ...options
    };

    waitForGsap((gsap, ScrollTrigger) => {
      if (!elements || elements.length === 0) return;

      if (prefersReducedMotion) {
        // Reduced motion: show all cards immediately
        gsap.set(elements, { opacity: 1, y: 0 });
        return;
      }

      // Create timeline for staggered reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: elements[0].parentElement,
          start: 'top 80%',
          end: 'top 20%',
          scrub: 1,
          markers: false
        }
      });

      elements.forEach((el, index) => {
        gsap.set(el, { opacity: 0, y: defaultOptions.y });
        tl.to(el, {
          opacity: 1,
          y: 0,
          duration: defaultOptions.duration
        }, index * defaultOptions.delay);
      });
    });
  }

  // Hover depth: scale + rotate + shadow on hover
  function hoverDepth(element, options = {}) {
    const defaultOptions = {
      scale: 1.02,
      rotateX: -5,
      shadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
      duration: 0.3,
      ...options
    };

    if (prefersReducedMotion) {
      return;
    }

    if (!element) return;

    element.addEventListener('mouseenter', () => {
      gsap.to(element, {
        scale: defaultOptions.scale,
        rotateX: defaultOptions.rotateX,
        boxShadow: defaultOptions.shadow,
        duration: defaultOptions.duration,
        transformOrigin: 'center center',
        ease: 'power2.out'
      });
    });

    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        scale: 1,
        rotateX: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        duration: defaultOptions.duration,
        transformOrigin: 'center center',
        ease: 'power2.out'
      });
    });
  }

  // Section parallax: different speeds for heading, text, and image
  function sectionParallax(section, options = {}) {
    waitForGsap((gsap, ScrollTrigger) => {
      if (!section) return;

      if (prefersReducedMotion) {
        return;
      }

      const heading = section.querySelector('[data-parallax-heading]');
      const text = section.querySelector('[data-parallax-text]');
      const media = section.querySelector('[data-parallax-media]');

      const defaultOptions = {
        headingSpeed: 0.3,
        textSpeed: 0.5,
        mediaSpeed: 0.7,
        ...options
      };

      if (heading) {
        gsap.to(heading, {
          y: () => window.innerHeight * defaultOptions.headingSpeed,
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            scrub: 1
          }
        });
      }

      if (text) {
        gsap.to(text, {
          y: () => window.innerHeight * defaultOptions.textSpeed,
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            scrub: 1
          }
        });
      }

      if (media) {
        gsap.to(media, {
          y: () => window.innerHeight * defaultOptions.mediaSpeed,
          scrollTrigger: {
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            scrub: 1
          }
        });
      }
    });
  }

  // Horizontal scroll rail influenced by vertical scroll
  function scrollRail(container, options = {}) {
    waitForGsap((gsap, ScrollTrigger) => {
      if (!container) return;

      if (prefersReducedMotion) {
        return;
      }

      const rail = container.querySelector('[data-scroll-rail]');
      if (!rail) return;

      const defaultOptions = {
        speed: 0.5,
        ...options
      };

      gsap.to(rail, {
        x: () => -window.innerWidth * defaultOptions.speed,
        scrollTrigger: {
          trigger: container,
          start: 'top center',
          end: 'bottom center',
          scrub: 1,
          markers: false
        }
      });
    });
  }

  // Banner scroll lift: CTA button lifts as you scroll
  function bannerLift(button, options = {}) {
    waitForGsap((gsap, ScrollTrigger) => {
      if (!button) return;

      if (prefersReducedMotion) {
        return;
      }

      const defaultOptions = {
        liftDistance: -10,
        shadowGrow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        ...options
      };

      gsap.to(button, {
        y: defaultOptions.liftDistance,
        boxShadow: defaultOptions.shadowGrow,
        duration: 0.4,
        scrollTrigger: {
          trigger: button.closest('section'),
          start: 'top center',
          end: 'center center',
          scrub: 1
        }
      });
    });
  }

  // Expose API
  window.ScrollAnimations = {
    parallaxEffect,
    cardReveal,
    hoverDepth,
    sectionParallax,
    scrollRail,
    bannerLift,
    waitForGsap,
    prefersReducedMotion,
    // Utility: batch animations for better performance
    batch: (selector, callback, options = {}) => {
      const elements = document.querySelectorAll(selector);
      const batchSize = options.batchSize || 10;
      for (let i = 0; i < elements.length; i += batchSize) {
        const batch = Array.from(elements).slice(i, i + batchSize);
        callback(batch);
      }
    }
  };

  // Auto-init common patterns if DOM elements are marked
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-parallax elements marked with data-parallax attribute
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      window.ScrollAnimations.parallaxEffect(el, speed);
    });

    // Auto-hover-depth for elements marked with data-hover-depth
    document.querySelectorAll('[data-hover-depth]').forEach(el => {
      window.ScrollAnimations.hoverDepth(el);
    });

    // Auto-section-parallax for sections marked with data-section-parallax
    document.querySelectorAll('[data-section-parallax]').forEach(section => {
      window.ScrollAnimations.sectionParallax(section);
    });
  });
})();
