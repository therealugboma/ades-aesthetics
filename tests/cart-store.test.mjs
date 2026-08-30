import test from "node:test";
import assert from "node:assert/strict";

import { useCartStore } from "../src/lib/cart-store.ts";

const product = {
  productId: "product-1",
  name: "Cuticle Oil",
  slug: "cuticle-oil",
  price: 1000,
  imageUrl: "/cuticle-oil.jpg",
  stock: 10,
};

test("adding a selected product quantity preserves the customer's choice", () => {
  useCartStore.setState({ items: [] });

  useCartStore.getState().addItem(product, 3);
  assert.equal(useCartStore.getState().items[0].quantity, 3);

  useCartStore.getState().addItem(product, 4);
  assert.equal(useCartStore.getState().items[0].quantity, 7);
});

test("adding products never exceeds current stock", () => {
  useCartStore.setState({ items: [] });
  useCartStore.getState().addItem(product, 30);
  assert.equal(useCartStore.getState().items[0].quantity, product.stock);
});
