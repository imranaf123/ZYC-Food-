/* =========================================================
   cart.js — cart state + pricing logic (localStorage backed)
   ========================================================= */

const STORAGE_KEY = 'zyc:cart:v1';
const listeners = new Set();

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (_) { /* ignore */ }
  listeners.forEach((fn) => fn(items));
}

let state = read();

// keep multiple tabs in sync
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    state = read();
    listeners.forEach((fn) => fn(state));
  }
});

/* ---------- Pricing ---------- */

/**
 * Unit price = base/size price + customization deltas + add-ons
 */
export function computeUnitPrice({ basePrice, sizePrice, customizations = [], addOns = [] }) {
  const base = Number(sizePrice ?? basePrice ?? 0);
  const deltas = customizations.reduce((sum, c) => sum + Number(c.priceDelta || 0), 0);
  const extras = addOns.reduce((sum, a) => sum + Number(a.price || 0), 0);
  return base + deltas + extras;
}

export function lineTotal(item) {
  return Number(item.unitPrice || 0) * Number(item.quantity || 1);
}

export function subtotal(items = state) {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function count(items = state) {
  return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

/* ---------- Item identity ---------- */

function signature(item) {
  const cust = (item.customizations || []).map((c) => `${c.groupId}:${c.optionId}`).sort().join('|');
  const adds = (item.addOns || []).map((a) => a.id).sort().join('|');
  return [item.type || 'product', item.productId || item.dealId, item.sizeId || '-', cust, adds, (item.notes || '').trim()].join('::');
}

/* ---------- Public API ---------- */

export function getItems() {
  return state.slice();
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

/**
 * Add a product to the cart.
 * item: { type, productId, dealId, slug, name, image, sizeId, sizeLabel,
 *         customizations:[{groupId,groupLabel,optionId,optionLabel,priceDelta}],
 *         addOns:[{id,label,price}], quantity, unitPrice, notes }
 */
export function addItem(item) {
  const entry = {
    type: item.type || 'product',
    productId: item.productId || null,
    dealId: item.dealId || null,
    slug: item.slug || null,
    name: item.name,
    image: item.image || '',
    sizeId: item.sizeId || null,
    sizeLabel: item.sizeLabel || null,
    customizations: item.customizations || [],
    addOns: item.addOns || [],
    quantity: Math.max(1, Number(item.quantity || 1)),
    unitPrice: Number(item.unitPrice || 0),
    notes: item.notes || '',
  };
  entry.key = signature(entry);

  const items = read();
  const existing = items.find((i) => i.key === entry.key);
  if (existing) {
    existing.quantity += entry.quantity;
  } else {
    items.push(entry);
  }
  state = items;
  write(items);
  return entry;
}

export function updateQuantity(key, quantity) {
  const items = read();
  const item = items.find((i) => i.key === key);
  if (!item) return;
  const q = Number(quantity);
  if (q <= 0) {
    state = items.filter((i) => i.key !== key);
  } else {
    item.quantity = Math.min(99, q);
    state = items;
  }
  write(state);
}

export function removeItem(key) {
  state = read().filter((i) => i.key !== key);
  write(state);
}

export function clear() {
  state = [];
  write(state);
}

/* ---------- Checkout details persistence ---------- */

const CHECKOUT_KEY = 'zyc:checkout:v1';

export function saveCheckout(details) {
  try { localStorage.setItem(CHECKOUT_KEY, JSON.stringify(details)); } catch (_) { /* ignore */ }
}

export function loadCheckout() {
  try {
    const raw = localStorage.getItem(CHECKOUT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}
