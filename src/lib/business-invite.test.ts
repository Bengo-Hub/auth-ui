import { describe, expect, it } from "vitest";
import { readInvitePrefill } from "./business-invite";

const b64url = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

describe("business invite prefill", () => {
  it("reads the email and organisation from an invite", () => {
    const tok = `${b64url({ alg: "HS256" })}.${b64url({ purpose: "business_invite", email: "owner@shop.co.ke", org_name: "Shea Glow" })}.sig`;
    expect(readInvitePrefill(tok)).toEqual({ email: "owner@shop.co.ke", orgName: "Shea Glow" });
  });

  it("ignores anything that is not a business invite", () => {
    expect(readInvitePrefill("")).toEqual({ email: "", orgName: "" });
    expect(readInvitePrefill("a.b")).toEqual({ email: "", orgName: "" });
    const other = `x.${b64url({ purpose: "social_mfa", email: "a@b.co" })}.y`;
    expect(readInvitePrefill(other)).toEqual({ email: "", orgName: "" });
    expect(readInvitePrefill("x.!!!.y")).toEqual({ email: "", orgName: "" });
  });
});
