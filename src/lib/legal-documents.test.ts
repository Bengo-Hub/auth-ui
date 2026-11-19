import { describe, expect, it } from 'vitest';
import { cleanLegalHtml, formatLegalDate, legalContents } from './legal-documents';

describe('legalContents', () => {
  it('lists the h2 ids and text in order, skipping headings without a safe id', () => {
    const html =
      '<p>intro</p><h2 id="overview">1. Overview &amp; Scope</h2><h3 id="x">1.1 Sub</h3>' +
      '<h2 id="google-signin">5A. <strong>Google</strong> Sign-In</h2><h2>No id</h2>' +
      '<h2 id="bad id">Bad</h2><h2 id=\'rights\'>9. Your Rights</h2>';
    expect(legalContents(html)).toEqual([
      { id: 'overview', title: '1. Overview & Scope' },
      { id: 'google-signin', title: '5A. Google Sign-In' },
      { id: 'rights', title: '9. Your Rights' },
    ]);
  });

  it('adds the h3 headings when there are fewer than three h2', () => {
    const html = '<h2 id="summary">Part 1</h2><h2 id="full-terms">Part 2</h2><h3 id="about">1. About</h3><h3 id="limits">6. Limits</h3>';
    expect(legalContents(html).map((h) => h.id)).toEqual(['summary', 'full-terms', 'about', 'limits']);
  });
});

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
