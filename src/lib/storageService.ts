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

      // Deep SVG security verification
      if (file.type === 'image/svg+xml') {
        try {
          const text = await file.text();
          if (!text.includes('<svg') || !isSafeSvg(text)) {
            throw new Error('Malicious or invalid SVG vector code detected.');
          }
        } catch (err: any) {
          throw new Error(err.message || 'Failed to parse SVG file safely.');
        }
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
