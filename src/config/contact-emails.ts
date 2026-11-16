/**
 * Codevertex mailboxes by purpose. Every page that shows a Codevertex address reads it from here.
 * Tenant-facing pages show the tenant's own support contact instead.
 */
export const CONTACT_EMAILS = {
  /** General enquiries. */
  info: 'info@codevertexafrica.com',
  /** Customer support and help with the apps. */
  support: 'support@codevertexafrica.com',
  /** Invoices, payments, subscriptions and refunds. */
  billing: 'billing@codevertexafrica.com',
  /** Quotes, demos, pricing and partnerships. */
  sales: 'sales@codevertexafrica.com',
  /** Privacy, terms, cookies and data protection requests. */
  legal: 'legal@codevertexafrica.com',
  /** Security vulnerability reports. */
  security: 'security@codevertexafrica.com',
} as const;
