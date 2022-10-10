export default function getInvitationUrl(invitationToken: string) {
  const baseUrl =
    process.env.URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    window.location.origin;
  return `${baseUrl}/invitation?token=${invitationToken}`;
}
