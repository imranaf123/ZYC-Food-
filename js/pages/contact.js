/* =========================================================
   pages/contact.js
   ========================================================= */

import { buildEnquiryLink } from '../whatsapp.js';

export async function init({ settings, UI }) {
  UI.setMeta({
    title: `Contact ${settings.restaurantName} — Phone, WhatsApp & Address`,
    description: `Get in touch with ${settings.restaurantName}: call, WhatsApp, email or visit us at ${settings.contact?.address || ''}.`,
    canonical: 'contact.html',
    settings,
  });

  const tiles = document.getElementById('contact-tiles');
  if (tiles) {
    tiles.innerHTML = `
      <div class="contact-tile">${UI.icon('phone')}<div><h3>Call us</h3><a href="${UI.telHref(settings.contact?.phone || '')}">${UI.escapeHTML(settings.contact?.phone || '')}</a></div></div>
      <div class="contact-tile">${UI.icon('message-circle')}<div><h3>WhatsApp</h3><a href="${buildEnquiryLink(settings)}" target="_blank" rel="noopener">${UI.escapeHTML(settings.contact?.whatsappNumber || '')}</a><p class="tiny">Fastest way to order or ask a question.</p></div></div>
      <div class="contact-tile">${UI.icon('mail')}<div><h3>Email</h3><a href="mailto:${UI.escapeHTML(settings.contact?.email || '')}">${UI.escapeHTML(settings.contact?.email || '')}</a></div></div>
      <div class="contact-tile">${UI.icon('map-pin')}<div><h3>Visit</h3><p>${UI.escapeHTML(settings.contact?.address || '')}</p></div></div>`;
  }

  const hours = document.getElementById('contact-hours');
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  if (hours) {
    hours.innerHTML = (settings.openingHours || []).map((h) => `
      <li class="${h.day === today ? 'is-today' : ''}">
        <span class="day">${UI.escapeHTML(h.day)}</span>
        <span class="time">${UI.escapeHTML(h.open)} – ${UI.escapeHTML(h.close)}</span>
      </li>`).join('');
  }

  /* ---- Message form: no backend, opens the visitor's mail client ---- */
  const form = document.getElementById('contact-form');
  const note = document.getElementById('contact-form-note');
  if (note) {
    note.innerHTML = `${UI.icon('info')}<div>This demo has no backend. Submitting opens your email app with the message pre-filled — connect a form service (Formspree, Netlify Forms, etc.) to receive messages automatically.</div>`;
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    let valid = true;
    [['field-contact-name', name], ['field-contact-email', /.+@.+\..+/.test(email)], ['field-contact-message', message]]
      .forEach(([id, ok]) => {
        const bad = !ok;
        document.getElementById(id)?.classList.toggle('has-error', bad);
        if (bad) valid = false;
      });

    if (!valid) {
      UI.toast('Please complete the form before sending.', 'error');
      return;
    }

    const subject = encodeURIComponent(`Website enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
    window.location.href = `mailto:${settings.contact?.email}?subject=${subject}&body=${body}`;
    UI.toast('Opening your email app…', 'success');
  });

  const waBtn = document.getElementById('contact-whatsapp');
  if (waBtn) waBtn.href = buildEnquiryLink(settings);
}
