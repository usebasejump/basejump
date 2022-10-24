import { stripe } from "@/utils/admin/stripe";
import {
  upsertPriceRecord,
  upsertProductRecord,
} from "@/utils/admin/stripe-billing-helpers";

// check if stripe key is set, exit if not
if (!process.env.STRIPE_SECRET_KEY) {
  console.log("No Stripe key found, skipping sync");
  process.exit(0);
}

// first we pull all products from Stripe and insert them into the billing_products table
stripe.products
  .list()
  .then(async (products) => {
    for (const product of products.data) {
      await upsertProductRecord(product);
    }
  })
  .catch((e) => {
    console.log(e);
  });

// then we pull all prices from Stripe and insert them into the billing_prices table
stripe.prices
  .list()
  .then(async (prices) => {
    for (const price of prices.data) {
      await upsertPriceRecord(price);
    }
  })
  .catch((e) => {
    console.log(e);
  });
