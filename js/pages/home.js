/* =========================================================
   pages/home.js
   ========================================================= */

import {
  getHeroSlides, getActiveCategories, getProducts, getDeals, getReviews,
  getProductsByIds, getAggregateRating,
} from '../data-loader.js';

export async function init({ settings, UI }) {
  const vis = settings.sectionVisibility || {};

  UI.setMeta({
    title: settings.seoDefaults?.siteTitle,
    description: settings.seoDefaults?.siteDescription,
    canonical: 'index.html',
    image: settings.seoDefaults?.ogImage,
    settings,
  });

  renderFeatureStrip(settings, UI);
  renderRestaurantInfo(settings, UI);

  const [slides, categories, products, deals, reviews, aggregate] = await Promise.all([
    getHeroSlides(), getActiveCategories(), getProducts(), getDeals(), getReviews(), getAggregateRating(),
  ]);

  if (vis.heroCarousel !== false) initHero(slides, UI); else hide('hero');
  if (vis.categories !== false) renderCategories(categories, UI); else hide('section-categories');
  if (vis.chefSpecials !== false) renderSpecials(products, UI); else hide('section-specials');
  if (vis.occasionPromotions !== false) await renderOccasions(products, deals, UI); else hide('section-occasions');
  if (vis.deals !== false) await renderDeals(deals, UI); else hide('section-deals');
  if (vis.reviews !== false) renderReviews(reviews, aggregate, UI); else hide('section-reviews');

  injectRestaurantSchema(settings, aggregate, UI);
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/* ---------------- Hero carousel ---------------- */
function initHero(slides, UI) {
  const viewport = document.getElementById('hero-viewport');
  const dotsHost = document.getElementById('hero-dots');
  const hero = document.getElementById('hero');
  if (!viewport || !slides.length) return;

  viewport.innerHTML = slides.map((s, i) => {
    const headline = s.headlineAccent && s.headline.includes(s.headlineAccent)
      ? `${UI.escapeHTML(s.headline.replace(s.headlineAccent, '').trim())} <span class="accent">${UI.escapeHTML(s.headlineAccent)}</span>`
      : UI.escapeHTML(s.headline);
    return `
    <div class="hero-slide${i === 0 ? ' is-active' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${slides.length}" ${i === 0 ? '' : 'aria-hidden="true"'} data-index="${i}">
      <div class="hero-slide__bg">
        <img src="${UI.escapeHTML(s.image)}" alt="" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      </div>
      <div class="container">
        <div class="hero-slide__content">
          ${s.badge?.enabled ? `<span class="badge badge--occasion hero-slide__badge">${UI.escapeHTML(s.badge.text)}</span>` : ''}
          <span class="eyebrow">${UI.escapeHTML(s.eyebrow || '')}</span>
          <h1>${headline}</h1>
          <p class="hero-slide__sub">${UI.escapeHTML(s.subtext || '')}</p>
          <div class="hero-slide__ctas">
            ${s.ctaPrimary ? `<a class="btn btn--primary btn--lg" href="${UI.escapeHTML(s.ctaPrimary.link)}">${UI.escapeHTML(s.ctaPrimary.label)} ${UI.icon('arrow-right')}</a>` : ''}
            ${s.ctaSecondary ? `<a class="btn btn--outline btn--lg" href="${UI.escapeHTML(s.ctaSecondary.link)}">${UI.escapeHTML(s.ctaSecondary.label)}</a>` : ''}
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  dotsHost.innerHTML = slides.map((s, i) =>
    `<button type="button" role="tab" aria-selected="${i === 0}" aria-label="Show slide ${i + 1}" data-dot="${i}"></button>`).join('');

  const slideEls = [...viewport.querySelectorAll('.hero-slide')];
  const dots = [...dotsHost.querySelectorAll('button')];
  let index = 0;
  let timer = null;
  const DURATION = 6500;

  function go(next) {
    index = (next + slideEls.length) % slideEls.length;
    slideEls.forEach((el, i) => {
      const active = i === index;
      el.classList.toggle('is-active', active);
      if (active) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
    });
    dots.forEach((d, i) => d.setAttribute('aria-selected', String(i === index)));
  }

  function play() {
    if (slideEls.length < 2) return;
    stop();
    timer = setInterval(() => go(index + 1), DURATION);
  }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  function interact(next) { go(next); play(); }

  dots.forEach((d, i) => d.addEventListener('click', () => interact(i)));
  document.getElementById('hero-prev')?.addEventListener('click', () => interact(index - 1));
  document.getElementById('hero-next')?.addEventListener('click', () => interact(index + 1));

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', play);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', play);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));

  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') interact(index - 1);
    if (e.key === 'ArrowRight') interact(index + 1);
  });

  // Touch swipe
  let startX = 0; let dragging = false;
  hero.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; dragging = true; stop(); }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 45) interact(index + (dx < 0 ? 1 : -1)); else play();
  });

  play();
}

/* ---------------- Feature strip ---------------- */
function renderFeatureStrip(settings, UI) {
  const host = document.getElementById('feature-strip');
  if (!host) return;
  host.innerHTML = (settings.heroFeatureStrip || []).map((f) => `
    <div class="feature-strip__item">
      ${UI.icon(f.icon)}
      <div>
        <div class="feature-strip__label">${UI.escapeHTML(f.label)}</div>
        <div class="feature-strip__sub">${UI.escapeHTML(f.sublabel)}</div>
      </div>
    </div>`).join('');
}

/* ---------------- Categories ---------------- */
function renderCategories(categories, UI) {
  const grid = document.getElementById('categories-grid');
  const scroller = document.getElementById('categories-scroller');
  if (grid) grid.innerHTML = categories.map(UI.categoryCardHTML).join('');
  if (scroller) scroller.innerHTML = categories.map(UI.categoryCircleHTML).join('');
}

/* ---------------- Chef's specials ---------------- */
function renderSpecials(products, UI) {
  const featured = products.filter((p) => p.featured);
  const grid = document.getElementById('specials-grid');
  const scroller = document.getElementById('specials-scroller');
  if (grid) grid.innerHTML = featured.map((p) => UI.productCardHTML(p)).join('');
  if (scroller) scroller.innerHTML = featured.map((p) => UI.productCardHTML(p, { horizontal: true })).join('');
}

/* ---------------- Occasion promotions (auto from badge.type) ---------------- */
async function renderOccasions(products, deals, UI) {
  const host = document.getElementById('occasion-strip');
  const section = document.getElementById('section-occasions');
  if (!host) return;

  const items = [
    ...products.filter((p) => p.badge?.enabled && p.badge.type === 'occasion').map((p) => ({
      text: p.badge.text, name: p.name, image: p.images?.[0], href: `product.html?slug=${p.slug}`,
    })),
    ...deals.filter((d) => d.badge?.enabled && d.badge.type === 'occasion').map((d) => ({
      text: d.badge.text, name: d.name, image: d.image, href: 'deals.html',
    })),
  ];

  if (!items.length) { section?.remove(); return; }

  host.innerHTML = items.map((it) => `
    <a class="occasion-item" href="${UI.escapeHTML(it.href)}">
      <img src="${UI.escapeHTML(it.image || '')}" alt="" loading="lazy" decoding="async">
      <span>
        <span class="badge badge--outline">${UI.escapeHTML(it.text)}</span>
        <span class="occasion-item__title" style="display:block;margin-top:6px">${UI.escapeHTML(it.name)}</span>
      </span>
    </a>`).join('');
}

/* ---------------- Deals ---------------- */
async function renderDeals(deals, UI) {
  const host = document.getElementById('deals-grid');
  const section = document.getElementById('section-deals');
  if (!host) return;
  const active = deals.filter((d) => d.availability !== false);
  if (!active.length) { section?.remove(); return; }

  const cards = await Promise.all(active.map(async (deal) => {
    const included = await getProductsByIds(deal.includedProducts || []);
    return UI.dealCardHTML(deal, included);
  }));
  host.innerHTML = cards.join('');
}

/* ---------------- Reviews ---------------- */
function renderReviews(reviews, aggregate, UI) {
  const host = document.getElementById('reviews-grid');
  const summary = document.getElementById('reviews-summary-line');
  if (!host) return;
  const active = reviews.filter((r) => r.active !== false)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  host.innerHTML = active.map(UI.reviewCardHTML).join('');
  if (summary) {
    summary.innerHTML = `${UI.starsHTML(aggregate.average)} <span>${aggregate.average} average from ${aggregate.count} customer reviews</span>`;
  }
}

/* ---------------- Restaurant info ---------------- */
function renderRestaurantInfo(settings, UI) {
  const hours = document.getElementById('info-hours');
  const address = document.getElementById('info-address');
  const status = document.getElementById('info-status');
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];

  if (hours) {
    hours.innerHTML = (settings.openingHours || []).map((h) => `
      <li class="${h.day === today ? 'is-today' : ''}">
        <span class="day">${UI.escapeHTML(h.day)}</span>
        <span class="time">${UI.escapeHTML(h.open)} – ${UI.escapeHTML(h.close)}</span>
      </li>`).join('');
  }
  if (address) {
    address.innerHTML = `
      <li>${UI.icon('map-pin')}<span>${UI.escapeHTML(settings.contact?.address || '')}</span></li>
      <li>${UI.icon('phone')}<a href="${UI.telHref(settings.contact?.phone || '')}">${UI.escapeHTML(settings.contact?.phone || '')}</a></li>
      <li>${UI.icon('mail')}<a href="mailto:${UI.escapeHTML(settings.contact?.email || '')}">${UI.escapeHTML(settings.contact?.email || '')}</a></li>`;
  }
  if (status) {
    const { open, entry } = UI.isOpenNow(settings.openingHours || []);
    status.className = `open-pill${open ? '' : ' is-closed'}`;
    status.innerHTML = `<span class="dot"></span>${open ? `Open now · closes ${entry?.close}` : 'Closed right now'}`;
  }
}

/* ---------------- Schema.org Restaurant ---------------- */
function injectRestaurantSchema(settings, aggregate, UI) {
  const dayMap = {
    Monday: 'Mo', Tuesday: 'Tu', Wednesday: 'We', Thursday: 'Th', Friday: 'Fr', Saturday: 'Sa', Sunday: 'Su',
  };
  UI.injectJSONLD({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: settings.restaurantName,
    description: settings.seoDefaults?.siteDescription,
    image: UI.absoluteURL(settings, settings.seoDefaults?.ogImage),
    url: UI.absoluteURL(settings, ''),
    telephone: settings.contact?.phone,
    email: settings.contact?.email,
    priceRange: 'Rs. 449 – Rs. 2,199',
    servesCuisine: ['Burgers', 'Pizza', 'BBQ', 'Fast Food'],
    address: { '@type': 'PostalAddress', streetAddress: settings.contact?.address },
    openingHoursSpecification: (settings.openingHours || []).map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dayMap[h.day] || h.day,
      opens: h.open,
      closes: h.close,
    })),
    aggregateRating: aggregate.count ? {
      '@type': 'AggregateRating',
      ratingValue: aggregate.average,
      reviewCount: aggregate.count,
    } : undefined,
    potentialAction: {
      '@type': 'OrderAction',
      target: UI.absoluteURL(settings, 'menu.html'),
    },
  }, 'jsonld-restaurant');
}
