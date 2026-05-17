document.querySelectorAll('[data-instagram-strip]').forEach((section) => {
  const rail = section.querySelector('[data-instagram-rail]');
  if (!rail) return;
  const cards = Array.from(section.querySelectorAll('[data-reel-card]'));

  const buttons = section.querySelectorAll('[data-direction]');
  const scrollRail = (direction) => {
    const firstCard = rail.querySelector('.instagram-strip__card');
    if (!firstCard) return;

    const styles = window.getComputedStyle(rail);
    const gap = parseFloat(styles.columnGap || styles.gap || 0);
    const distance = firstCard.getBoundingClientRect().width + gap;
    const delta = direction === 'prev' ? -distance : distance;

    rail.scrollBy({ left: delta, behavior: 'smooth' });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => scrollRail(button.dataset.direction));
  });

  const pauseCard = (card) => {
    const video = card.querySelector('.instagram-strip__video');
    if (!video) return;

    card.classList.remove('is-playing');
    video.pause();
    video.currentTime = 0;
  };

  const playCard = (card) => {
    const video = card.querySelector('.instagram-strip__video');
    if (!video) return;

    cards.forEach((otherCard) => {
      if (otherCard !== card) pauseCard(otherCard);
    });

    card.classList.add('is-playing');
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        card.classList.remove('is-playing');
      });
    }
  };

  cards.forEach((card) => {
    const link = card.querySelector('.instagram-strip__media-link');
    const video = card.querySelector('.instagram-strip__video');
    if (!link || !video) return;

    link.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        playCard(card);
      }
    });

    link.addEventListener('mouseleave', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        pauseCard(card);
      }
    });

    link.addEventListener('focusin', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        playCard(card);
      }
    });

    link.addEventListener('focusout', () => {
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        pauseCard(card);
      }
    });

    video.addEventListener('error', () => {
      card.classList.remove('is-playing');
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        entries.forEach((entry) => {
          const card = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            playCard(card);
          } else {
            pauseCard(card);
          }
        });
      },
      { threshold: [0.5] }
    );

    cards.forEach((card) => {
      if (card.querySelector('.instagram-strip__video')) observer.observe(card);
    });
  }
});
