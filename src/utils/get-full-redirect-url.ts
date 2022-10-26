export default function getFullRedirectUrl(redirectPath: string) {
  if (redirectPath.startsWith("http")) return redirectPath;
  const baseUrl = process.env.URL || window.location.origin;
  return [baseUrl, redirectPath?.replace(/^\//, "")].filter(Boolean).join("/");
}
