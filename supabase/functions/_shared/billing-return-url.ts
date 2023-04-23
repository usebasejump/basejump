export default function billingReturnUrl(redirectPath: string) {
  if (redirectPath.startsWith("http")) return redirectPath;
  const baseUrl = Deno.env.get("BILLING_RETURN_URL_BASE") as string;
  return [baseUrl, redirectPath?.replace(/^\//, "")].filter(Boolean).join("/");
}
