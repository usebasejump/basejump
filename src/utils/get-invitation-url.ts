export default function getInvitationUrl(invitationToken: string) {
  const baseUrl = process.env.URL || window.location.origin;
  return `${baseUrl}/invitation?token=${invitationToken}`;
}
