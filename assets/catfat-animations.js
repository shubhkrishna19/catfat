/**
 * CatfatIndia — Motion System
 *
 * Two engines:
 *   1. Reveal — one-shot fade/slide for things that should "stay revealed" once seen.
 *   2. Scrub — scroll-position-driven transforms that REVERSE on scroll-up.
 *
 * Attributes:
 *   data-reveal                       fade+slide once when intersecting (legacy)
 *   data-reveal-stagger               stagger direct children with [data-reveal-child]
 *   data-counter="620"                count up when visible
 *   data-scrub                        element scrub-animates as it crosses viewport
 *   data-scrub-from / data-scrub-to   override default range (0..1 within viewport)
 *   data-scrub-y="80"                 translate Y over the range (default 0)
 *   data-scrub-x="0"                  translate X
 *   data-scrub-scale="0.96"           starting scale (eases to 1)
 *   data-scrub-rotate-x="6"           starting rotateX in deg
 *   data-scrub-blur="6"               starting blur in px
 *   data-scrub-opacity-from="0"       starting opacity (default 0)
 *   data-scrub-opacity-to="1"         ending opacity (default 1)
 *   data-scrub-layer="0.3"            parallax factor for layered elements
 *   data-card-depth                   subtle premium card depth scrub (preset)
 *   data-rail-couple                  marquee rail responds to page scroll velocity
 *   data-parallax="0.3"               legacy fixed parallax
 *
 * All effects gated by prefers-reduced-motion. Scrub uses a single rAF loop.
 */

(function () {
  'use strict';

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  // ease that maps 0..1 to 0..1 with smooth start/end — used for scrub progress
  const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  // ─── Reveal Observer (one-shot) ─────────────────────────────────────────────

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
  );

  function initReveal() {
    if (REDUCED_MOTION) {
      document.querySelectorAll('[data-reveal]').forEach((el) => {
        el.classList.add('is-revealed', 'no-motion');
      });
      return;
    }
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // ─── Staggered Children ──────────────────────────────────────────────────────

  const staggerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const children = entry.target.querySelectorAll('[data-reveal-child]');
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 60}ms`;
          child.classList.add('is-revealed');
        });
        staggerObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -32px 0px' }
  );

  function initStagger() {
    if (REDUCED_MOTION) {
      document.querySelectorAll('[data-reveal-child]').forEach((el) => {
        el.classList.add('is-revealed', 'no-motion');
      });
      return;
    }
    document.querySelectorAll('[data-reveal-stagger]').forEach((parent) => {
      staggerObserver.observe(parent);
    });
  }

  // ─── Counter ─────────────────────────────────────────────────────────────────

  function animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.counterSuffix || '';
    if (isNaN(target)) return;
    const duration = 1400;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (REDUCED_MOTION) {
          entry.target.textContent =
            entry.target.dataset.counter + (entry.target.dataset.counterSuffix || '');
        } else {
          animateCounter(entry.target);
        }
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  function initCounters() {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      counterObserver.observe(el);
    });
  }

  // ─── Scrub Engine ────────────────────────────────────────────────────────────
  // One rAF loop iterates over all active scrub targets, computes 0..1 progress
  // from element position relative to viewport, applies eased transforms.
  // Active set is filtered by an IntersectionObserver so off-screen elements
  // don't burn CPU.

  const scrubTargets = new Map();       // el -> config
  const activeScrubs = new Set();        // currently visible
  const railTargets = new Set();         // marquee rails coupled to page scroll
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;                 // smoothed scroll delta
  let railLoopRunning = false;

  const scrubActivityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeScrubs.add(entry.target);
        else activeScrubs.delete(entry.target);
      });
    },
    { rootMargin: '20% 0px 20% 0px', threshold: 0 }
  );

  function parseScrubConfig(el) {
    const ds = el.dataset;
    const isCardDepth = ds.cardDepth !== undefined;
    // Tuned defaults: card-depth gets a SUBTLE entrance — no blur, less scale,
    // less rotate, higher start opacity, and a short range so content settles to
    // its clean final state as soon as it's meaningfully in the viewport.
    return {
      y: parseFloat(ds.scrubY ?? (isCardDepth ? 24 : 0)),
      x: parseFloat(ds.scrubX ?? 0),
      scale: parseFloat(ds.scrubScale ?? (isCardDepth ? 0.985 : 1)),
      rotateX: parseFloat(ds.scrubRotateX ?? 0),
      // Blur defaults to 0. To opt-in, set data-scrub-blur="X" explicitly.
      blur: parseFloat(ds.scrubBlur ?? 0),
      opacityFrom: parseFloat(ds.scrubOpacityFrom ?? (isCardDepth ? 0.65 : 0)),
      opacityTo: parseFloat(ds.scrubOpacityTo ?? 1),
      layer: parseFloat(ds.scrubLayer ?? 0), // parallax factor; multiplied by viewport scroll progress
      rangeFrom: parseFloat(ds.scrubFrom ?? 0),
      // Settle by 35% of viewport entry — element is clean and stable well
      // before the user is looking at it directly.
      rangeTo: parseFloat(ds.scrubTo ?? (isCardDepth ? 0.35 : 0.45)),
    };
  }

  function applyScrub(el, cfg) {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    // raw progress = how far the element's TOP has traveled from below the viewport
    // 0 when top is at vh (just entering), 1 when top is at 0 (fully entered)
    // Continue past 1 so layered/parallax targets keep moving while element is visible.
    const raw = clamp(1 - rect.top / vh, 0, 1.6);
    const reveal = clamp((raw - cfg.rangeFrom) / Math.max(0.0001, cfg.rangeTo - cfg.rangeFrom), 0, 1);
    const eased = easeInOutQuad(reveal);

    // base transform: ease from start state to settled state
    const ty = lerp(cfg.y, 0, eased) + (cfg.layer * (raw - 0.5) * 80);
    const tx = lerp(cfg.x, 0, eased);
    const sc = lerp(cfg.scale, 1, eased);
    const rx = lerp(cfg.rotateX, 0, eased);
    const bl = lerp(cfg.blur, 0, eased);
    const op = lerp(cfg.opacityFrom, cfg.opacityTo, eased);

    let transform = '';
    if (ty || tx) transform += `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) `;
    if (sc !== 1) transform += `scale(${sc.toFixed(4)}) `;
    if (rx) transform += `rotateX(${rx.toFixed(2)}deg) `;
    el.style.transform = transform.trim() || '';
    el.style.opacity = op.toFixed(3);
    el.style.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : '';
  }

  function scrubTick() {
    activeScrubs.forEach((el) => {
      const cfg = scrubTargets.get(el);
      if (cfg) applyScrub(el, cfg);
    });

    // smoothed scroll velocity for rail coupling
    const dy = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollVelocity = scrollVelocity * 0.82 + dy * 0.18;

    // Rail nudge tracks SMOOTHED VELOCITY only, so when scrolling stops the
    // rail returns to its natural animation position instead of drifting.
    const nudge = clamp(scrollVelocity * -4, -64, 64);
    railTargets.forEach((rail) => {
      rail.style.setProperty('--catfat-rail-nudge', `${nudge.toFixed(2)}px`);
    });

    requestAnimationFrame(scrubTick);
  }

  function initScrub() {
    if (REDUCED_MOTION) {
      // Reset any leftover state so layout is clean
      document.querySelectorAll('[data-scrub], [data-card-depth]').forEach((el) => {
        el.style.transform = '';
        el.style.opacity = '';
        el.style.filter = '';
      });
      return;
    }

    const all = document.querySelectorAll('[data-scrub], [data-card-depth]');
    all.forEach((el) => {
      const cfg = parseScrubConfig(el);
      scrubTargets.set(el, cfg);
      scrubActivityObserver.observe(el);
      // prime initial state on first paint
      applyScrub(el, cfg);
    });

    document.querySelectorAll('[data-rail-couple]').forEach((el) => {
      railTargets.add(el);
    });

    if (all.length || railTargets.size) {
      requestAnimationFrame(scrubTick);
    }
  }

  // ─── Legacy fixed parallax (kept for hero media) ─────────────────────────────

  let parallaxEls = [];

  function tickParallax() {
    parallaxEls.forEach(({ el, factor }) => {
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const offset = (centerY - window.innerHeight / 2) * factor;
      el.style.transform = `translateY(${offset.toFixed(2)}px)`;
    });
    requestAnimationFrame(tickParallax);
  }

  function initParallax() {
    if (REDUCED_MOTION) return;
    parallaxEls = Array.from(document.querySelectorAll('[data-parallax]')).map((el) => ({
      el,
      factor: parseFloat(el.dataset.parallax) || 0.2,
    }));
    if (parallaxEls.length) requestAnimationFrame(tickParallax);
  }

  // ─── Header scroll state ─────────────────────────────────────────────────────

  function initHeaderScroll() {
    const header = document.getElementById('shopify-section-header') ||
      document.querySelector('.catfat-header-shell');
    if (!header) return;

    let ticking = false;
    function update() {
      header.dataset.scrolled = window.scrollY > 40 ? 'true' : 'false';
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // ─── Smooth scroll for hash links ────────────────────────────────────────────

  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth', block: 'start' });
    });
  }

  // ─── Scroll-to-top button ────────────────────────────────────────────────────

  function initScrollToTop() {
    const btn = document.getElementById('catfat-scroll-top');
    if (!btn) return;
    const toggleVisibility = () => {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
    });
    toggleVisibility();
  }

  // ─── Reel hover on product cards ─────────────────────────────────────────────
  // Cards with [data-has-reel="true"] contain a <video.market-card__reel>.
  // On pointer enter (or touch), start the video. On leave, pause + rewind.

  function initReels() {
    // Selectors that should hover-play their inner <video>
    //   1. Product cards with the catfat.reel_url/reel_video metafield set
    //   2. Post-wall video tiles
    //   3. Instagram strip cards that have a video reel
    const cards = document.querySelectorAll(
      '[data-has-reel="true"], ' +
      '.catfat-postwall__tile:has(.catfat-postwall__media--video), ' +
      '.instagram-strip__card--video, ' +
      '[data-reel-card]'
    );
    cards.forEach((card) => {
      const video = card.querySelector('video');
      if (!video) return;

      const play = () => {
        // Load lazily on first interaction
        if (video.preload === 'none') {
          video.preload = 'auto';
          video.load();
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => { /* autoplay blocked silently */ });
        }
      };
      const stop = () => {
        video.pause();
        try { video.currentTime = 0; } catch (e) { /* ignore */ }
      };

      card.addEventListener('pointerenter', play);
      card.addEventListener('pointerleave', stop);
      card.addEventListener('focusin', play);
      card.addEventListener('focusout', stop);

      // Touch: toggle is-reel-active class so it plays on first tap, second tap navigates
      card.addEventListener('touchstart', () => {
        card.classList.add('is-reel-active');
        play();
      }, { passive: true });
    });
  }

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    initReveal();
    initStagger();
    initCounters();
    initScrub();
    initParallax();
    initHeaderScroll();
    initSmoothScroll();
    initScrollToTop();
    initReels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('shopify:section:load', init);
})();
