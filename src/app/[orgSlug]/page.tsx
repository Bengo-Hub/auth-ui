import { notFound, redirect } from 'next/navigation';

// Every app's switcher/profile menu (shared-ui-lib's useVisibleServices) links to
// each service as `${base}/${orgSlug}`, so "Account Portal" lands here as
// accounts.codevertexafrica.com/<tenant-slug>. This app has no per-tenant root,
// so send it to My Organization (the dashboard layout handles the not-signed-in case).
// Static routes (/login, /dashboard, /pricing, ...) still win over this segment.
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;

export default async function OrgSlugRedirect({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  if (!SLUG_RE.test(orgSlug)) notFound();
  redirect('/dashboard/my-tenant');
}
