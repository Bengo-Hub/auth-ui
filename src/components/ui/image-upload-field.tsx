'use client';

import { useCallback, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { blobToDataURL, compressImageFile } from '@/lib/image-compress';

// Shared drag-drop/file-picker/paste-URL image upload control — extracted
// from BrandingTab.tsx's tenant-logo field (Phase 10) so the profile page's
// avatar upload reuses the same component instead of a second copy.

export interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
  hint?: string;
  maxDimension?: number;
  maxBytes?: number;
  maxSourceBytes?: number;
  /** Renders the preview as a circle instead of the default rounded square — for avatars. */
  round?: boolean;
}

const DEFAULT_MAX_DIMENSION = 512;
const DEFAULT_MAX_BYTES = 350 * 1024;
const DEFAULT_MAX_SOURCE_BYTES = 8 * 1024 * 1024;

export function ImageUploadField({
  label,
  value,
  onChange,
  onError,
  hint,
  maxDimension = DEFAULT_MAX_DIMENSION,
  maxBytes = DEFAULT_MAX_BYTES,
  maxSourceBytes = DEFAULT_MAX_SOURCE_BYTES,
  round = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        onError?.('Please choose an image file.');
        return;
      }
      if (file.size > maxSourceBytes) {
        onError?.(`Image is too large (max ${Math.round(maxSourceBytes / (1024 * 1024))}MB before compression).`);
        return;
      }
      // SVGs are vector and already tiny — rasterizing them through canvas would
      // lose scalability for no size benefit, so just size-cap and pass through.
      if (file.type === 'image/svg+xml') {
        if (file.size > maxBytes) {
          onError?.(`SVG is too large (max ${Math.round(maxBytes / 1024)}KB).`);
          return;
        }
        onChange(await blobToDataURL(file));
        return;
      }
      setCompressing(true);
      try {
        const dataUrl = await compressImageFile(file, { maxDimension, maxBytes });
        onChange(dataUrl);
      } catch (err: any) {
        onError?.(err?.message || 'Could not process this image.');
      } finally {
        setCompressing(false);
      }
    },
    [onChange, onError, maxDimension, maxBytes, maxSourceBytes],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</Label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center gap-3 border-2 border-dashed p-8 cursor-pointer transition-all ${round ? 'rounded-full aspect-square' : 'rounded-2xl'} ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
        }`}
      >
        {compressing ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-[11px] text-slate-400">Compressing…</p>
          </div>
        ) : value ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className={round ? 'h-24 w-24 rounded-full object-cover' : 'max-h-24 max-w-full rounded-lg object-contain'}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Drop an image or <span className="text-primary">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                PNG, SVG, JPG — auto-compressed to under {Math.round(maxBytes / 1024)}KB
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/svg+xml,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
      <Input
        placeholder="or paste an image URL"
        value={value?.startsWith('data:') ? '' : value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-none"
      />
      {hint && <p className="text-[10px] text-slate-500 font-medium">{hint}</p>}
    </div>
  );
}
