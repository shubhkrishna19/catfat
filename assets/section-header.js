(() => {
  const initHeader = (shell) => {
    if (!shell || shell.dataset.headerReady === 'true') return;
    shell.dataset.headerReady = 'true';

    const toggle = shell.querySelector('.catfat-header__menu-button');
    const mobileNav = shell.querySelector('.catfat-header__mobile');
    let ticking = false;
    let offsetFrame = null;

    const updateOffset = () => {
      offsetFrame = null;
      if (!document.body) return;

      const headerHeight = Math.ceil(shell.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--catfat-header-offset', `${headerHeight}px`);
      document.body.classList.add('has-catfat-fixed-header');
    };

    const queueOffsetUpdate = () => {
      if (offsetFrame !== null) return;
      offsetFrame = window.requestAnimationFrame(updateOffset);
    };

    const setScrolledState = () => {
      const isScrolled = window.scrollY > 10;
      shell.setAttribute('data-scrolled', isScrolled ? 'true' : 'false');
      shell.classList.toggle('is-scrolled', isScrolled);
      queueOffsetUpdate();
      ticking = false;
    };

    const queueScrolledState = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(setScrolledState);
    };

    setScrolledState();
    window.addEventListener('scroll', queueScrolledState, { passive: true });
    window.addEventListener('resize', queueScrolledState);
    window.addEventListener('resize', queueOffsetUpdate);

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        queueOffsetUpdate();
      });
      resizeObserver.observe(shell);
    }

    if (!toggle || !mobileNav) return;

    const setMenuState = (isOpen) => {
      shell.setAttribute('data-menu-open', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      mobileNav.hidden = !isOpen;
      queueOffsetUpdate();
    };

    toggle.addEventListener('click', () => {
      const isOpen = shell.getAttribute('data-menu-open') === 'true';
      setMenuState(!isOpen);
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setMenuState(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1180) {
        setMenuState(false);
      }
    });

    queueOffsetUpdate();
  };

  const initialize = () => {
    document.querySelectorAll('.catfat-header-shell').forEach(initHeader);
  };

  document.addEventListener('DOMContentLoaded', initialize);
  document.addEventListener('shopify:section:load', initialize);
})();
