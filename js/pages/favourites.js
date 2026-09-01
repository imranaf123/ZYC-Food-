/* =========================================================
   pages/favourites.js — "My Favorites"
   Reads and writes the SAME favourites store as the product
   pages and cards (components.js → getFavourites / toggleFavourite /
   removeFavourite). No separate storage, no duplicate state.
   ========================================================= */

import { getProducts } from '../data-loader.js';

export async function init({ settings, UI }) {
  const grid = document.getElementById('favourites-grid');
  const countEl = document.getElementById('favourites-count');
  const actionsEl = document.getElementById('favourites-actions');
  const products = await getProducts();

  UI.setMeta({
    title: 'My Favorites — ZYC Food',
    description: 'The ZYC Food dishes you have saved. Add them straight to your cart or remove them any time.',
    canonical: 'favourites.html',
    settings,
  });

  document.getElementById('favourites-breadcrumbs').innerHTML = UI.breadcrumbsHTML([
    { label: 'Home', href: 'index.html' },
    { label: 'My Favorites' },
  ]);

  function favouriteProducts() {
    // preserve the order in which items were saved
    return UI.getFavourites()
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);
  }

  function render() {
    const list = favouriteProducts();
    const orphans = UI.getFavourites().length - list.length;

    countEl.textContent = list.length
      ? `${list.length} saved dish${list.length === 1 ? '' : 'es'}`
      : '';

    actionsEl.innerHTML = list.length
      ? `<button class="btn btn--primary" type="button" id="add-all-favs">${UI.icon('shopping-cart')} Add all to cart</button>
         <a class="btn btn--ghost" href="menu.html">Browse the menu</a>`
      : '';

    if (!list.length) {
      grid.className = '';
      grid.innerHTML = `
        <div class="empty-state empty-state--favourites">
          <span class="empty-state__icon">${UI.icon('heart')}</span>
          <h3>No favorites yet</h3>
          <p>Tap the heart on any dish to save it here — your list stays on this device, ready for your next order.</p>
          <a class="btn btn--primary" href="menu.html">Browse the menu</a>
        </div>
        ${orphans > 0 ? `<p class="tiny muted text-center mt-4">${orphans} saved item${orphans === 1 ? ' is' : 's are'} no longer on the menu and ${orphans === 1 ? 'was' : 'were'} skipped.</p>` : ''}`;
      return;
    }

    grid.className = 'products-grid';
    grid.innerHTML = list.map((p) => UI.productCardHTML(p, { removable: true, showMeta: true })).join('');
  }

  /* Removing from this page writes to the shared store, which re-renders
     the page and updates the header badge through the same event. */
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-fav]');
    if (!btn) return;
    const id = btn.dataset.removeFav;
    const product = products.find((p) => p.id === id);
    UI.removeFavourite(id);
    UI.toast(`${product ? product.name : 'Item'} removed from favourites`);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#add-all-favs')) return;
    const available = favouriteProducts().filter((p) => p.availability !== false);
    if (!available.length) {
      UI.toast('None of your favourites are available right now.', 'error');
      return;
    }
    document.dispatchEvent(new CustomEvent('zyc:quick-add-many', { detail: { slugs: available.map((p) => p.slug) } }));
  });

  // Stay in sync with hearts toggled anywhere on the site (cards, product pages, other tabs)
  document.addEventListener(UI.FAVOURITES_EVENT, render);
  window.addEventListener('storage', (e) => { if (e.key === 'zyc:favs:v1') render(); });

  render();
}
