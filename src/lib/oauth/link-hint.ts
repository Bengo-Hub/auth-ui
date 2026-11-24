import { oauthProviders } from './catalog';

/**
 * The hint under a social sign-in refusal that usually means "this provider is not linked to the
 * account you already have": the organisation refused a new account, or the provider's email is
 * already used by an account it cannot vouch for. Returns null for any other error.
 */
export function socialLinkHint(error: string | null, providerId: string | null): string | null {
  if (!error || !providerId) return null;
  const e = error.toLowerCase();
  const refused =
    e.includes('you do not have access to this organisation') || e.includes('an account with this email already exists');
  if (!refused) return null;
  const name = oauthProviders.find((p) => p.id === providerId)?.name ?? providerId;
  return `Already have an account? Sign in with your email, then link ${name} in Account settings.`;
}
