import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./auth-store";

const codevertex = { id: "t1", name: "CodeVertex", slug: "codevertex" };
const hadia = { id: "t2", name: "Hadia", slug: "hadia" };

const admin = { id: "u-admin", email: "admin@x", roles: ["superuser"], tenants: [{ ...codevertex, roles: ["superuser"] }, { ...hadia, roles: ["admin"] }], is_platform_owner: true };
const reviewer = { id: "u-review", email: "meta-review@x", roles: ["member"], tenants: [{ ...codevertex, roles: ["member"] }] };

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, activeTenant: null, isAuthenticated: false, isLoading: true });
});

import { resolveUser } from "@/hooks/resolve-user";

// The cached /me can still hold the previous person right after someone else signs in on the
// same tab ("Good evening, admin" for a member, 2026-11-10): the freshly signed-in user wins.
describe("resolveUser", () => {
  it("prefers the signed-in user over a cached /me of someone else", () => {
    expect(resolveUser(admin, reviewer)).toEqual({ user: reviewer, stale: true });
  });
  it("uses /me when it is the same person (it is fresher)", () => {
    const fresh = { ...reviewer, roles: ["member", "x"] };
    expect(resolveUser(fresh, reviewer)).toEqual({ user: fresh, stale: false });
  });
  it("falls back to whichever exists", () => {
    expect(resolveUser(undefined, reviewer).user).toBe(reviewer);
    expect(resolveUser(reviewer, null).user).toBe(reviewer);
    expect(resolveUser(undefined, null).user).toBeNull();
  });
});

// 2026-11-10: after an admin had switched to Hadia, the next person to sign in on the same browser
// kept the admin's organisation (Hadia branding, the admin's data) because the stored active
// organisation was only set "if none is set yet".
describe("auth store across users", () => {
  it("a different user signing in does not inherit the previous user's organisation", () => {
    const s = useAuthStore.getState();
    s.setUser(admin);
    s.setActiveTenant(hadia);
    s.setUser(reviewer);
    expect(useAuthStore.getState().activeTenant?.slug).toBe("codevertex");
  });

  it("an organisation the user is not a member of is never kept", () => {
    useAuthStore.setState({ activeTenant: hadia }); // e.g. left in storage, user unknown
    useAuthStore.getState().setUser(reviewer);
    expect(useAuthStore.getState().activeTenant?.slug).toBe("codevertex");
  });

  it("the same user refreshing keeps the organisation they chose", () => {
    const s = useAuthStore.getState();
    s.setUser(admin);
    s.setActiveTenant(hadia);
    s.setUser({ ...admin });
    expect(useAuthStore.getState().activeTenant?.slug).toBe("hadia");
  });

  it("a platform owner may keep a switched-to organisation outside their memberships", () => {
    const s = useAuthStore.getState();
    const po = { ...admin, tenants: [{ ...codevertex, roles: ["superuser"] }] };
    s.setUser(po);
    s.setActiveTenant({ id: "t9", name: "Urban Loft", slug: "urban-loft" });
    s.setUser({ ...po });
    expect(useAuthStore.getState().activeTenant?.slug).toBe("urban-loft");
  });

  it("falls back to the primary tenant when no membership list is sent", () => {
    useAuthStore.getState().setUser({ id: "u3", email: "x", roles: [], tenant: codevertex });
    expect(useAuthStore.getState().activeTenant?.slug).toBe("codevertex");
  });
});
