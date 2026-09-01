/* =========================================================
   delivery.js — distance based delivery fee logic
   Ranges come from data/delivery.json. Nothing hard-coded.
   ========================================================= */

import { getDelivery } from './data-loader.js';

/**
 * Resolve the fee for a distance in km.
 * Returns { status: 'ok'|'out-of-range'|'invalid', fee, range, maxRange }
 */
export function resolveFee(distanceKm, deliveryConfig) {
  const ranges = (deliveryConfig?.distanceRanges || [])
    .slice()
    .sort((a, b) => a.minKm - b.minKm);

  if (!ranges.length) return { status: 'invalid', fee: null, range: null, maxRange: null };

  const maxRange = ranges[ranges.length - 1];
  const km = Number(distanceKm);

  if (!Number.isFinite(km) || km < 0) {
    return { status: 'invalid', fee: null, range: null, maxRange };
  }

  // minKm <= distance < maxKm, with the final bracket inclusive of its maxKm
  for (let i = 0; i < ranges.length; i += 1) {
    const r = ranges[i];
    const isLast = i === ranges.length - 1;
    const withinUpper = isLast ? km <= r.maxKm : km < r.maxKm;
    if (km >= r.minKm && withinUpper) {
      return { status: 'ok', fee: r.fee, range: r, maxRange };
    }
  }

  return { status: 'out-of-range', fee: null, range: null, maxRange };
}

/** Async convenience wrapper that loads the config itself. */
export async function getFeeForDistance(distanceKm) {
  const config = await getDelivery();
  return resolveFee(distanceKm, config);
}

export function outOfRangeMessage(maxRange) {
  const max = maxRange ? maxRange.maxKm : '';
  return `Delivery not available beyond ${max} km for this demo — please choose Pickup or contact us on WhatsApp.`;
}

export { getDelivery };
