/* =========================================================
   pages/orders.js — "How ordering works" (the Orders tab)
   ========================================================= */

import { buildEnquiryLink } from '../whatsapp.js';

export async function init({ settings, UI }) {
  UI.setMeta({
    title: 'How Ordering Works — ZYC Food',
    description: 'How to order from ZYC Food: build your order online, choose delivery or pickup, and confirm on WhatsApp in seconds.',
    canonical: 'how-ordering-works.html',
    settings,
  });

  const waBtn = document.getElementById('orders-whatsapp');
  if (waBtn) waBtn.href = buildEnquiryLink(settings, `Hello ${settings.restaurantName}! I'd like to check on my order.`);

  const phone = document.getElementById('orders-phone');
  if (phone) {
    phone.innerHTML = `${UI.icon('phone')} <a href="${UI.telHref(settings.contact?.phone || '')}">${UI.escapeHTML(settings.contact?.phone || '')}</a>`;
  }
}
