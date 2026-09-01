/* =========================================================
   pages/product.js — detail, live pricing, add to cart
   ========================================================= */

import { getProductBySlug, resolveCustomizationGroups, getReviews, getProducts } from '../data-loader.js';
import * as Cart from '../cart.js';

export async function init({ settings, UI }) {
  const slug = UI.qs('slug');
  const host = document.getElementById('product-root');
  const product = slug ? await getProductBySlug(slug) : null;

  if (!product) {
    host.innerHTML = `
      <div class="empty-state" style="margin-block:48px">
        ${UI.icon('alert-circle')}
        <h3>We couldn't find that item</h3>
        <p>It may have been renamed or removed from the menu.</p>
        <a class="btn btn--primary" href="menu.html">Back to the menu</a>
      </div>`;
    UI.setMeta({ title: 'Item not found — ZYC Food', description: 'This menu item could not be found.', settings });
    return;
  }

  const [groups, reviews, allProducts] = await Promise.all([
    resolveCustomizationGroups(product), getReviews(), getProducts(),
  ]);

  UI.setMeta({
    title: product.seo?.title || `${product.name} — ${settings.restaurantName}`,
    description: product.seo?.description || product.description,
    canonical: `product.html?slug=${product.slug}`,
    image: product.images?.[0],
    settings,
  });

  /* ---------- State ---------- */
  const sizes = product.sizes || [];
  const state = {
    sizeId: (sizes.find((s) => s.default) || sizes[0] || {}).id || null,
    customizations: {},
    addOns: new Set(),
    quantity: 1,
    notes: '',
    imageIndex: 0,
  };
  groups.forEach((g) => {
    const def = g.options.find((o) => o.default) || (g.required ? g.options[0] : null);
    if (def) state.customizations[g.id] = def.id;
  });

  /* ---------- Render ---------- */
  host.innerHTML = `
    ${UI.breadcrumbsHTML([
      { label: 'Home', href: 'index.html' },
      { label: 'Menu', href: 'menu.html' },
      { label: capitalize(product.category), href: `menu.html?category=${product.category}` },
      { label: product.name },
    ])}
    <div class="product-layout">
      <div class="gallery">
        <div class="gallery__main">
          <img id="gallery-img" src="${UI.escapeHTML(product.images?.[0] || UI.IMAGE_FALLBACK)}" alt="${UI.escapeHTML(product.name)}" width="800" height="600" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='${UI.IMAGE_FALLBACK}'">
          ${product.badge?.enabled ? `<span class="badge badge--occasion gallery__badge">${UI.escapeHTML(product.badge.text)}</span>` : ''}
          <button class="icon-btn icon-btn--bordered gallery__fav" type="button" data-fav="${UI.escapeHTML(product.id)}" aria-pressed="false" aria-label="Save to favourites">${UI.icon('heart')}</button>
          ${product.images.length > 1 ? `
          <div class="gallery__nav">
            <button class="carousel-arrow" type="button" data-gallery="-1" aria-label="Previous photo">${UI.icon('chevron-left')}</button>
            <button class="carousel-arrow" type="button" data-gallery="1" aria-label="Next photo">${UI.icon('chevron-right')}</button>
          </div>` : ''}
          <span class="gallery__counter" id="gallery-counter">1/${product.images.length}</span>
        </div>
        ${product.images.length > 1 ? `<div class="gallery__thumbs" role="tablist" aria-label="Product photos">
          ${product.images.map((img, i) => `<button type="button" role="tab" data-thumb="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}"><img src="${UI.escapeHTML(img)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${UI.IMAGE_FALLBACK}'"></button>`).join('')}
        </div>` : ''}
      </div>

      <div class="product-info">
        <div class="product-info__head">
          <h1>${UI.escapeHTML(product.name)}</h1>
          <p class="muted">${UI.escapeHTML(product.description)}</p>
          <div class="rating-line">
            ${UI.starsHTML(product.rating?.average || 0)}
            <span><strong style="color:#fff">${product.rating?.average ?? '—'}</strong> (${product.rating?.count ?? 0} reviews)</span>
          </div>
          <div class="product-info__price-row">
            <span class="price" id="unit-price-display"></span>
            <span class="muted small">per item, before quantity</span>
          </div>
          ${product.availability === false ? '<div class="alert alert--error mt-2">This item is currently unavailable.</div>' : ''}
        </div>

        ${sizes.length ? `
        <section class="option-section" aria-labelledby="size-title">
          <div class="option-section__head">
            <h2 class="option-section__title" id="size-title">Choose Size</h2>
            <span class="option-section__hint">Required</span>
          </div>
          <div class="option-list" role="radiogroup" aria-labelledby="size-title">
            ${sizes.map((s) => `
              <label class="option-row">
                <input type="radio" name="size" value="${UI.escapeHTML(s.id)}" ${s.id === state.sizeId ? 'checked' : ''}>
                <span class="option-row__label">${UI.escapeHTML(s.label)}</span>
                <span class="option-row__right">
                  <span class="price">${UI.formatMoney(s.price)}</span>
                  <span class="check-dot">${UI.icon('check')}</span>
                </span>
              </label>`).join('')}
          </div>
        </section>` : ''}

        ${groups.length ? `
        <section class="option-section" aria-labelledby="cust-title">
          <div class="option-section__head">
            <h2 class="option-section__title" id="cust-title">Customizations</h2>
          </div>
          ${groups.map((g) => `
            <fieldset class="choice-group" style="border-color:var(--color-border)">
              <legend class="option-section__head" style="padding:12px 0 4px;width:100%">
                <span class="option-section__title" style="letter-spacing:.08em">${UI.escapeHTML(g.label)}</span>
                <span class="option-section__hint">${g.type === 'single' ? (g.required ? 'Choose one' : 'Optional') : 'Choose any'}</span>
              </legend>
              <div class="choice-row-inline">
                ${g.options.map((o) => `
                  <label class="choice ${g.type === 'single' ? 'choice--radio' : 'choice--check'}">
                    <input type="${g.type === 'single' ? 'radio' : 'checkbox'}" name="group-${UI.escapeHTML(g.id)}" value="${UI.escapeHTML(o.id)}" ${state.customizations[g.id] === o.id ? 'checked' : ''} data-group="${UI.escapeHTML(g.id)}">
                    <span class="choice__mark">${g.type === 'single' ? '' : UI.icon('check')}</span>
                    <span class="choice__label">${UI.escapeHTML(o.label)}</span>
                    ${o.priceDelta ? `<span class="choice__price">+ ${UI.formatMoney(o.priceDelta)}</span>` : ''}
                  </label>`).join('')}
              </div>
            </fieldset>`).join('')}
        </section>` : ''}

        ${(product.addOns || []).length ? `
        <section class="option-section" aria-labelledby="addons-title">
          <div class="option-section__head">
            <h2 class="option-section__title" id="addons-title">Add-ons</h2>
            <span class="option-section__hint">Optional</span>
          </div>
          <div class="choice-group">
            ${product.addOns.map((a) => `
              <label class="choice choice--check">
                <input type="checkbox" value="${UI.escapeHTML(a.id)}" data-addon="${UI.escapeHTML(a.id)}">
                <span class="choice__mark">${UI.icon('check')}</span>
                <span class="choice__label">${UI.escapeHTML(a.label)}</span>
                <span class="choice__price">+ ${UI.formatMoney(a.price)}</span>
              </label>`).join('')}
          </div>
        </section>` : ''}

        <section class="option-section">
          <div class="field">
            <label for="special-instructions">Special instructions</label>
            <textarea class="textarea" id="special-instructions" placeholder="Anything the kitchen should know? e.g. no onions, extra napkins."></textarea>
          </div>
        </section>

        <div class="addtocart-bar">
          <div class="qty" role="group" aria-label="Quantity">
            <button type="button" data-qty="-1" aria-label="Decrease quantity" disabled>${UI.icon('minus')}</button>
            <output id="qty-value" aria-live="polite">1</output>
            <button type="button" data-qty="1" aria-label="Increase quantity">${UI.icon('plus')}</button>
          </div>
          <button class="btn btn--primary btn--lg" type="button" id="add-to-cart" ${product.availability === false ? 'disabled' : ''}>
            <span id="add-to-cart-label">Add to Cart</span>
          </button>
        </div>

        <ul class="product-meta-list">
          <li>${UI.icon('truck')} Delivery in 30–45 mins · distance based fee calculated at checkout</li>
          <li>${UI.icon('shopping-bag')} Free pickup available — ready in 20–30 mins</li>
          <li>${UI.icon('message-circle')} Order confirmed instantly over WhatsApp</li>
        </ul>
      </div>
    </div>

    <section class="section section--tight" aria-labelledby="related-title">
      <div class="section-head">
        <h2 class="section-title" id="related-title">You may also like</h2>
        <a class="link-more" href="menu.html">Full Menu ${UI.icon('arrow-right')}</a>
      </div>
      <div class="products-grid" id="related-grid"></div>
    </section>`;

  // favourites initial state
  const favBtn = host.querySelector('[data-fav]');
  if (favBtn && UI.getFavourites().includes(product.id)) {
    favBtn.classList.add('is-active');
    favBtn.setAttribute('aria-pressed', 'true');
  }

  /* ---------- Related ---------- */
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);
  document.getElementById('related-grid').innerHTML = related.map((p) => UI.productCardHTML(p)).join('');

  /* ---------- Pricing ---------- */
  function selectedSize() { return sizes.find((s) => s.id === state.sizeId) || null; }

  function selectedCustomizations() {
    return groups.flatMap((g) => {
      const optId = state.customizations[g.id];
      if (!optId) return [];
      const opt = g.options.find((o) => o.id === optId);
      if (!opt) return [];
      return [{ groupId: g.id, groupLabel: g.label, optionId: opt.id, optionLabel: opt.label, priceDelta: opt.priceDelta || 0 }];
    });
  }

  function selectedAddOns() {
    return (product.addOns || []).filter((a) => state.addOns.has(a.id))
      .map((a) => ({ id: a.id, label: a.label, price: a.price }));
  }

  function unitPrice() {
    return Cart.computeUnitPrice({
      basePrice: product.basePrice,
      sizePrice: selectedSize()?.price,
      customizations: selectedCustomizations(),
      addOns: selectedAddOns(),
    });
  }

  function refreshPrice() {
    const unit = unitPrice();
    document.getElementById('unit-price-display').textContent = UI.formatMoney(unit);
    document.getElementById('add-to-cart-label').textContent = `Add to Cart • ${UI.formatMoney(unit * state.quantity)}`;
    document.getElementById('qty-value').textContent = String(state.quantity);
    host.querySelector('[data-qty="-1"]').disabled = state.quantity <= 1;
  }

  /* ---------- Events ---------- */
  host.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'size') { state.sizeId = t.value; refreshPrice(); }
    if (t.dataset.group) {
      state.customizations[t.dataset.group] = t.value;
      refreshPrice();
    }
    if (t.dataset.addon) {
      if (t.checked) state.addOns.add(t.dataset.addon); else state.addOns.delete(t.dataset.addon);
      refreshPrice();
    }
  });

  host.addEventListener('input', (e) => {
    if (e.target.id === 'special-instructions') state.notes = e.target.value;
  });

  host.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      state.quantity = Math.min(99, Math.max(1, state.quantity + Number(qtyBtn.dataset.qty)));
      refreshPrice();
      return;
    }
    const galleryBtn = e.target.closest('[data-gallery]');
    if (galleryBtn) { setImage(state.imageIndex + Number(galleryBtn.dataset.gallery)); return; }
    const thumb = e.target.closest('[data-thumb]');
    if (thumb) setImage(Number(thumb.dataset.thumb));
  });

  function setImage(i) {
    const total = product.images.length;
    state.imageIndex = (i + total) % total;
    document.getElementById('gallery-img').src = product.images[state.imageIndex];
    document.getElementById('gallery-counter').textContent = `${state.imageIndex + 1}/${total}`;
    host.querySelectorAll('[data-thumb]').forEach((t) =>
      t.setAttribute('aria-current', String(Number(t.dataset.thumb) === state.imageIndex)));
  }

  document.getElementById('add-to-cart').addEventListener('click', () => {
    const size = selectedSize();
    Cart.addItem({
      type: 'product',
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] || '',
      sizeId: size?.id || null,
      sizeLabel: size?.label || null,
      customizations: selectedCustomizations(),
      addOns: selectedAddOns(),
      quantity: state.quantity,
      unitPrice: unitPrice(),
      notes: state.notes,
    });
    UI.refreshCartBadges(true);
    UI.toast(`${state.quantity} × ${product.name} added to cart`, 'success');
  });

  refreshPrice();

  /* ---------- Structured data ---------- */
  const productReviews = reviews.filter((r) => r.active !== false);
  UI.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.seo?.description || product.description,
    image: UI.absoluteURL(settings, product.images?.[0]),
    sku: product.id,
    category: product.category,
    brand: { '@type': 'Brand', name: settings.restaurantName },
    offers: {
      '@type': 'Offer',
      priceCurrency: settings.currency?.code || 'PKR',
      price: String(sizes.length ? Math.min(...sizes.map((s) => s.price)) : product.basePrice),
      availability: product.availability === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: UI.absoluteURL(settings, `product.html?slug=${product.slug}`),
    },
    aggregateRating: product.rating?.count ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average,
      reviewCount: product.rating.count,
    } : undefined,
    review: productReviews.slice(0, 3).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.customerName },
      datePublished: r.date,
      reviewBody: r.reviewText,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    })),
  }, 'jsonld-product');

  UI.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: UI.absoluteURL(settings, 'index.html') },
      { '@type': 'ListItem', position: 2, name: 'Menu', item: UI.absoluteURL(settings, 'menu.html') },
      { '@type': 'ListItem', position: 3, name: capitalize(product.category), item: UI.absoluteURL(settings, `menu.html?category=${product.category}`) },
      { '@type': 'ListItem', position: 4, name: product.name, item: UI.absoluteURL(settings, `product.html?slug=${product.slug}`) },
    ],
  }, 'jsonld-breadcrumbs');
}

function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
