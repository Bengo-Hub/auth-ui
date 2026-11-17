/** Sign-in page for developer and API partner accounts. It never offers business sign-up. */
export const DEVELOPER_LOGIN_PATH = '/developer/login';

/** Where a developer requests access (there is no open developer sign-up). */
export const DEVELOPER_APPLY_PATH = '/developer/apply';

/** Where a developer lands after signing in. */
export const DEVELOPER_HOME_PATH = '/dashboard/developer';

/** Roles that make an account a developer account. Keep in step with auth-api tenantDeveloperRoles. */
const DEVELOPER_ROLES = new Set(['developer']);

/**
 * True when every role the account holds, in its active tenant and in every other membership, is
 * a developer role. Such an account has nothing on the business dashboard. An account with no
 * roles at all is not developer-only.
 */
export function isDeveloperOnly(
  activeRoles: string[] | undefined,
  tenants: Array<{ roles?: string[] }> | undefined,
): boolean {
  const all = [...(activeRoles ?? []), ...(tenants ?? []).flatMap((t) => t.roles ?? [])];
  return all.length > 0 && all.every((r) => DEVELOPER_ROLES.has(r));
}
