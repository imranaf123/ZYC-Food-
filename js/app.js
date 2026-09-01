/* =========================================================
   app.js — shared bootstrapping for every page
   ========================================================= */

import { getSettings, getProducts, getProductBySlug, resolveCustomizationGroups } from './data-loader.js';
import * as UI from './components.js';
import * as Cart from './cart.js';

const PAGE_MODULES = {
  home: () => import('./pages/home.js'),
  menu: () => import('./pages/menu.js'),
  product: () => import('./pages/product.js'),
  deals: () => import('./pages/deals.js'),
  search: () => import('./pages/search.js'),
  cart: () => import('./pages/cart-page.js'),
  checkout: () => import('./pages/checkout.js'),
  reviews: () => import('./pages/reviews.js'),
  about: () => import('./pages/about.js'),
  contact: () => import('./pages/contact.js'),
  favourites: () => import('./pages/favourites.js'),
  orders: () => import('./pages/orders.js'),
  notfound: () => import('./pages/notfound.js'),
};

async function boot() {
  const page = document.body.dataset.page || 'home';

  let settings;
  try {
    settings = await getSettings();
  } catch (err) {
    document.body.insertAdjacentHTML('afterbegin',
      '<div class="container" style="padding:24px"><div class="alert alert--error">Could not load site data. If you opened this file directly, run it through a local web server.</div></div>');
    return;
  }

  UI.setCurrency(settings.currency);
  UI.mountHeader(settings, page);
  UI.mountBottomNav(page);
  UI.mountFooter(settings);
  UI.initCartBadge();

  // Default SEO from settings, page modules can refine
  UI.setMeta({
    image: settings.seoDefaults?.ogImage,
    settings,
  });

  wireGlobalActions(settings);
  registerServiceWorker();
  initInstallBanner();

  // Search overlay needs the catalog
  getProducts().then((products) => UI.initSearchOverlay(products)).catch(() => {});

  const loader = PAGE_MODULES[page];
  if (loader) {
    try {
      const mod = await loader();
      await mod.init({ settings, UI, Cart });
    } catch (err) {
      console.error(`[app] failed to init page "${page}"`, err);
    }
  }

  UI.initReveal();
}

/* ---------- Global click delegation ---------- */
function wireGlobalActions(settings) {
  document.addEventListener('click', async (e) => {
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      const active = UI.toggleFavourite(favBtn.dataset.fav);
      UI.syncFavouriteButtons();
      UI.toast(active ? 'Your item has been added to favorites.' : 'Removed from favourites');
      return;
    }

    const quickAdd = e.target.closest('[data-quick-add]');
    if (quickAdd) {
      e.preventDefault();
      await quickAddToCart(quickAdd.dataset.quickAdd);
    }
  });

  // "Add all to cart" from the favourites page
  document.addEventListener('zyc:quick-add-many', async (e) => {
    const slugs = e.detail?.slugs || [];
    for (const slug of slugs) {
      await quickAddToCart(slug, { silent: true });
    }
    UI.refreshCartBadges(true);
    UI.toast(`${slugs.length} favourite${slugs.length === 1 ? '' : 's'} added to cart`, 'success');
  });

  // Cross-tab favourite changes should update this tab's hearts and badge
  window.addEventListener('storage', (e) => {
    if (e.key === 'zyc:favs:v1') {
      UI.syncFavouriteButtons();
      UI.refreshFavouriteBadges();
    }
  });
}

/** Add a product with its default size + default customizations (no add-ons). */
export async function quickAddToCart(slug, opts = {}) {
  const product = await getProductBySlug(slug);
  if (!product || product.availability === false) {
    if (!opts.silent) UI.toast('Sorry, that item is unavailable right now.', 'error');
    return;
  }
  const groups = await resolveCustomizationGroups(product);
  const size = (product.sizes || []).find((s) => s.default) || (product.sizes || [])[0] || null;

  const customizations = groups.map((g) => {
    const opt = g.options.find((o) => o.default) || g.options[0];
    return { groupId: g.id, groupLabel: g.label, optionId: opt.id, optionLabel: opt.label, priceDelta: opt.priceDelta || 0 };
  });

  const unitPrice = Cart.computeUnitPrice({
    basePrice: product.basePrice,
    sizePrice: size ? size.price : null,
    customizations,
    addOns: [],
  });

  Cart.addItem({
    type: 'product',
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images?.[0] || '',
    sizeId: size?.id || null,
    sizeLabel: size?.label || null,
    customizations,
    addOns: [],
    quantity: 1,
    unitPrice,
  });

  if (!opts.silent) {
    UI.refreshCartBadges(true);
    UI.toast(`${product.name} added to cart`, 'success');
  }
}

/* ---------- PWA ---------- */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('[sw] registration failed', err));
  });
}

function initInstallBanner() {
  let deferred = null;
  const DISMISS_KEY = 'zyc:install-dismissed';

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    showBanner();
  });

  function showBanner() {
    if (document.getElementById('install-banner')) return;
    const el = document.createElement('div');
    el.className = 'install-banner';
    el.id = 'install-banner';
    el.innerHTML = `
      ${UI.icon('smartphone', 'leading')}
      <div class="install-banner__text">
        <strong>Install the ZYC Food app</strong>
        <span>Order faster — add it to your home screen.</span>
      </div>
      <div class="install-banner__actions">
        <button class="btn btn--ghost btn--sm" type="button" data-install-dismiss>Not now</button>
        <button class="btn btn--primary btn--sm" type="button" data-install-accept>Install</button>
      </div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-open'));

    el.querySelector('[data-install-dismiss]').addEventListener('click', () => {
      sessionStorage.setItem(DISMISS_KEY, '1');
      el.classList.remove('is-open');
      setTimeout(() => el.remove(), 400);
    });
    el.querySelector('[data-install-accept]').addEventListener('click', async () => {
      el.classList.remove('is-open');
      if (deferred) {
        deferred.prompt();
        await deferred.userChoice;
        deferred = null;
      }
      setTimeout(() => el.remove(), 400);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
