/**
 * A platform owner's business invite (auth-api business_invite.go) is a signed token. Its middle
 * part is readable JSON; the sign-up form uses it only to prefill the email and organisation name.
 * Nothing here is trusted: auth-api checks the signature, expiry, email and single use.
 */
export interface InvitePrefill {
  email: string;
  orgName: string;
}

export function readInvitePrefill(token: string): InvitePrefill {
  const empty = { email: "", orgName: "" };
  const parts = token.split(".");
  if (parts.length !== 3 || token.length > 2048) return empty;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4)));
    if (json?.purpose !== "business_invite") return empty;
    return {
      email: typeof json.email === "string" ? json.email.slice(0, 254) : "",
      orgName: typeof json.org_name === "string" ? json.org_name.slice(0, 120) : "",
    };
  } catch {
    return empty;
  }
}
