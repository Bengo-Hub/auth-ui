export interface Invitation {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  roles: string[];
  invited_at: string;
}

/** Roles in plain words: "store_manager" reads "Store manager". */
export function roleLabel(roles: string[]): string {
  if (!roles.length) return 'Member';
  return roles
    .map((r) => {
      const s = r.replace(/_/g, ' ').trim();
      return s.charAt(0).toUpperCase() + s.slice(1);
    })
    .join(', ');
}
