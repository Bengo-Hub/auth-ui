import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { authorizedTenant, canAccessTenant } from './session';

const T1 = '11111111-1111-4111-8111-111111111111';
const T2 = '22222222-2222-4222-8222-222222222222';

describe('canAccessTenant', () => {
  it('allows members and platform owners only', () => {
    expect(canAccessTenant({ id: 'u', tenants: [{ id: T1 }] }, T1)).toBe(true);
    expect(canAccessTenant({ id: 'u', tenant: { id: T1 } }, T1)).toBe(true);
    expect(canAccessTenant({ id: 'u', tenants: [{ id: T1 }] }, T2)).toBe(false);
    expect(canAccessTenant({ id: 'u', is_platform_owner: true }, T2)).toBe(true);
  });
});

describe('authorizedTenant', () => {
  it('rejects a tenant_id that is not a UUID before calling auth-api', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await authorizedTenant(new NextRequest(`http://x/api/subscriptions?tenant_id=${encodeURIComponent('../../admin')}`));
    expect('error' in res && res.error.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('rejects a caller with no session', async () => {
    const res = await authorizedTenant(new NextRequest(`http://x/api/subscriptions?tenant_id=${T1}`));
    expect('error' in res && res.error.status).toBe(401);
  });

  it('rejects a signed-in caller from another tenant', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'u', tenants: [{ id: T2 }] }), { status: 200 }),
    );
    const req = new NextRequest(`http://x/api/subscriptions?tenant_id=${T1}`, { headers: { cookie: 'bb_session=x' } });
    const res = await authorizedTenant(req);
    expect('error' in res && res.error.status).toBe(403);
    fetchSpy.mockRestore();
  });

  it('lets a member through', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'u', tenants: [{ id: T1 }] }), { status: 200 }),
    );
    const req = new NextRequest(`http://x/api/subscriptions?tenant_id=${T1}`, { headers: { cookie: 'bb_session=x' } });
    expect(await authorizedTenant(req)).toEqual({ tenantId: T1 });
    fetchSpy.mockRestore();
  });
});
