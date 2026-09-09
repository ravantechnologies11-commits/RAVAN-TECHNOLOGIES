import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
  file_size: string;
  file_name: string;
}

// Security: Checks SVG content for dangerous script or event handler injection
function isSafeSvg(svgText: string): boolean {
  const lower = svgText.toLowerCase();
  const dangerousPatterns = [
    '<script',
    'javascript:',
    'onload=',
    'onerror=',
    'onclick=',
    'onmouseover=',
    '<foreignobject',
    '<iframe',
    '<embed',
    '<object'
  ];
  return !dangerousPatterns.some(pattern => lower.includes(pattern));
}

/**
 * Inspects initial header bytes of a file to verify true image formats.
 * Prevents disguised executable/script payloads from masquerading as images.
 */
export async function verifyImageMagicBytes(file: File): Promise<{ valid: boolean; error?: string }> {
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    try {
      const text = await file.text();
      if (!text.includes('<svg') || !isSafeSvg(text)) {
        return { valid: false, error: 'Malicious or invalid SVG vector code detected.' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'Failed to parse SVG file safely.' };
    }
  }

  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 4) {
      return { valid: false, error: 'File is too small to be a valid image.' };
    }

    // JPEG: FF D8 FF
    const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    // PNG: 89 50 4E 47
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    // GIF: 47 49 46 38 ('GIF8')
    const isGif = bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38;
    // WEBP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
    const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
                   bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    // BMP: 42 4D
    const isBmp = bytes[0] === 0x42 && bytes[1] === 0x4D;
    // TIFF: 49 49 2A 00 or 4D 4D 00 2A
    const isTiff = (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2A && bytes[3] === 0x00) ||
                   (bytes[0] === 0x4D && bytes[1] === 0x4D && bytes[2] === 0x00 && bytes[3] === 0x2A);
    // HEIC/AVIF: 'ftyp' box starting at byte 4: 66 74 79 70
    const isFtyp = bytes.length >= 8 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;

    if (isJpeg || isPng || isGif || isWebp || isBmp || isTiff || isFtyp) {
      return { valid: true };
    }

    return {
      valid: false,
      error: 'Security alert: File binary signature does not match any valid image format.'
    };
  } catch {
    return { valid: true };
  }
}

function formatStorageError(error: any, bucket: string): Error {
  const msg = error?.message || '';
  if (msg.toLowerCase().includes('bucket not found') || msg.toLowerCase().includes('not found') || msg.includes('404')) {
    return new Error(`Storage bucket '${bucket}' not found in Supabase. Please run the Storage Bucket SQL migration in your Supabase Dashboard SQL Editor.`);
  }
  if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('accessdenied') || msg.includes('403')) {
    return new Error(`Storage permission denied: Only authenticated administrators can upload assets to '${bucket}'.`);
  }
  return new Error(msg || `Storage upload failed for bucket '${bucket}'.`);
}

export const storageService = {
  validateImage(file: File, maxMb = 5): { valid: boolean; error?: string } {
    // Accepted MIME types — explicit allowlist covers standard + modern formats
    const ACCEPTED_MIME_TYPES = new Set([
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'image/svg+xml', 'image/bmp', 'image/tiff', 'image/x-tiff',
      'image/heic', 'image/heif', 'image/avif', 'image/jfif',
      'image/x-png', 'image/pjpeg'
    ]);

    // Accepted extensions as fallback when MIME type is empty or generic (common with HEIC on iOS)
    const ACCEPTED_EXTENSIONS = new Set([
      'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff',
      'tif', 'heic', 'heif', 'avif', 'jfif'
    ]);

    const mimeType = (file.type || '').toLowerCase().trim();
    const ext = (file.name.split('.').pop() || '').toLowerCase().trim();

    const mimeValid = mimeType.startsWith('image/') || ACCEPTED_MIME_TYPES.has(mimeType);
    const extValid = ACCEPTED_EXTENSIONS.has(ext);

    // Accept if EITHER the MIME or extension is valid
    // (iOS Safari reports HEIC as empty string; extension check saves it)
    const isImageFile = mimeValid || extValid;

    if (!isImageFile) {
      return {
        valid: false,
        error: `Unsupported file format (${mimeType || ext || 'unknown'}). Supported: JPG, PNG, WEBP, GIF, HEIC, AVIF, BMP, SVG.`
      };
    }

    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, error: `File size exceeds ${maxMb}MB limit.` };
    }
    return { valid: true };
  },

  async uploadImage(
    file: File | Blob,
    preferredBucket: 'site-assets' | 'media' | 'avatars' | 'gallery' | 'projects' | 'ecosystem' = 'site-assets',
    folder = 'brand',
    fileNameOverride?: string
  ): Promise<UploadResult> {
    if (file instanceof File) {
      const validation = this.validateImage(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Deep binary header / magic bytes verification (rejects executables disguised with image extensions)
      const magicCheck = await verifyImageMagicBytes(file);
      if (!magicCheck.valid) {
        throw new Error(magicCheck.error);
      }
    }

    const fileExt = fileNameOverride?.split('.').pop()?.toLowerCase() || 
      (file instanceof File ? file.name.split('.').pop()?.toLowerCase() : 'png') || 'png';
    const cleanFileName = fileNameOverride || `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${folder}/${cleanFileName}`;
    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase storage is not configured. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env configuration.');
    }

    // Try candidate buckets in order
    const candidateBuckets = preferredBucket === 'site-assets' 
      ? ['site-assets', 'media'] 
      : [preferredBucket, 'site-assets', 'media'];

    let lastError: any = null;

    for (const targetBucket of candidateBuckets) {
      try {
        const { data, error } = await supabase.storage
          .from(targetBucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type && file.type !== 'application/octet-stream' 
              ? file.type 
              : (() => {
                  const extMimeMap: Record<string, string> = {
                    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
                    webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp',
                    svg: 'image/svg+xml', tiff: 'image/tiff', tif: 'image/tiff',
                    heic: 'image/heic', heif: 'image/heif', avif: 'image/avif',
                    jfif: 'image/jpeg'
                  };
                  return extMimeMap[fileExt] || `image/${fileExt}`;
                })()
          });

        if (!error && data) {
          const { data: publicData } = supabase.storage
            .from(targetBucket)
            .getPublicUrl(filePath);

          return {
            url: publicData.publicUrl,
            path: filePath,
            bucket: targetBucket,
            file_size: formattedSize,
            file_name: cleanFileName
          };
        }

        if (error) {
          lastError = error;
          if (error.message?.toLowerCase().includes('bucket not found') || 
              error.message?.toLowerCase().includes('not found')) {
            continue;
          }
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw formatStorageError(lastError, preferredBucket);
  },

  async deleteImage(path: string, bucket: string = 'site-assets'): Promise<boolean> {
    if (isSupabaseConfigured && supabase && path) {
      try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error && bucket !== 'media') {
          await supabase.storage.from('media').remove([path]);
        }
        return !error;
      } catch (err) {
        if (import.meta.env.DEV) console.error('Supabase storage deletion error:', err);
        return false;
      }
    }
    return true;
  }
};
