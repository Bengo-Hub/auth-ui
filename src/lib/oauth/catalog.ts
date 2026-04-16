// OAuth provider catalog — single source of truth for every identity provider
// auth-ui surfaces on the login/signup page and the admin integrations panel.
//
// Each provider declares its config fields (with placeholders and help text
// based on the vendor's documented public API), logo asset, brand colour, and
// docs link. Logos are sourced from https://simpleicons.org/ via the
// cdn.simpleicons.org delivery endpoint — no runtime SVG bundling.
//
// `id` must match `IntegrationConfig.name` on the auth-api side so the UI can
// round-trip configs through `POST /api/v1/admin/integrations` and the public
// discovery endpoint `GET /api/v1/auth/integrations/active?category=oauth`.

export type FieldType = "text" | "password" | "email" | "url";

export interface ProviderField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Secrets are masked in responses; leave blank to keep existing value. */
  secret?: boolean;
  default?: string;
  placeholder?: string;
  help?: string;
}

export interface OAuthProviderDef {
  /** Matches IntegrationConfig.name in auth-api. */
  id: string;
  /** Matches the response `category` from /auth/integrations/active. */
  category: "oauth";
  /** Display name. */
  name: string;
  /** One-line description. */
  description: string;
  /** simpleicons.org slug. */
  logoSlug: string;
  /** Hex (no #) used to tint the logo when rendered from simpleicons. */
  logoColor?: string;
  /** Brand fallback colour when logo fails to load. */
  brandColor: string;
  /** Link to the provider's console / developer portal. */
  docsUrl: string;
  /** Optional secondary link to an in-repo setup guide. */
  setupGuideUrl?: string;
  fields: ProviderField[];
}

const PROD_REDIRECT = (provider: string) =>
  `https://sso.codevertexitsolutions.com/api/v1/auth/oauth/${provider}/callback`;

export const oauthProviders: OAuthProviderDef[] = [
  {
    id: "google",
    category: "oauth",
    name: "Google",
    description: "Sign-in with Google Workspace or personal Google accounts.",
    logoSlug: "google",
    logoColor: "4285F4",
    brandColor: "#4285F4",
    docsUrl: "https://console.cloud.google.com/apis/credentials",
    setupGuideUrl:
      "https://github.com/Bengo-Hub/auth-api/blob/main/docs/oauth-setup.md#google-oauth-setup",
    fields: [
      {
        key: "client_id",
        label: "Client ID",
        type: "text",
        required: true,
        placeholder: "123456789-abc.apps.googleusercontent.com",
        help: "OAuth 2.0 client ID from Google Cloud → APIs & Services → Credentials.",
      },
      {
        key: "client_secret",
        label: "Client Secret",
        type: "password",
        required: true,
        secret: true,
        placeholder: "GOCSPX-…",
      },
      {
        key: "redirect_url",
        label: "Authorized Redirect URI",
        type: "url",
        required: true,
        default: PROD_REDIRECT("google"),
        help: "Must match the redirect URI registered in Google Cloud Console exactly.",
      },
    ],
  },
  {
    id: "microsoft",
    category: "oauth",
    name: "Microsoft",
    description:
      "Sign-in with Microsoft 365, Azure AD, or personal Microsoft accounts.",
    logoSlug: "microsoft",
    logoColor: "5E5E5E",
    brandColor: "#2F2F2F",
    docsUrl:
      "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade",
    setupGuideUrl:
      "https://github.com/Bengo-Hub/auth-api/blob/main/docs/oauth-setup.md#microsoft-oauth-setup",
    fields: [
      {
        key: "client_id",
        label: "Application (Client) ID",
        type: "text",
        required: true,
        placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      },
      {
        key: "client_secret",
        label: "Client Secret Value",
        type: "password",
        required: true,
        secret: true,
        placeholder: "Secret value from Certificates & secrets",
        help: "This is the Value column, not the Secret ID.",
      },
      {
        key: "tenant_id",
        label: "Directory (Tenant) ID",
        type: "text",
        required: true,
        default: "common",
        placeholder: "common or a specific Azure AD tenant GUID",
        help: "Use 'common' for multi-tenant + personal accounts, or a GUID to lock to one org.",
      },
      {
        key: "redirect_url",
        label: "Authorized Redirect URI",
        type: "url",
        required: true,
        default: PROD_REDIRECT("microsoft"),
      },
    ],
  },
  {
    id: "github",
    category: "oauth",
    name: "GitHub",
    description: "Sign-in with a GitHub account for developer-focused tenants.",
    logoSlug: "github",
    logoColor: "181717",
    brandColor: "#181717",
    docsUrl: "https://github.com/settings/developers",
    setupGuideUrl:
      "https://github.com/Bengo-Hub/auth-api/blob/main/docs/oauth-setup.md#github-oauth-setup",
    fields: [
      {
        key: "client_id",
        label: "Client ID",
        type: "text",
        required: true,
        placeholder: "Ov23li…",
      },
      {
        key: "client_secret",
        label: "Client Secret",
        type: "password",
        required: true,
        secret: true,
        placeholder: "Generate in Settings → Developer settings → OAuth Apps",
      },
      {
        key: "redirect_url",
        label: "Authorization Callback URL",
        type: "url",
        required: true,
        default: PROD_REDIRECT("github"),
        help: "GitHub allows only one callback URL per OAuth App — register a separate app for dev.",
      },
    ],
  },
];

export function getProviderById(id: string): OAuthProviderDef | undefined {
  return oauthProviders.find((p) => p.id === id);
}

export function logoUrl(slug: string, color?: string, size = 40): string {
  const suffix = color ? `/${color}` : "";
  return `https://cdn.simpleicons.org/${slug}${suffix}?size=${size}`;
}
