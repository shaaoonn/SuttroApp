'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase-browser';

// ═══════════════════════════════════════════════════════════════════
// FileUploader — drop-in image/PDF uploader for Supabase Storage
//
// Uses bucket 'daily-lessons' (must exist with public read policy).
// Returns { url, type } via onChange when upload succeeds.
//
// Usage:
//   <FileUploader
//     accept="image/*,application/pdf"
//     value={attachmentUrl}
//     onChange={(url, type) => setForm({...form, attachmentUrl: url, attachmentType: type})}
//   />
// ═══════════════════════════════════════════════════════════════════

interface Props {
  value?: string | null;
  accept?: string;            // 'image/*' | 'application/pdf' | 'image/*,application/pdf'
  onChange: (url: string | null, type: 'image' | 'pdf' | null) => void;
  bucket?: string;            // default 'daily-lessons'
  folder?: string;            // sub-folder inside bucket
  maxSizeMB?: number;         // default 10
  label?: string;
}

export default function FileUploader({
  value,
  accept = 'image/*,application/pdf',
  onChange,
  bucket = 'daily-lessons',
  folder = 'attachments',
  maxSizeMB = 10,
  label = 'ফাইল আপলোড করো',
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPdf = value?.toLowerCase().endsWith('.pdf');
  const isImage = value && !isPdf;

  async function handleFile(file: File) {
    setError(null);

    // Size check
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`ফাইল সাইজ ${maxSizeMB}MB-এর বেশি হতে পারবে না।`);
      return;
    }

    // Type check
    const isImageFile = file.type.startsWith('image/');
    const isPdfFile = file.type === 'application/pdf';
    if (!isImageFile && !isPdfFile) {
      setError('শুধু ছবি (JPG/PNG) অথবা PDF ফাইল গ্রহণ করা হবে।');
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Generate unique filename
      const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setProgress(80);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filename);

      setProgress(100);
      onChange(publicUrl, isImageFile ? 'image' : 'pdf');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'আপলোড ব্যর্থ হয়েছে।';
      setError(msg);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    onChange(null, null);
    if (inputRef.current) inputRef.current.value = '';
  }

  // ─── Render ───
  return (
    <div className="space-y-2">
      {!value && (
        <label
          className="block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          style={{ borderColor: 'var(--admin-border, #E2E8F0)' }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={uploading}
            className="hidden"
          />
          {uploading ? (
            <div>
              <div className="text-sm mb-2">আপলোড হচ্ছে... {progress}%</div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="text-2xl mb-1">📎</div>
              <div className="text-sm font-medium text-gray-700">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                JPG, PNG, অথবা PDF (সর্বোচ্চ {maxSizeMB}MB)
              </div>
            </>
          )}
        </label>
      )}

      {value && (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-16 h-16 object-cover rounded" />
          ) : isPdf ? (
            <div className="w-16 h-16 rounded bg-red-50 flex items-center justify-center text-2xl">
              📄
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {isPdf ? 'PDF সংযুক্ত' : 'ছবি সংযুক্ত'}
            </div>
            <a
              href={value}
              target="_blank"
              rel="noopener"
              className="text-xs text-teal-600 hover:underline truncate block"
            >
              {value.split('/').pop()}
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded"
          >
            ✕ মুছো
          </button>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 px-2">{error}</div>
      )}
    </div>
  );
}
