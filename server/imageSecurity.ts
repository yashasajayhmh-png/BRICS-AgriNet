/**
 * BRICS AgriNet - Image Security & SSRF Protection Module
 * Restricts remote image fetching to a strict HTTPS domain allowlist,
 * validates payload formats, limits download sizes, and prevents SSRF attacks.
 */

export const ALLOWED_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'plus.unsplash.com',
  'storage.googleapis.com',
  'cdn.jsdelivr.net',
]);

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB limit

export interface ProcessedImageData {
  base64Data: string;
  detectedMimeType: string;
}

/**
 * Validates whether a hostname belongs to the strict trusted CDN allowlist.
 */
export function isAllowedImageHost(hostname: string): boolean {
  if (!hostname || typeof hostname !== 'string') return false;
  const normalizedHost = hostname.toLowerCase().trim();
  return ALLOWED_IMAGE_HOSTS.has(normalizedHost);
}

/**
 * Safely processes image input, protecting against SSRF and oversized payloads.
 * Accepts either:
 * 1. An HTTPS URL matching the strict domain allowlist (e.g. images.unsplash.com).
 * 2. A base64 string or data URL (e.g. data:image/jpeg;base64,...).
 */
export async function processImageInput(
  imageBase64: string,
  declaredMimeType: string = 'image/jpeg'
): Promise<ProcessedImageData> {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('Image data is required and must be a non-empty string.');
  }

  const trimmed = imageBase64.trim();

  // If it is a URI / URL with scheme (e.g. https://, http://, file://, ftp://, etc.) and not data:
  if (trimmed.includes('://') && !trimmed.startsWith('data:')) {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(trimmed);
    } catch {
      throw new Error('Invalid image URL format.');
    }

    // Enforce HTTPS only (reject plain HTTP, file://, gopher://, ftp://, etc.)
    if (parsedUrl.protocol !== 'https:') {
      throw new Error(`Insecure protocol '${parsedUrl.protocol}'. Only HTTPS image URLs are permitted.`);
    }

    // SSRF Defense: Enforce strict domain allowlist
    if (!isAllowedImageHost(parsedUrl.hostname)) {
      throw new Error(
        `Remote image domain '${parsedUrl.hostname}' is not permitted. Only trusted image CDNs (${Array.from(
          ALLOWED_IMAGE_HOSTS
        ).join(', ')}) are allowed.`
      );
    }

    // Fetch remote image with timeout and byte limit
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8',
          'User-Agent': 'BRICS-AgriNet-ImageProxy/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch remote image: HTTP ${response.status} ${response.statusText}`);
      }

      const rawContentType = response.headers.get('content-type') || '';
      const contentType = rawContentType.split(';')[0].trim().toLowerCase();
      const finalMimeType = ALLOWED_MIME_TYPES.has(contentType) ? contentType : declaredMimeType;

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
        throw new Error(`Image size (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 10MB.`);
      }

      if (arrayBuffer.byteLength === 0) {
        throw new Error('Remote image response is empty.');
      }

      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      return {
        base64Data,
        detectedMimeType: finalMimeType,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Image download timed out after 6 seconds.');
      }
      throw err;
    }
  }

  // Base64 Data URI or raw base64 string
  let cleanBase64 = trimmed;
  let finalMime = declaredMimeType;

  const dataUriMatch = trimmed.match(/^data:([a-zA-Z0-9+/-]+);base64,(.+)$/s);
  if (dataUriMatch) {
    const mime = dataUriMatch[1].toLowerCase();
    if (ALLOWED_MIME_TYPES.has(mime) || mime.startsWith('image/')) {
      finalMime = mime;
    }
    cleanBase64 = dataUriMatch[2];
  } else {
    cleanBase64 = trimmed.replace(/^data:image\/[a-zA-Z+.-]+;base64,/, '');
  }

  // Clean whitespace/newlines
  cleanBase64 = cleanBase64.replace(/\s+/g, '');

  if (!cleanBase64 || cleanBase64.length < 10 || !/^[A-Za-z0-9+/=]+$/.test(cleanBase64)) {
    throw new Error('Invalid or corrupted base64 image data payload.');
  }

  return {
    base64Data: cleanBase64,
    detectedMimeType: finalMime,
  };
}
