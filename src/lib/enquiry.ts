/**
 * Links out to codevertexafrica.com. A product or service card sends a visitor to the website's
 * enquiry form with that topic already chosen (/contact?service=<id>). Topic ids must match the
 * website's src/config/services.ts (ENQUIRY_TOPICS).
 */

export const WEBSITE_URL = 'https://codevertexafrica.com';

/** Public API documentation for integrators. */
export const API_DOCS_URL = 'https://docs.codevertexafrica.com/integrations/etims-api/';

/** Enquiry topic ids the website's contact form knows. */
export type EnquiryTopic =
  | 'erp' | 'books' | 'pos' | 'ordering' | 'projects' | 'inventory' | 'logistics' | 'truload' | 'isp'
  | 'afya' | 'marketflow' | 'ticketing' | 'library' | 'notifications' | 'maskani'
  | 'software' | 'ai' | 'ecommerce' | 'cloud' | 'cybersec' | 'iot' | 'digitika' | 'other';

// auth-ui app ids (config/services.ts, config/launcher-apps.ts) that differ from the website's.
const APP_TO_TOPIC: Record<string, EnquiryTopic> = {
  cafe: 'ordering',
  analytics: 'ai',
};

const KNOWN_TOPICS = new Set<string>([
  'erp', 'books', 'pos', 'ordering', 'projects', 'inventory', 'logistics', 'truload', 'isp',
  'afya', 'marketflow', 'ticketing', 'library', 'notifications', 'maskani',
  'software', 'ai', 'ecommerce', 'cloud', 'cybersec', 'iot', 'digitika', 'other',
]);

/** The website enquiry topic for an auth-ui app id, or 'other' when the website has no match. */
export function enquiryTopicForApp(appId: string): EnquiryTopic {
  const mapped = APP_TO_TOPIC[appId] ?? appId;
  return (KNOWN_TOPICS.has(mapped) ? mapped : 'other') as EnquiryTopic;
}

/** The website's enquiry form with a topic preselected. */
export function enquiryUrl(topic: EnquiryTopic): string {
  return `${WEBSITE_URL}/contact?service=${encodeURIComponent(topic)}`;
}
