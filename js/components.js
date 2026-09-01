/* =========================================================
   components.js — icons, formatters, renderers, chrome
   ========================================================= */

import * as Cart from './cart.js';

/* ================= Icons (single outline set) ================= */
const ICONS = {
  truck: '<path d="M14 17V6a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1"/><path d="M14 9h4l3 3v4a1 1 0 0 1-1 1h-1"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/><path d="M8.5 17.5h6.5"/>',
  'shopping-bag': '<path d="M6 2 3 6v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L3 21l4.9-1z"/>',
  tag: '<path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  smartphone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18.5h2"/>',
  'monitor-smartphone': '<path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h6"/><path d="M10 19h-4"/><rect x="14" y="10" width="8" height="12" rx="2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  'shopping-cart': '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h2.2l2.4 12.1a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L22 7H5.3"/>',
  heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1z"/>',
  clipboard: '<rect x="8" y="3" width="8" height="4" rx="1.2"/><path d="M16 5h2.5A1.5 1.5 0 0 1 20 6.5v13A1.5 1.5 0 0 1 18.5 21h-13A1.5 1.5 0 0 1 4 19.5v-13A1.5 1.5 0 0 1 5.5 5H8"/>',
  star: '<path d="m12 2.6 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  'chevron-down': '<path d="m5 9 7 7 7-7"/>',
  'arrow-right': '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/>',
  menu: '<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>',
  x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  utensils: '<path d="M4 3v7a2.5 2.5 0 0 0 5 0V3"/><path d="M6.5 10v11"/><path d="M17.5 3c-1.5 1.2-2.5 3-2.5 5.5 0 2 .8 3.3 2.5 3.7V21"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  receipt: '<path d="M5 21V3l2 1.4L9 3l2 1.4L13 3l2 1.4L17 3l2 1.4V21l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  phone: '<path d="M21 16.9v2.6a1.6 1.6 0 0 1-1.8 1.6 18 18 0 0 1-7.8-2.8 17.6 17.6 0 0 1-5.4-5.4A18 18 0 0 1 3.2 5.1 1.6 1.6 0 0 1 4.8 3.3h2.6a1.6 1.6 0 0 1 1.6 1.4c.1 1 .3 1.9.6 2.8a1.6 1.6 0 0 1-.4 1.7l-1.1 1.1a14.4 14.4 0 0 0 5.4 5.4l1.1-1.1a1.6 1.6 0 0 1 1.7-.4c.9.3 1.8.5 2.8.6a1.6 1.6 0 0 1 1.4 1.6z"/>',
  mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6 9 6.5L21 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/>',
  facebook: '<path d="M14.5 8.5h2.5V5h-2.5A4.5 4.5 0 0 0 10 9.5V12H7.5v3.5H10V22h3.5v-6.5H16l.5-3.5h-3V9.5a1 1 0 0 1 1-1z"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  'trash-2': '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M5.5 7 6.5 20a1.5 1.5 0 0 0 1.5 1.4h8a1.5 1.5 0 0 0 1.5-1.4L18.5 7"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
  'alert-circle': '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><path d="M12 16.4v.2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.6v.2"/>',
  download: '<path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  package: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
  flame: '<path d="M12 22a6 6 0 0 0 6-6c0-4-3-5-3-9 0 0-3 1.5-3 5 0-2-1-3-2-3.5C10 11 6 12.5 6 16a6 6 0 0 0 6 6z"/>',
  'credit-card': '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/>',
  send: '<path d="M21 3 10.5 13.5"/><path d="M21 3l-7 18-3.5-7.5L3 10z"/>',
};

export function icon(name, cls = '') {
  const body = ICONS[name] || ICONS.info;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ''}>${body}</svg>`;
}

/* ================= Formatters ================= */
let currency = { symbol: 'Rs.', code: 'PKR' };
export function setCurrency(c) { if (c) currency = c; }

export function formatMoney(value) {
  const n = Number(value || 0);
  return `${currency.symbol} ${n.toLocaleString('en-US')}`;
}

export function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Dial-safe href for a display phone number: "+92 313 380 1788" -> "tel:+923133801788" */
export function telHref(raw = '') {
  const cleaned = String(raw).replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

export function starsHTML(rating = 0) {
  const rounded = Math.round(Number(rating));
  let out = '<span class="stars" role="img" aria-label="' + rating + ' out of 5 stars">';
  for (let i = 1; i <= 5; i += 1) {
    out += icon('star', i <= rounded ? 'is-filled' : 'is-empty');
  }
  return out + '</span>';
}

/* ================= Favourites (local only) =================
   Single source of truth: localStorage key FAV_KEY.
   Every surface (product page, cards, header badge, favourites page)
   reads and writes through these helpers — never its own storage. */
const FAV_KEY = 'zyc:favs:v1';
export const FAVOURITES_EVENT = 'zyc:favourites-changed';

export function getFavourites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (_) { return []; }
}

export function isFavourite(id) {
  return getFavourites().includes(id);
}

export function favouriteCount() {
  return getFavourites().length;
}

function writeFavourites(list) {
  try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch (_) { /* ignore */ }
  document.dispatchEvent(new CustomEvent(FAVOURITES_EVENT, { detail: { favourites: list } }));
  refreshFavouriteBadges();
}

export function toggleFavourite(id) {
  const favs = getFavourites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  writeFavourites(next);
  return next.includes(id);
}

export function removeFavourite(id) {
  writeFavourites(getFavourites().filter((f) => f !== id));
  return false;
}

/** Keep every rendered heart button in sync with the store. */
export function syncFavouriteButtons(root = document) {
  const favs = getFavourites();
  root.querySelectorAll('[data-fav]').forEach((btn) => {
    const active = favs.includes(btn.dataset.fav);
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

export function refreshFavouriteBadges() {
  const n = favouriteCount();
  document.querySelectorAll('[data-fav-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
}

/* ================= Cards ================= */

/* Photography for newly added dishes may not be uploaded yet — fall back to a
   branded placeholder instead of showing a broken image. */
export const IMAGE_FALLBACK = 'images/branding/placeholder.jpg';
const IMG_FALLBACK_ATTR = `onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'"`;

export function productCardHTML(product, opts = {}) {
  const horizontal = opts.horizontal ? ' product-card--h' : '';
  const unavailable = product.availability === false;
  const badge = product.badge && product.badge.enabled
    ? `<span class="badge badge--occasion product-card__badge">${escapeHTML(product.badge.text)}</span>`
    : '';
  const soldOut = unavailable ? '<span class="badge badge--soldout product-card__badge" style="top:auto;bottom:10px">Currently unavailable</span>' : '';
  const isFav = getFavourites().includes(product.id);
  const price = product.sizes && product.sizes.length
    ? formatMoney(Math.min(...product.sizes.map((s) => s.price)))
    : formatMoney(product.basePrice);
  const href = `product.html?slug=${encodeURIComponent(product.slug)}`;

  return `
  <article class="product-card${horizontal}${unavailable ? ' is-unavailable' : ''}" data-product-id="${escapeHTML(product.id)}">
    <div class="product-card__media">
      <a href="${href}" tabindex="-1" aria-hidden="true">
        <img src="${escapeHTML(product.images?.[0] || IMAGE_FALLBACK)}" alt="${escapeHTML(product.name)}" loading="lazy" decoding="async" width="480" height="360" ${IMG_FALLBACK_ATTR}>
      </a>
      ${badge}${soldOut}
      ${opts.horizontal ? '' : `<button class="product-card__fav${isFav ? ' is-active' : ''}" type="button" data-fav="${escapeHTML(product.id)}" aria-pressed="${isFav}" aria-label="Save ${escapeHTML(product.name)} to favourites">${icon('heart')}</button>`}
    </div>
    <div class="product-card__body">
      <h3 class="product-card__title"><a href="${href}">${escapeHTML(product.name)}</a></h3>
      ${opts.showMeta ? `<div class="rating-line product-card__meta">
        ${starsHTML(product.rating?.average || 0)}
        <span>${product.rating?.average ?? '—'} (${product.rating?.count ?? 0})</span>
        <span class="product-card__stock${unavailable ? ' is-out' : ''}">${unavailable ? 'Unavailable' : 'Available'}</span>
      </div>` : ''}
      <p class="product-card__desc">${escapeHTML(product.description)}</p>
      <div class="product-card__foot">
        <span class="price product-card__price">${price}</span>
        ${unavailable
          ? '<button class="btn-add" type="button" disabled aria-label="Item unavailable">Sold out</button>'
          : `<button class="btn-add" type="button" data-quick-add="${escapeHTML(product.slug)}" aria-label="Add ${escapeHTML(product.name)} to cart">Add ${icon('plus')}</button>`}
      </div>
      ${opts.removable ? `<button class="btn-remove product-card__remove" type="button" data-remove-fav="${escapeHTML(product.id)}">${icon('trash-2')} Remove from favourites</button>` : ''}
    </div>
  </article>`;
}

export function categoryCardHTML(category) {
  return `
  <a class="category-card" href="menu.html?category=${encodeURIComponent(category.slug)}">
    <img src="${escapeHTML(category.image)}" alt="${escapeHTML(category.name)}" loading="lazy" decoding="async" width="300" height="255">
    <span class="category-card__overlay">
      <span class="category-card__name">${icon('utensils')}${escapeHTML(category.name)}</span>
      <span class="category-card__count">${Number(category.itemCount || 0)} Items</span>
    </span>
  </a>`;
}

export function categoryCircleHTML(category) {
  return `
  <a class="category-circle" href="menu.html?category=${encodeURIComponent(category.slug)}">
    <img src="${escapeHTML(category.image)}" alt="${escapeHTML(category.name)}" loading="lazy" decoding="async" width="66" height="66">
    <span>${escapeHTML(category.name)}</span>
  </a>`;
}

export function dealCardHTML(deal, includedProducts = []) {
  const badge = deal.badge && deal.badge.enabled
    ? `<span class="badge badge--occasion deal-card__badge">${escapeHTML(deal.badge.text)}</span>` : '';
  const chips = includedProducts
    .map((p) => `<span class="badge badge--muted">${escapeHTML(p.name)}</span>`)
    .join('');
  const savings = Number(deal.savings || (deal.originalPrice - deal.dealPrice) || 0);
  const unavailable = deal.availability === false;

  return `
  <article class="deal-card" data-deal-id="${escapeHTML(deal.id)}">
    <div class="deal-card__media">
      <img src="${escapeHTML(deal.image)}" alt="${escapeHTML(deal.name)}" loading="lazy" decoding="async" width="420" height="320">
      ${badge}
    </div>
    <div class="deal-card__body">
      <h3>${escapeHTML(deal.name)}</h3>
      <p class="muted small">${escapeHTML(deal.description)}</p>
      <div class="deal-card__includes">${chips}</div>
      <div class="deal-card__prices">
        <span class="price">${formatMoney(deal.dealPrice)}</span>
        <span class="price-strike">${formatMoney(deal.originalPrice)}</span>
        ${savings > 0 ? `<span class="badge badge--saving">Save ${formatMoney(savings)}</span>` : ''}
      </div>
      <div class="deal-card__foot">
        ${unavailable
          ? '<button class="btn btn--primary" type="button" disabled>Unavailable</button>'
          : `<button class="btn btn--primary" type="button" data-add-deal="${escapeHTML(deal.id)}">Add Deal To Cart ${icon('plus')}</button>`}
        <a class="btn btn--ghost" href="menu.html">Browse Menu</a>
      </div>
    </div>
  </article>`;
}

export function reviewCardHTML(review) {
  const initials = String(review.customerName || '?').trim().charAt(0).toUpperCase();
  const date = review.date ? new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  return `
  <article class="review-card">
    <div class="review-card__head">
      <span class="review-avatar" aria-hidden="true">${escapeHTML(initials)}</span>
      <div>
        <div class="review-card__name">${escapeHTML(review.customerName)}</div>
        <div class="tiny muted">${escapeHTML(date)}</div>
      </div>
    </div>
    ${starsHTML(review.rating)}
    <p class="review-card__text">“${escapeHTML(review.reviewText)}”</p>
  </article>`;
}

export function skeletonGridHTML(n = 4) {
  return Array.from({ length: n })
    .map(() => '<div class="skeleton skeleton-card" aria-hidden="true"></div>')
    .join('');
}

/* ================= Toast ================= */
let toastStack;
export function toast(message, type = 'default', actionHTML = '') {
  if (!toastStack) {
    toastStack = document.createElement('div');
    toastStack.className = 'toast-stack';
    toastStack.setAttribute('role', 'status');
    toastStack.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastStack);
  }
  const el = document.createElement('div');
  el.className = `toast${type !== 'default' ? ` toast--${type}` : ''}`;
  const ic = type === 'error' ? 'alert-circle' : type === 'success' ? 'check-circle' : 'info';
  el.innerHTML = `${icon(ic)}<div>${escapeHTML(message)}</div>${actionHTML}`;
  toastStack.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 260);
  }, 2800);
}

/* ================= Header / drawer / footer / bottom nav ================= */

const NAV_LINKS = [
  { label: 'Home', href: 'index.html', page: 'home' },
  { label: 'Menu', href: 'menu.html', page: 'menu' },
  { label: 'Deals', href: 'deals.html', page: 'deals' },
  { label: 'About Us', href: 'about.html', page: 'about' },
  { label: 'Reviews', href: 'reviews.html', page: 'reviews' },
  { label: 'Contact', href: 'contact.html', page: 'contact' },
];

const TABS = [
  { label: 'Home', href: 'index.html', page: 'home', icon: 'home' },
  { label: 'Menu', href: 'menu.html', page: 'menu', icon: 'utensils' },
  { label: 'Deals', href: 'deals.html', page: 'deals', icon: 'percent' },
  { label: 'Orders', href: 'how-ordering-works.html', page: 'orders', icon: 'receipt' },
  { label: 'Profile', href: 'about.html', page: 'profile', icon: 'user' },
];

function brandHTML(settings) {
  return `<a class="brand" href="index.html" aria-label="${escapeHTML(settings.restaurantName)} — home">
      <span class="brand__top">${escapeHTML(settings.logo?.wordmarkTop || 'ZYC')}</span>
      <span class="brand__bottom">${escapeHTML(settings.logo?.wordmarkBottom || 'FOOD')}</span>
    </a>`;
}

export function mountHeader(settings, activePage) {
  const host = document.getElementById('site-header');
  if (!host) return;

  host.className = 'site-header';
  host.innerHTML = `
    <div class="container site-header__inner">
      <button class="icon-btn header-mobile-only" type="button" id="drawer-open" aria-label="Open menu" aria-expanded="false" aria-controls="site-drawer">${icon('menu')}</button>
      ${brandHTML(settings)}
      <nav class="nav-desktop" aria-label="Primary">
        ${NAV_LINKS.map((l) => `<a href="${l.href}"${l.page === activePage ? ' aria-current="page"' : ''}>${l.label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" type="button" data-search-open aria-label="Search the menu">${icon('search')}</button>
        <a class="icon-btn" href="favourites.html" aria-label="View my favourites"${activePage === 'favourites' ? ' aria-current="page"' : ''}>
          ${icon('heart')}<span class="cart-badge" data-fav-count hidden>0</span>
        </a>
        <a class="icon-btn" href="cart.html" aria-label="View cart">
          ${icon('shopping-cart')}<span class="cart-badge" data-cart-count hidden>0</span>
        </a>
        <a class="btn btn--primary btn--sm" href="menu.html">Order Now</a>
      </div>
    </div>`;

  mountDrawer(settings, activePage);
  wireSearchToggle();
  refreshCartBadges();
  refreshFavouriteBadges();
}

function mountDrawer(settings, activePage) {
  if (document.getElementById('site-drawer')) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  backdrop.id = 'drawer-backdrop';

  const drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.id = 'site-drawer';
  drawer.setAttribute('aria-label', 'Mobile menu');
  drawer.innerHTML = `
    <div class="drawer__head">
      ${brandHTML(settings)}
      <button class="icon-btn" type="button" id="drawer-close" aria-label="Close menu">${icon('x')}</button>
    </div>
    <nav aria-label="Mobile primary">
      ${NAV_LINKS.map((l) => `<a href="${l.href}"${l.page === activePage ? ' aria-current="page"' : ''}>${l.label}</a>`).join('')}
      <a href="cart.html"${activePage === 'cart' ? ' aria-current="page"' : ''}>Cart</a>
      <a href="favourites.html"${activePage === 'favourites' ? ' aria-current="page"' : ''}>My Favourites</a>
      <a href="how-ordering-works.html"${activePage === 'orders' ? ' aria-current="page"' : ''}>How Ordering Works</a>
    </nav>
    <div class="drawer__foot">
      <a class="btn btn--primary" href="menu.html">Order Now ${icon('arrow-right')}</a>
      <div class="drawer__contact">
        <div>${escapeHTML(settings.contact?.phone || '')}</div>
        <div>${escapeHTML(settings.contact?.address || '')}</div>
      </div>
    </div>`;

  document.body.append(backdrop, drawer);

  const open = () => {
    backdrop.classList.add('is-open');
    drawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('drawer-open')?.setAttribute('aria-expanded', 'true');
    drawer.querySelector('a')?.focus();
  };
  const close = () => {
    backdrop.classList.remove('is-open');
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    document.getElementById('drawer-open')?.setAttribute('aria-expanded', 'false');
  };

  document.getElementById('drawer-open')?.addEventListener('click', open);
  document.getElementById('drawer-close')?.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

export function mountBottomNav(activePage) {
  const host = document.getElementById('bottom-nav');
  if (!host) return;
  document.body.dataset.bottomnav = 'true';
  host.className = 'bottom-nav';
  host.setAttribute('aria-label', 'Mobile app navigation');
  host.innerHTML = `<div class="bottom-nav__inner">
    ${TABS.map((t) => `<a href="${t.href}"${t.page === activePage ? ' aria-current="page"' : ''}>${icon(t.icon)}<span>${t.label}</span></a>`).join('')}
  </div>`;
}

export function mountFooter(settings) {
  const host = document.getElementById('site-footer');
  if (!host) return;
  const todayIdx = new Date().getDay(); // 0=Sun
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[todayIdx];

  const socials = Object.entries(settings.socialLinks || {})
    .filter(([, url]) => url)
    .map(([key, url]) => `<a href="${escapeHTML(url)}" target="_blank" rel="noopener" aria-label="${key}">${icon(key === 'tiktok' ? 'music' : key)}</a>`)
    .join('');

  host.className = 'site-footer';
  host.innerHTML = `
    <div class="footer-highlights">
      <div class="container">
        <div class="footer-highlights__grid">
          ${(settings.footerFeatureHighlights || []).map((f) => `
            <div class="footer-highlights__item">
              ${icon(f.icon)}
              <div><h3>${escapeHTML(f.title)}</h3><p>${escapeHTML(f.text)}</p></div>
            </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="container">
      <div class="footer-main">
        <div class="footer-col">
          ${brandHTML(settings)}
          <p class="muted small mt-4" style="max-width:320px">${escapeHTML(settings.tagline || '')}</p>
          ${socials ? `<div class="social-row mt-4">${socials}</div>` : ''}
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <ul>
            ${NAV_LINKS.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}
            <li><a href="how-ordering-works.html">How Ordering Works</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul>
            <li class="footer-contact-item">${icon('phone')}<a href="${telHref(settings.contact?.phone || '')}">${escapeHTML(settings.contact?.phone || '')}</a></li>
            <li class="footer-contact-item">${icon('mail')}<a href="mailto:${escapeHTML(settings.contact?.email || '')}">${escapeHTML(settings.contact?.email || '')}</a></li>
            <li class="footer-contact-item">${icon('map-pin')}<span>${escapeHTML(settings.contact?.address || '')}</span></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Opening Hours</h4>
          <ul class="footer-hours">
            ${(settings.openingHours || []).map((h) => `
              <li class="${h.day === today ? 'is-today' : ''}"><span class="day">${escapeHTML(h.day)}</span><span class="time">${escapeHTML(h.open)} – ${escapeHTML(h.close)}</span></li>`).join('')}
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${escapeHTML(settings.restaurantName)}. All rights reserved.</span>
        <span>Demo site — content managed entirely through JSON files.</span>
        <span class="footer-credit">Designed &amp; Developed by <strong>Imran AF</strong></span>
      </div>
    </div>`;
}

/* ================= Cart badge ================= */
export function refreshCartBadges(bump = false) {
  const n = Cart.count();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
    if (bump && n > 0) {
      el.classList.remove('is-bumping');
      void el.offsetWidth;
      el.classList.add('is-bumping');
    }
  });
}

export function initCartBadge() {
  Cart.subscribe(() => refreshCartBadges());
}

/* ================= Search overlay ================= */
let searchProducts = [];
export function initSearchOverlay(products) {
  searchProducts = products || [];
  if (document.getElementById('search-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.id = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-overlay__box">
      <form class="search-overlay__field" role="search" action="search.html" method="get">
        ${icon('search')}
        <label class="sr-only" for="global-search">Search the menu</label>
        <input id="global-search" name="q" type="search" placeholder="Search burgers, pizza, BBQ…" autocomplete="off">
        <button class="icon-btn" type="button" data-search-close aria-label="Close search">${icon('x')}</button>
      </form>
      <p class="search-overlay__hint">Press Enter to see all results · Esc to close</p>
      <div class="search-suggestions" id="search-suggestions"></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#global-search');
  const list = overlay.querySelector('#search-suggestions');

  const render = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { list.innerHTML = ''; return; }
    const hits = searchProducts.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)).slice(0, 5);
    list.innerHTML = hits.length
      ? hits.map((p) => `<a class="search-suggestion" href="product.html?slug=${encodeURIComponent(p.slug)}">
          <img src="${escapeHTML(p.images?.[0] || '')}" alt="" loading="lazy">
          <span><strong>${escapeHTML(p.name)}</strong><br><span class="tiny muted">${escapeHTML(p.description)}</span></span>
          <span class="price" style="margin-left:auto">${formatMoney(p.basePrice)}</span>
        </a>`).join('')
      : '<p class="muted small">No matches — try “burger”, “pizza” or “bbq”.</p>';
  };

  input.addEventListener('input', render);
  overlay.querySelector('[data-search-close]').addEventListener('click', closeSearch);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
    if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }
  });
}

export function openSearch() {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('input')?.focus();
}
export function closeSearch() {
  const overlay = document.getElementById('search-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}
function wireSearchToggle() {
  document.querySelectorAll('[data-search-open]').forEach((btn) => btn.addEventListener('click', openSearch));
}

/* ================= Scroll reveal ================= */
export function initReveal(selector = '.reveal') {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  els.forEach((el) => io.observe(el));
}

/* ================= SEO helpers ================= */
export function setMeta({ title, description, canonical, image, settings }) {
  const base = settings?.seoDefaults?.siteUrl || window.location.origin;
  if (title) {
    document.title = title;
    setTag('meta[property="og:title"]', 'content', title);
    setTag('meta[name="twitter:title"]', 'content', title);
  }
  if (description) {
    setTag('meta[name="description"]', 'content', description);
    setTag('meta[property="og:description"]', 'content', description);
    setTag('meta[name="twitter:description"]', 'content', description);
  }
  if (canonical) {
    const url = canonical.startsWith('http') ? canonical : `${base.replace(/\/$/, '')}/${canonical.replace(/^\//, '')}`;
    setTag('link[rel="canonical"]', 'href', url);
    setTag('meta[property="og:url"]', 'content', url);
  }
  if (image) {
    const abs = image.startsWith('http') ? image : `${base.replace(/\/$/, '')}/${image.replace(/^\//, '')}`;
    setTag('meta[property="og:image"]', 'content', abs);
    setTag('meta[name="twitter:image"]', 'content', abs);
  }
}

function setTag(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta');
    const m = selector.match(/\[(.+?)="(.+?)"\]/);
    if (m) el.setAttribute(m[1], m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export function injectJSONLD(data, id = 'jsonld') {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function absoluteURL(settings, path) {
  const base = (settings?.seoDefaults?.siteUrl || window.location.origin).replace(/\/$/, '');
  return `${base}/${String(path || '').replace(/^\//, '')}`;
}

/* ================= Misc UI ================= */
export function breadcrumbsHTML(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol style="display:contents">${items
    .map((it, i) => `<li style="display:contents">${
      it.href ? `<a href="${escapeHTML(it.href)}">${escapeHTML(it.label)}</a>` : `<span aria-current="page">${escapeHTML(it.label)}</span>`
    }${i < items.length - 1 ? icon('chevron-right') : ''}</li>`)
    .join('')}</ol></nav>`;
}

export function isOpenNow(openingHours = []) {
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[now.getDay()];
  const entry = openingHours.find((h) => h.day === today);
  if (!entry) return { open: false, entry: null };
  const [oh, om] = entry.open.split(':').map(Number);
  const [ch, cm] = entry.close.split(':').map(Number);
  const mins = now.getHours() * 60 + now.getMinutes();
  const start = oh * 60 + om;
  let end = ch * 60 + cm;
  if (end <= start) end += 24 * 60; // past-midnight close
  const cur = mins < start ? mins + 24 * 60 : mins;
  return { open: cur >= start && cur <= end, entry };
}

export function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}
