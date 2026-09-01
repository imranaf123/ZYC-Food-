/* =========================================================
   pages/menu.js — category filter + search over products.json
   ========================================================= */

import { getActiveCategories, getProducts } from '../data-loader.js';

export async function init({ settings, UI }) {
  const [categories, products] = await Promise.all([getActiveCategories(), getProducts()]);

  const tabsHost = document.getElementById('category-tabs');
  const grid = document.getElementById('menu-grid');
  const countEl = document.getElementById('menu-count');
  const searchInput = document.getElementById('menu-search-input');
  const emptyHost = document.getElementById('menu-empty');

  let activeCategory = UI.qs('category') || 'all';
  let query = UI.qs('q') || '';
  if (searchInput) searchInput.value = query;

  UI.setMeta({
    title: 'Menu — Burgers, Pizza, BBQ & Wraps | ZYC Food',
    description: 'Browse the full ZYC Food menu: signature burgers, wood-fired pizza, charcoal BBQ platters, wraps, drinks and desserts.',
    canonical: 'menu.html',
    image: settings.seoDefaults?.ogImage,
    settings,
  });

  document.getElementById('menu-breadcrumbs').innerHTML = UI.breadcrumbsHTML([
    { label: 'Home', href: 'index.html' },
    { label: 'Menu' },
  ]);

  UI.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: UI.absoluteURL(settings, 'index.html') },
      { '@type': 'ListItem', position: 2, name: 'Menu', item: UI.absoluteURL(settings, 'menu.html') },
    ],
  }, 'jsonld-breadcrumbs');

  UI.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ZYC Food Menu',
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: UI.absoluteURL(settings, `product.html?slug=${p.slug}`),
    })),
  }, 'jsonld-itemlist');

  tabsHost.innerHTML = [{ slug: 'all', name: 'All Items' }, ...categories]
    .map((c) => `<button class="tab" type="button" role="tab" data-category="${UI.escapeHTML(c.slug)}" aria-selected="${c.slug === activeCategory}">${UI.escapeHTML(c.name)}</button>`)
    .join('');

  function render() {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.category === activeCategory;
      const matchesQuery = !q
        || p.name.toLowerCase().includes(q)
        || p.description.toLowerCase().includes(q)
        || (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });

    grid.innerHTML = list.map((p) => UI.productCardHTML(p)).join('');
    const catName = activeCategory === 'all'
      ? 'the full menu'
      : (categories.find((c) => c.slug === activeCategory)?.name || activeCategory);
    countEl.textContent = `${list.length} item${list.length === 1 ? '' : 's'} in ${catName}${q ? ` matching “${query}”` : ''}`;

    emptyHost.innerHTML = list.length ? '' : `
      <div class="empty-state">
        ${UI.icon('search')}
        <h3>Nothing matched that search</h3>
        <p>Try a different category or keyword — for example “burger”, “pizza” or “bbq”.</p>
        <button class="btn btn--ghost btn--sm" type="button" data-reset-filters>Reset filters</button>
      </div>`;

    tabsHost.querySelectorAll('.tab').forEach((t) =>
      t.setAttribute('aria-selected', String(t.dataset.category === activeCategory)));

    const url = new URL(window.location.href);
    if (activeCategory === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', activeCategory);
    if (!query) url.searchParams.delete('q'); else url.searchParams.set('q', query);
    window.history.replaceState({}, '', url);
  }

  tabsHost.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-category]');
    if (!tab) return;
    activeCategory = tab.dataset.category;
    render();
  });

  let debounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { query = searchInput.value; render(); }, 160);
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-reset-filters]')) {
      activeCategory = 'all';
      query = '';
      if (searchInput) searchInput.value = '';
      render();
    }
  });

  render();
}
