document.querySelectorAll('[data-marketplace-reviews]').forEach((section) => {
  const grid = section.querySelector('[data-reviews-grid]');
  const source = section.querySelector('[data-reviews-source]');
  if (!grid || !source) return;

  const escapeHtml = (value) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const buildInitials = (name) => {
    const cleanName = (name || '').trim();
    if (!cleanName) return 'CA';

    const parts = cleanName
      .split(/\s+/)
      .map((part) => part.replace(/[^a-z]/gi, ''))
      .filter(Boolean);

    if (!parts.length) return 'CA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const toneClassForName = (name) => {
    const tones = 6;
    const hash = Array.from(name || '').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `marketplace-reviews__avatar--tone-${(hash % tones) + 1}`;
  };

  const buildCard = (review) => `
    <article class="marketplace-reviews__card">
      <div class="marketplace-reviews__person">
        <div class="marketplace-reviews__avatar ${toneClassForName(review.name)}" aria-hidden="true">
          <span class="marketplace-reviews__avatar-initials">${buildInitials(review.name)}</span>
        </div>
        <div class="marketplace-reviews__person-copy">
          <div class="marketplace-reviews__name-row">
            <strong class="marketplace-reviews__name">${escapeHtml(review.name)}</strong>
            <span class="marketplace-reviews__buyer-badge">Verified buyer</span>
          </div>
          <span class="marketplace-reviews__location">${escapeHtml(review.location)}</span>
        </div>
      </div>
      <div class="marketplace-reviews__stars" aria-label="${review.stars} stars">${'★'.repeat(review.stars)}</div>
      <p class="marketplace-reviews__quote">${escapeHtml(review.body)}</p>
      <span class="marketplace-reviews__product">${escapeHtml(review.product)}</span>
    </article>
  `;

  const sourceItems = Array.from(source.querySelectorAll('.jdgm-carousel-item'));
  const reviews = sourceItems
    .map((item) => {
      const body = item.querySelector('.jdgm-carousel-item__review-body p')?.textContent?.trim();
      const title = item.querySelector('.jdgm-carousel-item__review-title')?.textContent?.trim();
      const name = item.querySelector('.jdgm-carousel-item__reviewer-name')?.textContent?.trim();
      const product = item.querySelector('.jdgm-carousel-item__product-title')?.textContent?.trim() || 'Catfat India';
      const stars = item.querySelectorAll('.jdgm-star.jdgm--on').length || 5;
      const quote = body || title;

      if (!quote || !name) return null;

      return {
        body: quote,
        name: name.toLowerCase() === 'anonymous' ? 'Catfat customer' : name,
        location: 'Catfat India customer',
        product,
        stars: Math.max(1, Math.min(5, stars)),
      };
    })
    .filter(Boolean)
    .slice(0, 6);

  if (reviews.length) {
    grid.innerHTML = reviews.map((review) => buildCard(review)).join('');
  }
});
