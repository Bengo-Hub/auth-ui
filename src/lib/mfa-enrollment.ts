/**
 * The enrolment hop. When a tenant's MFA policy covers a member who has no authenticator app,
 * sign-in returns `mfa_enrollment_required` and an enrolment-only session that opens nothing but
 * the authenticator setup. The person sets it up, is signed out, and comes back to the sign-in
 * page they started from, where they now enter the code.
 */

export const MFA_SETUP_PATH = '/dashboard/security/2fa-setup';

/**
 * Copy for the MFA policy screens, kept together because auth-ui has no translation catalogue yet
 * (nor does shared-ui-lib); when one arrives these move into it as they are.
 */
export const MFA_COPY = {
  signInAgain: 'This organisation asks for an authenticator code. Sign in again to continue.',
  enrollTitle: 'Set up your authenticator app to continue',
  enrollBody:
    'Your organisation requires a second sign-in step for your role. Set up an authenticator app now. When you finish, we sign you out so you can sign in again with its code.',
  enrollDone: 'Sign in again',
  enrolledMessage: 'Your authenticator app is set up. Sign in again and enter its code.',
  passkeyNeedsCode: 'This organisation asks for your authenticator code. Sign in with your password and the code.',
  policyTitle: 'Sign-in security',
  policyPlatformTitle: 'Platform sign-in security',
  policyPlatformBody:
    'The default for every organisation without its own rule. Members it covers must sign in with an authenticator app; covered members without one are asked to set it up first.',
  policyTenantBody: 'Members this rule covers must sign in with an authenticator app.',
  policyAllAccounts: 'Every account',
  policyAllAccountsHint: 'Require an authenticator app for every member, whatever their role.',
  policyRoles: 'Roles that must use an authenticator app',
  policyNoRoles: 'No roles to choose from yet.',
  policyInherit: 'Follow the platform default',
  policyInheritHint: 'Use the platform-wide rule instead of a rule for this organisation.',
  policyFollowing: 'Following the platform default',
  policyEffective: 'In force now',
  policyNothing: 'No second step required',
  policySaved: 'Sign-in security saved. It applies at each member\'s next sign-in.',
  policySaveFailed: 'Could not save the sign-in security rule.',
  policyLoadFailed: 'Could not load the sign-in security rule.',
  save: 'Save',
} as const;

/** The sign-in page to come back to. Only auth-ui's own /login is accepted. */
export function safeSignInNext(next: string | null | undefined): string {
  if (!next || !next.startsWith('/login') || next.startsWith('//')) return '/login';
  const rest = next.slice('/login'.length);
  if (rest !== '' && !rest.startsWith('?') && !rest.startsWith('#')) return '/login';
  return next;
}

/** The setup page in its required mode, remembering where sign-in started. */
export function mfaEnrollmentHref(next: string): string {
  return `${MFA_SETUP_PATH}?required=1&next=${encodeURIComponent(safeSignInNext(next))}`;
}

/** The sign-in page currently shown, to come back to after setup. */
export function currentSignInPath(): string {
  if (typeof window === 'undefined') return '/login';
  return safeSignInNext(window.location.pathname + window.location.search);
}

/** The sign-in page to open after setup, with a note that the authenticator is ready. */
export function signInAfterEnrollment(next: string | null | undefined, message: string): string {
  const target = safeSignInNext(next);
  const [path, query = ''] = target.split('?');
  const params = new URLSearchParams(query);
  params.delete('reason');
  params.set('message', message);
  return `${path}?${params.toString()}`;
}
