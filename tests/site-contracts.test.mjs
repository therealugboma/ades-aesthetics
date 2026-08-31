import test from "node:test";
import assert from "node:assert/strict";

import {
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_URL,
  SITE_URL,
  SOCIAL_LINKS,
  WHATSAPP_URL,
  WHATSAPP_PHONE_DISPLAY,
  buildWhatsAppUrl,
} from "../src/lib/site.ts";
import {
  createOwnerOrderReceipt,
  createPaymentEmailMessages,
  createPaymentReceipt,
  getPendingPaymentEmailRecipients,
} from "../src/lib/payment-receipt.ts";
import { getBusinessDateString, getMonthGrid } from "../src/lib/booking-calendar.ts";

test("production-facing links use the owned domain and business profiles", () => {
  assert.equal(SITE_URL, "https://www.adesaesthetics.store");
  assert.equal(BUSINESS_PHONE_DISPLAY, "0816 469 5802");
  assert.equal(BUSINESS_PHONE_URL, "tel:+2348164695802");
  assert.equal(WHATSAPP_URL, "https://wa.me/2348051532174");
  assert.equal(WHATSAPP_PHONE_DISPLAY, "0805 153 2174");
  assert.equal(SOCIAL_LINKS.instagram, "https://www.instagram.com/ades_aesthetics");
  assert.equal(SOCIAL_LINKS.tiktok, "https://www.tiktok.com/@ades_aesthetics");
  assert.equal(SOCIAL_LINKS.facebook, "https://facebook.com/adesaesthetics");
});

test("booking invoices contain confirmed details and the branded WhatsApp follow-up", () => {
  const receipt = createPaymentReceipt({
    reference: "BK-123",
    amount: 3600,
    metadata: {
      customerName: "Ada <Test>",
      customerEmail: "ada@example.com",
      serviceName: "Classic Lashes",
      date: "2026-09-04",
      time: "12:30",
      totalAmount: 12000,
      paymentOption: "deposit",
    },
  });

  assert.equal(receipt.to, "ada@example.com");
  assert.match(receipt.subject, /Booking invoice BK-123/);
  assert.match(receipt.html, /Ada &lt;Test&gt;/);
  assert.match(receipt.html, /0805 153 2174/);
  assert.match(receipt.html, /wa\.me\/2348051532174/);
  assert.match(receipt.html, /Balance due/);
});

test("product invoices list items and ask the customer to arrange delivery", () => {
  const receipt = createPaymentReceipt({
    reference: "ADE-123",
    amount: 10000,
    metadata: {
      customerName: "Ada",
      customerEmail: "ada@example.com",
    },
    orderProducts: [{ name: "Brow Gel", quantity: 2, price: 5000 }],
  });

  assert.match(receipt.subject, /Order invoice ADE-123/);
  assert.match(receipt.html, /Brow Gel × 2/);
  assert.match(receipt.html, /delivery option/i);
});

test("paid product orders create customer and owner invoice emails", () => {
  const input = {
    reference: "ADE-OWNER-123",
    amount: 15000,
    metadata: {
      customerName: "Ada Customer",
      customerEmail: "ada@example.com",
      customerPhone: "08012345678",
    },
    orderProducts: [{ name: "Brow Gel", quantity: 3, price: 5000 }],
  };

  const ownerReceipt = createOwnerOrderReceipt(
    input,
    "adesaesthetics@gmail.com"
  );
  assert.ok(ownerReceipt);
  assert.equal(ownerReceipt.to, "adesaesthetics@gmail.com");
  assert.match(ownerReceipt.subject, /Paid order ADE-OWNER-123/);
  assert.match(ownerReceipt.html, /Ada Customer/);
  assert.match(ownerReceipt.html, /ada@example\.com/);
  assert.match(ownerReceipt.html, /08012345678/);
  assert.match(ownerReceipt.html, /Brow Gel × 3/);

  const messages = createPaymentEmailMessages(
    input,
    "adesaesthetics@gmail.com"
  );
  assert.deepEqual(
    messages.map(({ recipient, idempotencyKey }) => ({
      recipient,
      idempotencyKey,
    })),
    [
      {
        recipient: "customer",
        idempotencyKey: "payment-receipt-ADE-OWNER-123-customer",
      },
      {
        recipient: "owner",
        idempotencyKey: "payment-receipt-ADE-OWNER-123-owner",
      },
    ]
  );
});

test("booking payments email the customer without creating an order alert", () => {
  const messages = createPaymentEmailMessages(
    {
      reference: "BK-CUSTOMER-123",
      amount: 3600,
      metadata: {
        customerName: "Ada",
        customerEmail: "ada@example.com",
        serviceName: "Classic Lashes",
        date: "2026-09-04",
        time: "12:30",
        totalAmount: 12000,
        paymentOption: "deposit",
      },
    },
    "adesaesthetics@gmail.com"
  );

  assert.equal(messages.length, 1);
  assert.equal(messages[0].recipient, "customer");
});

test("an existing order with a customer receipt still queues the missing owner invoice", () => {
  assert.deepEqual(
    getPendingPaymentEmailRecipients({
      hasOrderProducts: true,
      customerEmailSent: true,
      ownerEmailSent: false,
    }),
    { customer: false, owner: true }
  );
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
