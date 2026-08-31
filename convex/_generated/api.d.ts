/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as appointments from "../appointments.js";
import type * as auth from "../auth.js";
import type * as availability from "../availability.js";
import type * as blockedTimes from "../blockedTimes.js";
import type * as contactMessages from "../contactMessages.js";
import type * as customers from "../customers.js";
import type * as gallery from "../gallery.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as lib_booking from "../lib/booking.js";
import type * as lib_order from "../lib/order.js";
import type * as lib_payment from "../lib/payment.js";
import type * as orders from "../orders.js";
import type * as password from "../password.js";
import type * as payments from "../payments.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as services from "../services.js";
import type * as settings from "../settings.js";
import type * as upload from "../upload.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  appointments: typeof appointments;
  auth: typeof auth;
  availability: typeof availability;
  blockedTimes: typeof blockedTimes;
  contactMessages: typeof contactMessages;
  customers: typeof customers;
  gallery: typeof gallery;
  helpers: typeof helpers;
  http: typeof http;
  "lib/booking": typeof lib_booking;
  "lib/order": typeof lib_order;
  "lib/payment": typeof lib_payment;
  orders: typeof orders;
  password: typeof password;
  payments: typeof payments;
  products: typeof products;
  seed: typeof seed;
  services: typeof services;
  settings: typeof settings;
  upload: typeof upload;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
