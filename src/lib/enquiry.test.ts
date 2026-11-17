import { describe, expect, it } from 'vitest';
import { enquiryTopicForApp, enquiryUrl } from './enquiry';

describe('enquiryTopicForApp', () => {
  it('keeps ids the website shares', () => {
    expect(enquiryTopicForApp('pos')).toBe('pos');
    expect(enquiryTopicForApp('notifications')).toBe('notifications');
  });

  it('maps auth-ui ids the website names differently', () => {
    expect(enquiryTopicForApp('cafe')).toBe('ordering');
    expect(enquiryTopicForApp('analytics')).toBe('ai');
  });

  it('falls back to other for an unknown app', () => {
    expect(enquiryTopicForApp('superset')).toBe('other');
  });
});

describe('enquiryUrl', () => {
  it('opens the website contact form with the topic chosen', () => {
    expect(enquiryUrl('books')).toBe('https://codevertexafrica.com/contact?service=books');
  });
});
