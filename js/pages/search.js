/* =========================================================
   pages/search.js — results page for the global search
   ========================================================= */

import { getProducts, getDeals, getActiveCategories } from '../data-loader.js';

export async function init({ settings, UI }) {
  const q = (UI.qs('q') || '').trim();
  const input = document.getElementById('search-page-input');
  const results = document.getElementById('search-results');
  const heading = document.getElementById('search-heading');
  const meta = document.getElementById('search-meta');

  if (input) input.value = q;

  UI.setMeta({
    title: q ? `Search results for “${q}” — ZYC Food` : 'Search the menu — ZYC Food',
    description: 'Search the ZYC Food menu for burgers, pizza, BBQ platters, wraps, drinks and desserts.',
    canonical: 'search.html',
    settings,
  });

  const [products, deals, categories] = await Promise.all([getProducts(), getDeals(), getActiveCategories()]);

  const term = q.toLowerCase();
  const productHits = term ? products.filter((p) =>
    p.name.toLowerCase().includes(term)
    || p.description.toLowerCase().includes(term)
    || p.category.toLowerCase().includes(term)
    || (p.tags || []).some((t) => t.toLowerCase().includes(term))) : [];
  const dealHits = term ? deals.filter((d) =>
    d.name.toLowerCase().includes(term) || d.description.toLowerCase().includes(term)) : [];
  const categoryHits = term ? categories.filter((c) => c.name.toLowerCase().includes(term)) : [];

  heading.textContent = q ? `Results for “${q}”` : 'Search the menu';
  meta.textContent = q
    ? `${productHits.length + dealHits.length + categoryHits.length} match${(productHits.length + dealHits.length + categoryHits.length) === 1 ? '' : 'es'} found`
    : 'Type a dish, ingredient or category to find what you are craving.';

  if (!q) {
    results.innerHTML = `<div class="empty-state">${UI.icon('search')}<h3>What are you craving?</h3><p>Try “zinger”, “pizza”, “platter” or “wrap”.</p><a class="btn btn--primary" href="menu.html">Browse full menu</a></div>`;
    return;
  }

  if (!productHits.length && !dealHits.length && !categoryHits.length) {
    results.innerHTML = `<div class="empty-state">${UI.icon('alert-circle')}<h3>No matches for “${UI.escapeHTML(q)}”</h3><p>Check the spelling or browse the full menu instead.</p><a class="btn btn--primary" href="menu.html">Browse full menu</a></div>`;
    return;
  }

  results.innerHTML = `
    ${categoryHits.length ? `
      <section class="section section--tight" style="padding-top:0">
        <h2 class="section-title" style="font-size:20px;margin-bottom:16px">Categories</h2>
        <div class="categories-grid" style="display:grid">${categoryHits.map(UI.categoryCardHTML).join('')}</div>
      </section>` : ''}
    ${productHits.length ? `
      <section class="section section--tight" style="padding-top:0">
        <h2 class="section-title" style="font-size:20px;margin-bottom:16px">Menu items</h2>
        <div class="products-grid">${productHits.map((p) => UI.productCardHTML(p)).join('')}</div>
      </section>` : ''}
    ${dealHits.length ? `
      <section class="section section--tight" style="padding-top:0">
        <h2 class="section-title" style="font-size:20px;margin-bottom:16px">Deals</h2>
        <div class="deals-grid">${dealHits.map((d) => UI.dealCardHTML(d, [])).join('')}</div>
      </section>` : ''}`;

  document.getElementById('search-page-form')?.addEventListener('submit', (e) => {
    if (!input.value.trim()) e.preventDefault();
  });
}
