/**
 * Official OAuth provider logos as inline SVG components.
 *
 * Sources (all permitted for "Sign in with …" buttons under each vendor's brand guidelines):
 * - Google: multi-colour "G" per https://developers.google.com/identity/branding-guidelines
 * - Microsoft: four-quadrant Windows/Office mark per https://learn.microsoft.com/en-us/entra/identity-platform/howto-add-branding-in-apps
 * - GitHub: Octocat monocolor mark per https://github.com/logos (the "Sign in with GitHub" button)
 *
 * Inline SVGs (vs. external CDN) guarantee the logos render even when a CDN
 * (e.g. simpleicons.org) is blocked by a corporate proxy or returns a
 * monochrome rendering that doesn't match the provider's brand guidance.
 */

export type OfficialLogoProps = {
  size?: number;
  className?: string;
};

export function GoogleOfficialLogo({ size = 20, className }: OfficialLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-label="Google"
      role="img"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function MicrosoftOfficialLogo({ size = 20, className }: OfficialLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-label="Microsoft"
      role="img"
    >
      <path fill="#F25022" d="M0 0h11.377v11.372H0V0z" />
      <path fill="#7FBA00" d="M12.623 0H24v11.372H12.623V0z" />
      <path fill="#00A4EF" d="M0 12.623h11.377V24H0V12.623z" />
      <path fill="#FFB900" d="M12.623 12.623H24V24H12.623V12.623z" />
    </svg>
  );
}

export function GitHubOfficialLogo({ size = 20, className }: OfficialLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-label="GitHub"
      role="img"
    >
      <path
        fill="currentColor"
        d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
      />
    </svg>
  );
}

export function TikTokOfficialLogo({ size = 20, className }: OfficialLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-label="TikTok"
      role="img"
    >
      <path
        fill="currentColor"
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      />
    </svg>
  );
}

/**
 * Render the official logo for a given catalog provider id. Returns null for
 * unknown ids so callers fall back to initials / a generic badge.
 */
export function OfficialProviderLogo({
  id,
  size = 20,
  className,
}: { id: string } & OfficialLogoProps) {
  switch (id) {
    case 'google':
      return <GoogleOfficialLogo size={size} className={className} />;
    case 'microsoft':
      return <MicrosoftOfficialLogo size={size} className={className} />;
    case 'github':
      return (
        <GitHubOfficialLogo
          size={size}
          className={`text-slate-900 dark:text-white ${className ?? ''}`}
        />
      );
    case 'tiktok':
      return (
        <TikTokOfficialLogo
          size={size}
          className={`text-black dark:text-white ${className ?? ''}`}
        />
      );
    default:
      return null;
  }
}
