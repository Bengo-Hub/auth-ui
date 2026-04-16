'use client';

import { useState } from 'react';
import { logoUrl } from '@/lib/oauth/catalog';
import { OfficialProviderLogo } from './official-logos';

/**
 * Render a provider's brand logo. Prefers an inline official SVG when we have
 * one for that provider id (google, microsoft, github) — gives us the correct
 * multi-colour brand mark with no CDN dependency. Falls back to the
 * simpleicons CDN for other providers, and initials if that fails.
 */
export function ProviderLogo({
  slug,
  color,
  name,
  brandColor,
  size = 40,
  className,
  providerId,
}: {
  slug?: string;
  color?: string;
  name: string;
  brandColor?: string;
  size?: number;
  className?: string;
  /** Catalog id — when matching 'google', 'microsoft', 'github', render the
   *  official inline SVG mark instead of the CDN image. */
  providerId?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (providerId && ['google', 'microsoft', 'github'].includes(providerId)) {
    return (
      <span
        className={`inline-flex items-center justify-center ${className ?? ''}`}
        style={{ width: size, height: size }}
      >
        <OfficialProviderLogo id={providerId} size={size} />
      </span>
    );
  }

  const src = slug ? logoUrl(slug, color, size) : undefined;
  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-md text-xs font-bold text-white ${className ?? ''}`}
        style={{
          width: size,
          height: size,
          background: brandColor || '#64748b',
        }}
      >
        {name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`rounded-md object-contain p-1 bg-white ring-1 ring-inset ring-border ${className ?? ''}`}
    />
  );
}
