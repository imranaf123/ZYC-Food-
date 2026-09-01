/* =========================================================
   pages/cart-page.js
   ========================================================= */

import * as Cart from '../cart.js';
import { getDelivery } from '../data-loader.js';

export async function init({ settings, UI }) {
  const listHost = document.getElementById('cart-items');
  const summaryHost = document.getElementById('cart-summary');
  const delivery = await getDelivery();

  UI.setMeta({
    title: 'Your Cart — ZYC Food',
    description: 'Review your ZYC Food order before choosing delivery or pickup at checkout.',
    canonical: 'cart.html',
    settings,
  });

  function render() {
    const items = Cart.getItems();

    if (!items.length) {
      listHost.innerHTML = `
        <div class="empty-state">
          ${UI.icon('shopping-cart')}
          <h3>Your cart is empty</h3>
          <p>Add a few favourites from the menu and they'll show up here, ready to send to the kitchen.</p>
          <a class="btn btn--primary" href="menu.html">Browse the menu</a>
        </div>`;
      summaryHost.innerHTML = `
        <div class="summary-card">
          <h2>Order Summary</h2>
          <div class="summary-row"><span class="label">Subtotal</span><span class="value">${UI.formatMoney(0)}</span></div>
          <div class="summary-row"><span class="label">Delivery fee</span><span class="value muted">Chosen at checkout</span></div>
          <div class="summary-row summary-row--total"><span class="label">Total</span><span class="value">${UI.formatMoney(0)}</span></div>
          <a class="btn btn--primary btn--block" href="menu.html">Add items first</a>
        </div>`;
      return;
    }

    listHost.innerHTML = items.map((item) => {
      const opts = [
        item.sizeLabel ? `Size: ${item.sizeLabel}` : '',
        ...(item.customizations || []).map((c) => `${c.groupLabel}: ${c.optionLabel}${c.priceDelta ? ` (+${UI.formatMoney(c.priceDelta)})` : ''}`),
        (item.addOns || []).length ? `Add-ons: ${item.addOns.map((a) => `${a.label} (+${UI.formatMoney(a.price)})`).join(', ')}` : '',
      ].filter(Boolean).join(' · ');

      return `
      <article class="cart-item" data-key="${UI.escapeHTML(item.key)}">
        <div class="cart-item__media">
          <img src="${UI.escapeHTML(item.image)}" alt="${UI.escapeHTML(item.name)}" loading="lazy" width="120" height="120">
        </div>
        <div>
          <h3 class="cart-item__title">${UI.escapeHTML(item.name)}</h3>
          ${opts ? `<p class="cart-item__opts">${UI.escapeHTML(opts)}</p>` : ''}
          ${item.notes ? `<p class="cart-item__notes">“${UI.escapeHTML(item.notes)}”</p>` : ''}
          <div class="cart-item__controls">
            <div class="qty qty--sm" role="group" aria-label="Quantity for ${UI.escapeHTML(item.name)}">
              <button type="button" data-dec aria-label="Decrease quantity">${UI.icon('minus')}</button>
              <span class="qty__value">${item.quantity}</span>
              <button type="button" data-inc aria-label="Increase quantity">${UI.icon('plus')}</button>
            </div>
            <span class="muted small">${UI.formatMoney(item.unitPrice)} each</span>
          </div>
        </div>
        <div class="cart-item__right">
          <span class="cart-item__total">${UI.formatMoney(Cart.lineTotal(item))}</span>
          <button class="btn-remove" type="button" data-remove>${UI.icon('trash-2')} Remove</button>
        </div>
      </article>`;
    }).join('');

    const sub = Cart.subtotal(items);
    const cheapest = Math.min(...(delivery.distanceRanges || []).map((r) => r.fee));

    summaryHost.innerHTML = `
      <div class="summary-card">
        <h2>Order Summary</h2>
        <div class="summary-row"><span class="label">Items (${Cart.count(items)})</span><span class="value">${UI.formatMoney(sub)}</span></div>
        <div class="summary-row"><span class="label">Delivery fee</span><span class="value muted">From ${UI.formatMoney(cheapest)}</span></div>
        <p class="tiny muted">Delivery is charged by distance and calculated at checkout. Pickup is always free.</p>
        <div class="summary-row summary-row--total"><span class="label">Subtotal</span><span class="value">${UI.formatMoney(sub)}</span></div>
        <a class="btn btn--primary btn--block btn--lg" href="checkout.html">Proceed to Checkout</a>
        <a class="btn btn--ghost btn--block" href="menu.html">Add more items</a>
        <button class="btn-remove mt-2" type="button" id="clear-cart" style="align-self:center">${UI.icon('trash-2')} Clear cart</button>
      </div>`;
  }

  listHost.addEventListener('click', (e) => {
    const article = e.target.closest('[data-key]');
    if (!article) return;
    const key = article.dataset.key;
    const item = Cart.getItems().find((i) => i.key === key);
    if (!item) return;

    if (e.target.closest('[data-inc]')) Cart.updateQuantity(key, item.quantity + 1);
    else if (e.target.closest('[data-dec]')) Cart.updateQuantity(key, item.quantity - 1);
    else if (e.target.closest('[data-remove]')) {
      Cart.removeItem(key);
      UI.toast(`${item.name} removed from cart`);
    }
  });

  summaryHost.addEventListener('click', (e) => {
    if (e.target.closest('#clear-cart')) {
      Cart.clear();
      UI.toast('Cart cleared');
    }
  });

  Cart.subscribe(() => { render(); UI.refreshCartBadges(); });
}
