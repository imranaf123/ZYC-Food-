/* =========================================================
   pages/deals.js
   ========================================================= */

import { getDeals, getProductsByIds } from '../data-loader.js';
import * as Cart from '../cart.js';

export async function init({ settings, UI }) {
  const host = document.getElementById('deals-list');
  const deals = await getDeals();

  UI.setMeta({
    title: 'Deals & Combos — ZYC Food',
    description: 'Save with ZYC Food combo deals: burger and pizza bundles, sharing platters and weekend specials.',
    canonical: 'deals.html',
    image: settings.seoDefaults?.ogImage,
    settings,
  });

  document.getElementById('deals-breadcrumbs').innerHTML = UI.breadcrumbsHTML([
    { label: 'Home', href: 'index.html' },
    { label: 'Deals' },
  ]);

  UI.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: UI.absoluteURL(settings, 'index.html') },
      { '@type': 'ListItem', position: 2, name: 'Deals', item: UI.absoluteURL(settings, 'deals.html') },
    ],
  }, 'jsonld-breadcrumbs');

  if (!deals.length) {
    host.innerHTML = `<div class="empty-state">${UI.icon('percent')}<h3>No deals running right now</h3><p>New combos are added to <code>data/deals.json</code> all the time — check back soon.</p><a class="btn btn--primary" href="menu.html">Browse the menu</a></div>`;
    return;
  }

  const resolved = await Promise.all(deals.map(async (deal) => ({
    deal,
    included: await getProductsByIds(deal.includedProducts || []),
  })));

  host.innerHTML = resolved.map(({ deal, included }) => UI.dealCardHTML(deal, included)).join('');

  UI.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ZYC Food Deals',
    itemListElement: deals.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: d.name,
        description: d.description,
        image: UI.absoluteURL(settings, d.image),
        offers: {
          '@type': 'Offer',
          priceCurrency: settings.currency?.code || 'PKR',
          price: String(d.dealPrice),
          availability: d.availability === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          url: UI.absoluteURL(settings, 'deals.html'),
        },
      },
    })),
  }, 'jsonld-deals');

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-deal]');
    if (!btn) return;
    const entry = resolved.find(({ deal }) => deal.id === btn.dataset.addDeal);
    if (!entry) return;
    addDealToCart(entry, UI);
  });
}

export function addDealToCart({ deal, included }, UI) {
  Cart.addItem({
    type: 'deal',
    dealId: deal.id,
    name: `${deal.name} (Deal)`,
    image: deal.image,
    customizations: included.length
      ? [{ groupId: 'includes', groupLabel: 'Includes', optionId: 'includes', optionLabel: included.map((p) => p.name).join(', '), priceDelta: 0 }]
      : [],
    addOns: [],
    quantity: 1,
    unitPrice: Number(deal.dealPrice),
  });
  UI.refreshCartBadges(true);
  UI.toast(`${deal.name} added to cart`, 'success');
}
