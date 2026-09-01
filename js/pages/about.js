/* =========================================================
   pages/about.js
   ========================================================= */

export async function init({ settings, UI }) {
  UI.setMeta({
    title: `About ${settings.restaurantName} — Our Story, Hours & Address`,
    description: `Meet the kitchen behind ${settings.restaurantName}: how we cook, where to find us, and when we're open.`,
    canonical: 'about.html',
    settings,
  });

  const copy = document.getElementById('about-copy');
  const stats = document.getElementById('about-stats');
  const hours = document.getElementById('about-hours');
  const contact = document.getElementById('about-contact');
  const status = document.getElementById('about-status');
  const heading = document.getElementById('about-heading');

  if (heading) heading.textContent = settings.about?.heading || 'Our story';
  if (copy) copy.innerHTML = (settings.about?.story || []).map((p) => `<p>${UI.escapeHTML(p)}</p>`).join('');
  if (stats) {
    stats.innerHTML = (settings.about?.stats || []).map((s) => `
      <div class="stat-card"><div class="num">${UI.escapeHTML(s.value)}</div><div class="lbl">${UI.escapeHTML(s.label)}</div></div>`).join('');
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = dayNames[new Date().getDay()];
  if (hours) {
    hours.innerHTML = (settings.openingHours || []).map((h) => `
      <li class="${h.day === today ? 'is-today' : ''}">
        <span class="day">${UI.escapeHTML(h.day)}</span>
        <span class="time">${UI.escapeHTML(h.open)} – ${UI.escapeHTML(h.close)}</span>
      </li>`).join('');
  }
  if (contact) {
    contact.innerHTML = `
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
