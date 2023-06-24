export type BILLING_WEBHOOKS_WRAPPER_HANDLER = (
  req: Request
) => Promise<Response>;

export async function billingWebhooksWrapper(
  handler: BILLING_WEBHOOKS_WRAPPER_HANDLER
): (req: Request) => Response {
  return async function (req: Request) {
    try {
      const response = await handler(req);
      return response;
    } catch (e) {
      console.error(e);
      return new Response("error", {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  };
}
