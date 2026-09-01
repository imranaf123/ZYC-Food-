/* =========================================================
   whatsapp.js — builds the WhatsApp order message + wa.me link
   Number always comes from settings.json.
   ========================================================= */

import { lineTotal, subtotal } from './cart.js';

function money(symbol, value) {
  return `${symbol} ${Number(value || 0).toLocaleString('en-US')}`;
}

/**
 * Build the plain-text order message from live state.
 * @param {object} p
 * @param {object} p.settings settings.json
 * @param {array}  p.items cart items
 * @param {object} p.customer { name, phone }
 * @param {object} p.delivery { type:'delivery'|'pickup', distanceKm, address, instructions, fee }
 */
export function buildOrderMessage({ settings, items, customer, delivery }) {
  const symbol = settings?.currency?.symbol || 'Rs.';
  const name = settings?.restaurantName || 'the restaurant';
  const lines = [];

  lines.push(`Hello ${name}! I'd like to place an order:`);
  lines.push('');
  lines.push(`*Customer:* ${customer?.name || '-'}`);
  lines.push(`*Phone:* ${customer?.phone || '-'}`);

  if (delivery?.type === 'pickup') {
    lines.push('*Order Type:* Pickup');
    if (settings?.contact?.address) lines.push(`*Pickup From:* ${settings.contact.address}`);
  } else {
    const km = delivery?.distanceKm;
    lines.push(`*Order Type:* Delivery${km || km === 0 ? ` (${km} km)` : ''}`);
    if (delivery?.address) lines.push(`*Address:* ${delivery.address}`);
  }

  lines.push('');
  lines.push('*Items:*');

  items.forEach((item) => {
    const sizePart = item.sizeLabel ? ` (${item.sizeLabel})` : '';
    lines.push(`${item.quantity}x ${item.name}${sizePart}`);

    (item.customizations || []).forEach((c) => {
      lines.push(`   ${c.groupLabel}: ${c.optionLabel}${c.priceDelta ? ` (+ ${money(symbol, c.priceDelta)})` : ''}`);
    });

    if ((item.addOns || []).length) {
      lines.push(`   ${item.addOns.map((a) => `+ ${a.label}`).join(', ')}`);
    }

    if (item.notes) lines.push(`   Note: ${item.notes}`);

    lines.push(`   ${money(symbol, lineTotal(item))}`);
  });

  const sub = subtotal(items);
  const fee = delivery?.type === 'pickup' ? 0 : Number(delivery?.fee || 0);

  lines.push('');
  lines.push(`*Subtotal:* ${money(symbol, sub)}`);
  lines.push(`*Delivery Fee:* ${delivery?.type === 'pickup' ? 'Pickup — no fee' : money(symbol, fee)}`);
  lines.push(`*Total:* ${money(symbol, sub + fee)}`);

  if (delivery?.instructions) {
    lines.push('');
    lines.push(`*Notes:* ${delivery.instructions}`);
  }

  lines.push('');
  lines.push('Thank you!');

  return lines.join('\n');
}

/** Normalise the number from settings into wa.me digits */
export function normaliseNumber(raw) {
  return String(raw || '').replace(/[^\d]/g, '');
}

export function buildWhatsAppLink({ settings, message }) {
  const number = normaliseNumber(settings?.contact?.whatsappNumber);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** One-shot helper: state in, link out. */
export function buildOrderLink(payload) {
  const message = buildOrderMessage(payload);
  return { message, link: buildWhatsAppLink({ settings: payload.settings, message }) };
}

/** Simple enquiry link (used by header / contact page). */
export function buildEnquiryLink(settings, text) {
  const message = text || `Hello ${settings?.restaurantName || ''}! I'd like to ask about your menu.`;
  return buildWhatsAppLink({ settings, message });
}
