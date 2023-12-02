export default async function getPlans(stripeClient) {
  const prices = await stripeClient.prices.list({
    expand: ["data.product"],
  });

  return prices?.data?.map((price: Stripe.Price) => {
    return {
      product_name: price.product.name,
      product_description: price.product.description,
      currency: price.currency,
      price: price.unit_amount,
      id: price.id,
      interval:
        price.type === "one_time" ? "one_time" : price.recurring?.interval,
    };
  });
}
