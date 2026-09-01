/* =========================================================
   pages/notfound.js
   ========================================================= */

import { getProducts } from '../data-loader.js';

export async function init({ settings, UI }) {
  UI.setMeta({
    title: 'Page not found — ZYC Food',
    description: 'That page could not be found. Head back to the ZYC Food menu.',
    canonical: '404.html',
    settings,
  });

  const host = document.getElementById('notfound-suggestions');
  if (!host) return;
  const products = await getProducts();
  host.innerHTML = products.filter((p) => p.popular || p.featured).slice(0, 4)
    .map((p) => UI.productCardHTML(p)).join('');
}
