/* =========================================================
   pages/checkout.js — delivery/pickup + live distance fee + WhatsApp
   ========================================================= */

import * as Cart from '../cart.js';
import { getDelivery } from '../data-loader.js';
import { resolveFee, outOfRangeMessage } from '../delivery.js';
import { buildOrderLink } from '../whatsapp.js';

export async function init({ settings, UI }) {
  const root = document.getElementById('checkout-root');
  const config = await getDelivery();
  const saved = Cart.loadCheckout();

  UI.setMeta({
    title: 'Checkout — ZYC Food',
    description: 'Choose delivery or pickup, see your distance based delivery fee instantly, and send your order to ZYC Food on WhatsApp.',
    canonical: 'checkout.html',
    settings,
  });

  const ranges = (config.distanceRanges || []).slice().sort((a, b) => a.minKm - b.minKm);
  const maxKm = ranges.length ? ranges[ranges.length - 1].maxKm : 0;

  const state = {
    name: saved.name || '',
    phone: saved.phone || '',
    type: saved.type === 'pickup' ? 'pickup' : 'delivery',
    distanceKm: Number.isFinite(saved.distanceKm) ? saved.distanceKm : 4.5,
    address: saved.address || '',
    instructions: saved.instructions || '',
  };

  if (!Cart.getItems().length) {
    root.innerHTML = `
      <div class="empty-state" style="margin-block:32px">
        ${UI.icon('shopping-cart')}
        <h3>There's nothing to check out yet</h3>
        <p>Add something delicious to your cart and come back — it only takes a minute.</p>
        <a class="btn btn--primary" href="menu.html">Browse the menu</a>
      </div>`;
    return;
  }

  root.innerHTML = `
    <div class="checkout-layout">
      <div>
        <!-- Step 1 -->
        <section class="form-card" aria-labelledby="step-details">
          <h2 class="form-card__title" id="step-details"><span class="step-num">1</span> Your details</h2>
          <div class="form-grid">
            <div class="field" id="field-name">
              <label for="cust-name">Full name</label>
              <input class="input" id="cust-name" name="name" type="text" autocomplete="name" placeholder="e.g. Ali Raza" value="${UI.escapeHTML(state.name)}" required>
              <span class="field-error">Please enter your name so we know who the order is for.</span>
            </div>
            <div class="field" id="field-phone">
              <label for="cust-phone">Phone number</label>
              <input class="input" id="cust-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="e.g. 03001234567" value="${UI.escapeHTML(state.phone)}" required>
              <span class="field-error">Please enter a phone number we can reach you on.</span>
            </div>
          </div>
        </section>

        <!-- Step 2 -->
        <section class="form-card" aria-labelledby="step-method">
          <h2 class="form-card__title" id="step-method"><span class="step-num">2</span> Delivery or pickup</h2>
          <div class="segmented" role="radiogroup" aria-label="Order type">
            <label class="option-row">
              <input type="radio" name="ordertype" value="delivery" ${state.type === 'delivery' ? 'checked' : ''}>
              <span class="check-dot">${UI.icon('check')}</span>
              <span class="option-row__label">Delivery</span>
            </label>
            <label class="option-row"${config.pickup?.enabled === false ? ' aria-disabled="true" style="opacity:.5;pointer-events:none"' : ''}>
              <input type="radio" name="ordertype" value="pickup" ${state.type === 'pickup' ? 'checked' : ''}>
              <span class="check-dot">${UI.icon('check')}</span>
              <span class="option-row__label">Pickup</span>
            </label>
          </div>

          <div id="pickup-block" hidden>
            <div class="alert alert--info">${UI.icon('shopping-bag')}<div>
              <strong>${UI.escapeHTML(config.pickup?.info || 'Pickup available.')}</strong><br>
              Collect from: ${UI.escapeHTML(settings.contact?.address || '')}
            </div></div>
          </div>

          <div id="delivery-block">
            <div class="range-wrap">
              <div class="option-section__head">
                <span class="form-label">Distance from the restaurant</span>
                <span class="option-section__hint">Manual estimate — no GPS needed</span>
              </div>
              <div class="distance-readout">
                <div>
                  <div class="distance-readout__lbl">Distance</div>
                  <div class="distance-readout__km"><span id="distance-value">${state.distanceKm}</span> km</div>
                </div>
                <div style="text-align:right">
                  <div class="distance-readout__lbl">Delivery fee</div>
                  <div class="distance-readout__fee" id="fee-value">—</div>
                </div>
              </div>
              <label class="sr-only" for="distance-range">Distance in kilometres</label>
              <input type="range" id="distance-range" min="0" max="${maxKm + 5}" step="0.5" value="${state.distanceKm}">
              <div class="range-ticks"><span>0 km</span><span>${maxKm} km (max)</span><span>${maxKm + 5} km</span></div>
              <div class="field" style="max-width:220px">
                <label for="distance-input">Or type the distance (km)</label>
                <input class="input" id="distance-input" type="number" min="0" step="0.1" value="${state.distanceKm}">
              </div>
              <div id="distance-alert"></div>
            </div>

            <div class="divider"></div>

            <div class="field" id="field-address">
              <label for="cust-address">Delivery address</label>
              <textarea class="textarea" id="cust-address" placeholder="House / street / area, city">${UI.escapeHTML(state.address)}</textarea>
              <span class="field-error">Please add the address our rider should deliver to.</span>
            </div>
            <div class="field mt-4">
              <label for="cust-instructions">Delivery instructions (optional)</label>
              <input class="input" id="cust-instructions" type="text" placeholder="e.g. Please ring the bell twice." value="${UI.escapeHTML(state.instructions)}">
            </div>

            <details class="mt-5">
              <summary class="form-label" style="cursor:pointer">See the full distance fee table</summary>
              <table class="fee-table mt-2">
                <thead><tr><th scope="col">Distance</th><th scope="col">Fee</th></tr></thead>
                <tbody id="fee-table-body">
                  ${ranges.map((r) => `<tr data-min="${r.minKm}" data-max="${r.maxKm}"><td>${r.minKm} – ${r.maxKm} km</td><td>${UI.formatMoney(r.fee)}</td></tr>`).join('')}
                </tbody>
              </table>
              <p class="tiny muted mt-2">Fees are configured in <code>data/delivery.json</code>.</p>
            </details>
          </div>
        </section>

        <!-- Step 3 -->
        <section class="form-card" aria-labelledby="step-send">
          <h2 class="form-card__title" id="step-send"><span class="step-num">3</span> Send your order</h2>
          <p class="small muted">Your order is confirmed over WhatsApp — tap the button and the full order message is written for you. No account, no payment details needed.</p>
          <div id="checkout-error"></div>
          <a class="btn btn--whatsapp btn--lg btn--block" id="whatsapp-btn" href="#" target="_blank" rel="noopener">${UI.icon('message-circle')} Send Order On WhatsApp</a>
          <button class="btn btn--ghost btn--block" type="button" id="toggle-preview">Preview the message</button>
          <pre class="wa-preview" id="wa-preview" hidden></pre>
          <div class="wa-fallback" id="wa-fallback" hidden>
            <p class="small"><strong>WhatsApp didn't open?</strong> Some browsers block the pop-up. Use either option below — your order details are already written out.</p>
            <a class="btn btn--whatsapp btn--block" id="wa-direct" href="#" target="_blank" rel="noopener">${UI.icon('message-circle')} Open WhatsApp chat</a>
            <button class="btn btn--outline btn--block" type="button" id="wa-copy">${UI.icon('clipboard')} Copy the order message</button>
            <p class="tiny muted" id="wa-fallback-phone"></p>
          </div>
        </section>
      </div>

      <aside>
        <div class="summary-card">
          <h2>Order Summary</h2>
          <div id="summary-items" class="stack gap-2"></div>
          <div class="divider" style="margin:8px 0"></div>
          <div class="summary-row"><span class="label">Subtotal</span><span class="value" id="sum-subtotal"></span></div>
          <div class="summary-row"><span class="label" id="sum-fee-label">Delivery fee</span><span class="value" id="sum-fee">—</span></div>
          <div class="summary-row summary-row--total"><span class="label">Total</span><span class="value" id="sum-total"></span></div>
          <a class="btn btn--ghost btn--block" href="cart.html">Edit cart</a>
        </div>
      </aside>
    </div>`;

  /* ---------- Elements ---------- */
  const el = {
    name: document.getElementById('cust-name'),
    phone: document.getElementById('cust-phone'),
    address: document.getElementById('cust-address'),
    instructions: document.getElementById('cust-instructions'),
    range: document.getElementById('distance-range'),
    distanceInput: document.getElementById('distance-input'),
    distanceValue: document.getElementById('distance-value'),
    feeValue: document.getElementById('fee-value'),
    distanceAlert: document.getElementById('distance-alert'),
    deliveryBlock: document.getElementById('delivery-block'),
    pickupBlock: document.getElementById('pickup-block'),
    waBtn: document.getElementById('whatsapp-btn'),
    waPreview: document.getElementById('wa-preview'),
    waFallback: document.getElementById('wa-fallback'),
    waDirect: document.getElementById('wa-direct'),
    waCopy: document.getElementById('wa-copy'),
    checkoutError: document.getElementById('checkout-error'),
    summaryItems: document.getElementById('summary-items'),
    sumSubtotal: document.getElementById('sum-subtotal'),
    sumFee: document.getElementById('sum-fee'),
    sumFeeLabel: document.getElementById('sum-fee-label'),
    sumTotal: document.getElementById('sum-total'),
  };

  /* ---------- Recalculation ---------- */
  function currentFee() {
    if (state.type === 'pickup') return { status: 'ok', fee: 0, range: null };
    return resolveFee(state.distanceKm, config);
  }

  function flash(node) {
    node.classList.remove('fee-flash');
    void node.offsetWidth;
    node.classList.add('fee-flash');
  }

  function renderSummary() {
    const items = Cart.getItems();
    el.summaryItems.innerHTML = items.map((item) => {
      const bits = [
        item.sizeLabel,
        ...(item.customizations || []).map((c) => c.optionLabel),
        ...(item.addOns || []).map((a) => `+${a.label}`),
      ].filter(Boolean).join(' · ');
      return `<div class="mini-item">
          <span><span class="mini-item__name">${item.quantity}× ${UI.escapeHTML(item.name)}</span>${bits ? `<br><span class="mini-item__opts">${UI.escapeHTML(bits)}</span>` : ''}</span>
          <span class="price">${UI.formatMoney(Cart.lineTotal(item))}</span>
        </div>`;
    }).join('');

    const sub = Cart.subtotal(items);
    const feeInfo = currentFee();
    const feeApplies = state.type === 'delivery' && feeInfo.status === 'ok';
    const fee = feeApplies ? feeInfo.fee : 0;

    el.sumSubtotal.textContent = UI.formatMoney(sub);
    el.sumFeeLabel.textContent = state.type === 'pickup' ? 'Delivery fee (pickup)' : 'Delivery fee';
    el.sumFee.textContent = state.type === 'pickup'
      ? '—'
      : (feeInfo.status === 'ok' ? UI.formatMoney(fee) : 'Not available');
    el.sumTotal.textContent = UI.formatMoney(sub + fee);
    flash(el.sumFee);
  }

  function renderDistance() {
    el.distanceValue.textContent = String(state.distanceKm);
    const pct = (state.distanceKm / Number(el.range.max)) * 100;
    el.range.style.setProperty('--range-progress', `${pct}%`);

    const info = resolveFee(state.distanceKm, config);
    if (info.status === 'ok') {
      el.feeValue.textContent = UI.formatMoney(info.fee);
      flash(el.feeValue);
      el.distanceAlert.innerHTML = `<div class="alert alert--success mt-4">${UI.icon('check-circle')}<div>Within our delivery zone — fee applied for the ${info.range.minKm}–${info.range.maxKm} km band.</div></div>`;
    } else {
      el.feeValue.textContent = '—';
      el.distanceAlert.innerHTML = `<div class="alert alert--error mt-4">${UI.icon('alert-circle')}<div>${UI.escapeHTML(outOfRangeMessage(info.maxRange))}</div></div>`;
    }

    document.querySelectorAll('#fee-table-body tr').forEach((tr) => {
      const min = Number(tr.dataset.min);
      const max = Number(tr.dataset.max);
      tr.classList.toggle('is-active', info.status === 'ok' && state.distanceKm >= min && state.distanceKm <= max);
    });
  }

  const touched = new Set();
  let lastOrderLink = '';

  function validate(forceAll = false) {
    const errors = [];
    const show = (field, invalid) => {
      if (invalid) errors.push(field);
      toggleFieldError(`field-${field}`, invalid && (forceAll || touched.has(field)));
    };

    show('name', !state.name.trim());
    show('phone', state.phone.replace(/\D/g, '').length < 10);

    if (state.type === 'delivery') {
      show('address', !state.address.trim());
      if (currentFee().status !== 'ok') errors.push('distance');
    } else {
      toggleFieldError('field-address', false);
    }
    return errors;
  }

  function toggleFieldError(id, show) {
    document.getElementById(id)?.classList.toggle('has-error', Boolean(show));
  }

  /* ---------- WhatsApp hand-off ----------
     A plain target="_blank" anchor is not enough in the real world: pop-up
     blockers, embedded/in-app browsers and sandboxed previews all swallow it
     silently. Try progressively weaker options and report which one worked. */
  function openWhatsApp(link) {
    const embedded = window.top !== window.self;

    let win = null;
    // NB: passing "noopener" in the feature string makes window.open() return
    // null by spec, which would look like a blocked pop-up. Open normally and
    // sever the opener afterwards instead.
    try { win = window.open(link, '_blank'); } catch (_) { win = null; }
    if (win) {
      try { win.opener = null; } catch (_) { /* cross-origin, fine */ }
      return 'tab';
    }

    // Pop-up refused. Inside an iframe, escape to the top window if allowed.
    if (embedded) {
      try {
        window.top.location.href = link;
        return 'top';
      } catch (_) { return 'blocked'; }
    }

    // Normal tab: same-window navigation always works and, on phones,
    // hands straight over to the installed WhatsApp app.
    try {
      window.location.assign(link);
      return 'self';
    } catch (_) { return 'blocked'; }
  }

  function showFallback(link, urgent) {
    el.waDirect.href = link;
    el.waFallback.hidden = false;
    el.waFallback.classList.toggle('is-urgent', Boolean(urgent));
    if (urgent) el.waFallback.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function copyOrderMessage() {
    const text = el.waPreview.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (__) { /* nothing else to try */ }
      ta.remove();
    }
    UI.toast('Order message copied — paste it into WhatsApp.', 'success');
  }

  function refreshWhatsApp(showErrors = false) {
    const items = Cart.getItems();
    const feeInfo = currentFee();
    const payload = {
      settings,
      items,
      customer: { name: state.name, phone: state.phone },
      delivery: {
        type: state.type,
        distanceKm: state.distanceKm,
        address: state.address,
        instructions: state.instructions,
        fee: state.type === 'pickup' ? 0 : (feeInfo.status === 'ok' ? feeInfo.fee : 0),
      },
    };
    const { message, link } = buildOrderLink(payload);
    el.waPreview.textContent = message;
    lastOrderLink = link;
    if (!el.waFallback.hidden) el.waDirect.href = link;

    const errors = validate(showErrors);
    const blocked = errors.length > 0;
    el.waBtn.setAttribute('aria-disabled', String(blocked));
    el.waBtn.classList.toggle('is-blocked', blocked);
    el.waBtn.href = blocked ? '#' : link;

    if (blocked && showErrors) {
      const reasons = {
        name: 'your name', phone: 'a valid phone number',
        address: 'a delivery address', distance: 'a distance inside our delivery zone',
      };
      el.checkoutError.innerHTML = `<div class="alert alert--error">${UI.icon('alert-circle')}<div>Please add ${errors.map((e) => reasons[e]).join(', ')} before sending your order.</div></div>`;
    } else if (!blocked) {
      el.checkoutError.innerHTML = '';
    }

    Cart.saveCheckout(state);
    return blocked;
  }

  function refreshAll(showErrors = false) {
    renderDistance();
    renderSummary();
    refreshWhatsApp(showErrors);
  }

  /* ---------- Events ---------- */
  el.name.addEventListener('input', (e) => { state.name = e.target.value; refreshWhatsApp(); });
  el.phone.addEventListener('input', (e) => { state.phone = e.target.value; refreshWhatsApp(); });
  el.address.addEventListener('input', (e) => { state.address = e.target.value; refreshWhatsApp(); });

  // only surface inline errors once a field has been visited
  [['name', el.name], ['phone', el.phone], ['address', el.address]].forEach(([field, node]) => {
    node.addEventListener('blur', () => { touched.add(field); refreshWhatsApp(); });
  });
  el.instructions.addEventListener('input', (e) => { state.instructions = e.target.value; refreshWhatsApp(); });

  document.querySelectorAll('input[name="ordertype"]').forEach((input) => {
    input.addEventListener('change', () => {
      state.type = input.value;
      const isPickup = state.type === 'pickup';
      el.pickupBlock.hidden = !isPickup;
      el.deliveryBlock.hidden = isPickup;
      refreshAll();
    });
  });

  el.range.addEventListener('input', () => {
    state.distanceKm = Number(el.range.value);
    el.distanceInput.value = state.distanceKm;
    refreshAll();
  });

  el.distanceInput.addEventListener('input', () => {
    const v = Number(el.distanceInput.value);
    if (!Number.isFinite(v) || v < 0) return;
    state.distanceKm = v;
    if (v <= Number(el.range.max)) el.range.value = String(v);
    refreshAll();
  });

  el.waBtn.addEventListener('click', (e) => {
    // Always handle the click ourselves: relying on the anchor's default
    // navigation is unreliable (pop-up blockers, in-app browsers, iframes).
    e.preventDefault();
    ['name', 'phone', 'address'].forEach((f) => touched.add(f));

    if (refreshWhatsApp(true)) {
      document.querySelector('.has-error .input, .has-error .textarea')?.focus();
      UI.toast('A few details are still missing.', 'error');
      el.checkoutError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const link = lastOrderLink || el.waBtn.href;
    const how = openWhatsApp(link);

    if (how === 'blocked') {
      showFallback(link, true);
      UI.toast('Your browser blocked the WhatsApp window — use the link below.', 'error');
      return;
    }

    UI.toast('Opening WhatsApp with your order…', 'success');
    // If we are still here a moment later, the hand-off may not have worked.
    window.setTimeout(() => { if (!document.hidden) showFallback(link, false); }, 1600);
  });

  el.waCopy.addEventListener('click', copyOrderMessage);

  document.getElementById('wa-fallback-phone').textContent =
    `Still stuck? Call or message us on ${settings.contact?.phone || ''}.`;

  document.getElementById('toggle-preview').addEventListener('click', (e) => {
    el.waPreview.hidden = !el.waPreview.hidden;
    e.target.textContent = el.waPreview.hidden ? 'Preview the message' : 'Hide the message';
  });

  Cart.subscribe(() => { UI.refreshCartBadges(); });

  // initial state
  el.pickupBlock.hidden = state.type !== 'pickup';
  el.deliveryBlock.hidden = state.type === 'pickup';
  refreshAll();
}
