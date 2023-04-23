import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";

const stripeClient = new Stripe(Deno.env.get("STRIPE_API_KEY") as string, {
  // This is needed to use the Fetch API rather than relying on the Node http
  // package.
  apiVersion: "2022-08-01",
  httpClient: Stripe.createFetchHttpClient(),
});
// This is needed in order to use the Web Crypto API in Deno.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

export default stripeClient;
export { cryptoProvider };
