# Sprint 7: Public pricing page, grouped and relinked

**Status:** Done, with open items (Nov 2026)

## Why
`/pricing` listed every plan from subscriptions-api in one flat grid of cards. Products were
mixed together, the monthly and annual toggle showed nothing on "Annual" because no public annual
plans exist, feature names rendered as blank lines, and the copy described identity management
with a "Trusted by 1,000+ Teams" claim we cannot back. Every buy link was broken: plan codes were
lowercased (subscriptions-api treats codes as case sensitive, so `/plans/code/erp_starter` is a
404) and signed-in visitors were sent to `pricing.<domain>/<slug>/plans`, which does not exist.

## Delivered
- [x] `src/lib/pricing-catalog.ts` groups the live plans as category, product and tier. It splits
  PowerSuite POS into Retail (Duka) and Hospitality by `useCase`, pairs each monthly plan with its
  perpetual licence (`*_ONE_TIME`), hides non-public and retired annual rows, and keeps plans for
  unknown products under "More products" so a new plan family still shows.
- [x] Five groups with a sticky jump bar: Shops and restaurants, Healthcare, Running the business,
  Specialist operations, For developers.
- [x] One block per product with its "from" price and trial length. Each tier row shows the
  monthly price, the setup fee and its 6-month waiver, and the "buy once" licence price where one
  exists. The key limits use plain labels, with usage charges listed for ISP Billing and the eTIMS API.
- [x] Buy links go to subscriptions-ui checkout, `/subscribe?plan=<CODE>` with the exact code.
  Signed-out visitors go through `/signup?return_to=<checkout URL>`, and sign-up returns them there.
- [x] Each product links to the full comparison, `pricing.<domain>/plans?service=<tag>&plan=<CODE>`.
  subscriptions-ui now resolves a service tag (`pos`, `hospital`) to its plan group, so these
  links and the dashboard billing links open the right product tab.
- [x] Loading skeleton, an error state with a retry, and a quote request for larger setups and
  annual support contracts. The fake trust badge, gradient text and identity copy were removed.
- [x] The platform dashboard link "Membership Tiers" is now "Subscription Plans" and opens
  `pricing.<domain>/platform/plans`. The old `/codevertex/platform/plans` path was a 404.
- [x] The plan client normalises `setupFee`, `freeTrialDays`, `isPublic` and `useCase`.
- [x] Checked at 1366 px and 390 px wide with no sideways scroll; price amounts and units no
  longer break mid-phrase in the narrow price columns.
- [x] Each tier has a "See all N features" list grouped by category, named from subscriptions-api's
  public `GET /api/v1/catalog/features`. If the catalog cannot load, prices and limits still show.
- [x] Sign-up no longer promises "a free STARTER plan". It says the organisation starts on a free
  trial and a plan can be picked from Billing.

## Open items
- The comparison page in subscriptions-ui needs a session, so signed-out visitors are asked to
  sign in first. A public, read-only comparison would remove that step.
- Local dev cannot load prices: subscriptions-api's CORS allows `accounts.codevertexafrica.com`
  but not `localhost`, so the page shows its error state there. Screenshots were taken with the
  plans request answered from a saved copy of the live catalogue.
- The shorter ISP Billing description is in the subscriptions-api seed and shows once the seed
  runs against production (see subscriptions-api `docs/sprints/2026-11-public-feature-catalog.md`).
