import { describe, expect, it } from 'vitest';
import { cleanLegalHtml, formatLegalDate } from './legal-documents';

describe('cleanLegalHtml', () => {
  it('keeps ordinary markup', () => {
    const html = '<h2>1. Scope</h2><p>The <a href="https://example.com">agent</a> posts.</p>';
    expect(cleanLegalHtml(html)).toBe(html);
  });

  it('drops scripts, frames, handlers and javascript links', () => {
    const out = cleanLegalHtml(
      '<p onclick="x()">a</p><script>alert(1)</script><iframe src="https://x"></iframe><a href="javascript:alert(1)">b</a>',
    );
    expect(out).not.toMatch(/script|iframe|onclick|javascript:/i);
    expect(out).toContain('<p>a</p>');
  });
});

describe('formatLegalDate', () => {
  it('formats in Nairobi time and passes through junk', () => {
    expect(formatLegalDate('2026-11-30T21:00:00Z')).toMatch(/1 December 2026/);
    expect(formatLegalDate('soon')).toBe('soon');
  });
});
