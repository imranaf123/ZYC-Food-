/* =========================================================
   pages/reviews.js
   ========================================================= */

import { getReviews, getAggregateRating } from '../data-loader.js';

export async function init({ settings, UI }) {
  const [reviews, aggregate] = await Promise.all([getReviews(), getAggregateRating()]);
  const active = reviews.filter((r) => r.active !== false);

  UI.setMeta({
    title: 'Customer Reviews — ZYC Food',
    description: `Read what guests say about ZYC Food — rated ${aggregate.average} out of 5 from ${aggregate.count} reviews.`,
    canonical: 'reviews.html',
    settings,
  });

  const summaryHost = document.getElementById('reviews-summary');
  const filterHost = document.getElementById('reviews-filter');
  const grid = document.getElementById('reviews-list');

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: active.filter((r) => Math.round(r.rating) === star).length,
  }));

  summaryHost.innerHTML = `
    <div class="reviews-summary__score">
      <div class="num">${aggregate.average || '—'}</div>
      ${UI.starsHTML(aggregate.average)}
      <p class="small muted mt-2">${aggregate.count} verified review${aggregate.count === 1 ? '' : 's'}</p>
    </div>
    <div class="rating-bars">
      ${counts.map(({ star, count }) => `
        <div class="rating-bar">
          <span class="rating-bar__label">${star} ★</span>
          <span class="rating-bar__track"><span class="rating-bar__fill" style="width:${active.length ? (count / active.length) * 100 : 0}%"></span></span>
          <span class="rating-bar__count">${count}</span>
        </div>`).join('')}
    </div>`;

  const filters = [
    { id: 'all', label: 'All reviews' },
    { id: 'featured', label: 'Featured' },
    { id: '5', label: '5 stars' },
    { id: '4', label: '4 stars' },
    { id: '3', label: '3 stars & below' },
  ];
  filterHost.innerHTML = filters.map((f, i) =>
    `<button class="tab" type="button" role="tab" data-filter="${f.id}" aria-selected="${i === 0}">${f.label}</button>`).join('');

  function render(filter = 'all') {
    let list = active.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (filter === 'featured') list = list.filter((r) => r.featured);
    else if (filter === '5') list = list.filter((r) => Math.round(r.rating) === 5);
    else if (filter === '4') list = list.filter((r) => Math.round(r.rating) === 4);
    else if (filter === '3') list = list.filter((r) => Math.round(r.rating) <= 3);

    grid.innerHTML = list.length
      ? list.map(UI.reviewCardHTML).join('')
      : `<div class="empty-state">${UI.icon('star')}<h3>No reviews in this filter</h3><p>Try another rating filter to see more guest feedback.</p></div>`;
  }

  filterHost.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    filterHost.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', String(t === btn)));
    render(btn.dataset.filter);
  });

  render();

  UI.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: settings.restaurantName,
    url: UI.absoluteURL(settings, 'reviews.html'),
    aggregateRating: aggregate.count ? {
      '@type': 'AggregateRating',
      ratingValue: aggregate.average,
      reviewCount: aggregate.count,
      bestRating: 5,
    } : undefined,
    review: active.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.customerName },
      datePublished: r.date,
      reviewBody: r.reviewText,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    })),
  }, 'jsonld-reviews');
}
