/* =========================================================
   data-loader.js — fetch + cache the /data JSON files
   All restaurant content in this site comes from here.
   ========================================================= */

const memory = new Map();
const inflight = new Map();
const CACHE_PREFIX = 'zyc:data:';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes of session cache

function readSession(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed.t > CACHE_TTL) return null;
    return parsed.v;
  } catch (_) {
    return null;
  }
}

function writeSession(key, value) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch (_) {
    /* storage full / disabled — non fatal */
  }
}

/**
 * Load a JSON file from /data.
 * @param {string} name file name without extension, e.g. "products"
 */
export function loadJSON(name) {
  if (memory.has(name)) return Promise.resolve(memory.get(name));
  if (inflight.has(name)) return inflight.get(name);

  const cached = readSession(name);
  if (cached) {
    memory.set(name, cached);
    return Promise.resolve(cached);
  }

  const req = fetch(`data/${name}.json`, { cache: 'no-cache' })
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load data/${name}.json (${res.status})`);
      return res.json();
    })
    .then((json) => {
      memory.set(name, json);
      writeSession(name, json);
      inflight.delete(name);
      return json;
    })
    .catch((err) => {
      inflight.delete(name);
      console.error('[data-loader]', err);
      throw err;
    });

  inflight.set(name, req);
  return req;
}

/** Load several files at once: loadAll('settings','products') */
export function loadAll(...names) {
  return Promise.all(names.map(loadJSON)).then((results) => {
    const out = {};
    names.forEach((n, i) => { out[camel(n)] = results[i]; });
    return out;
  });
}

function camel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/* ---------- Convenience selectors ---------- */

export const getSettings = () => loadJSON('settings');
export const getProducts = () => loadJSON('products');
export const getCategories = () => loadJSON('categories');
export const getCustomizationGroups = () => loadJSON('customization-groups');
export const getDeals = () => loadJSON('deals');
export const getReviews = () => loadJSON('reviews');
export const getDelivery = () => loadJSON('delivery');
export const getHeroSlides = () => loadJSON('hero-slides');

export async function getProductBySlug(slug) {
  const products = await getProducts();
  return products.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function getProductsByIds(ids = []) {
  const products = await getProducts();
  return ids.map((id) => products.find((p) => p.id === id || p.slug === id)).filter(Boolean);
}

export async function getActiveCategories() {
  const cats = await getCategories();
  return cats.filter((c) => c.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getDealById(id) {
  const deals = await getDeals();
  return deals.find((d) => d.id === id) || null;
}

/** Resolve a product's customization group ids against customization-groups.json */
export async function resolveCustomizationGroups(product) {
  if (!product || !Array.isArray(product.customizationGroups) || !product.customizationGroups.length) return [];
  const groups = await getCustomizationGroups();
  return product.customizationGroups
    .map((id) => groups.find((g) => g.id === id))
    .filter(Boolean);
}

/** Aggregate rating computed from reviews.json (never hard-coded) */
export async function getAggregateRating() {
  const reviews = (await getReviews()).filter((r) => r.active !== false);
  if (!reviews.length) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
