import test from "node:test";
import assert from "node:assert/strict";

import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_URL,
  SITE_URL,
  SOCIAL_LINKS,
  WHATSAPP_URL,
  buildWhatsAppUrl,
} from "../src/lib/site.ts";
import { getBusinessDateString, getMonthGrid } from "../src/lib/booking-calendar.ts";

test("production-facing links use the owned domain and business profiles", () => {
  assert.equal(SITE_URL, "https://www.adesaesthetics.store");
  assert.equal(BUSINESS_PHONE_DISPLAY, "0816 469 5802");
  assert.equal(BUSINESS_PHONE_URL, "tel:+2348164695802");
  assert.equal(WHATSAPP_URL, "https://wa.me/2348051532174");
  assert.equal(SOCIAL_LINKS.instagram, "https://www.instagram.com/ades_aesthetics");
  assert.equal(SOCIAL_LINKS.tiktok, "https://www.tiktok.com/@ades_aesthetics");
  assert.equal(SOCIAL_LINKS.facebook, "https://facebook.com/adesaesthetics");
});

test("delivery WhatsApp links safely include verified order details", () => {
  const url = new URL(buildWhatsAppUrl("Order ADE-123\nCuticle Oil x2"));
  assert.equal(`${url.origin}${url.pathname}`, WHATSAPP_URL);
  assert.equal(url.searchParams.get("text"), "Order ADE-123\nCuticle Oil x2");
});

test("the booking calendar uses Lagos time and supports future months", () => {
  const nearMidnightUtc = new Date("2026-08-30T23:30:00.000Z");
  assert.equal(getBusinessDateString(nearMidnightUtc), "2026-08-31");

  const january2028 = getMonthGrid(2028, 0);
  assert.equal(january2028.label, "January 2028");
  assert.equal(january2028.days.filter(Boolean).length, 31);
});
