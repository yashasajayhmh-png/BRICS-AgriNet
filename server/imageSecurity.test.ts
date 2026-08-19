import { describe, it, expect, vi } from 'vitest';
import { isAllowedImageHost, processImageInput, ALLOWED_IMAGE_HOSTS } from './imageSecurity';

describe('Image Security & SSRF Protection Module', () => {
  describe('isAllowedImageHost', () => {
    it('allows verified image hosts from allowlist', () => {
      expect(isAllowedImageHost('images.unsplash.com')).toBe(true);
      expect(isAllowedImageHost('plus.unsplash.com')).toBe(true);
      expect(isAllowedImageHost('storage.googleapis.com')).toBe(true);
      expect(isAllowedImageHost('cdn.jsdelivr.net')).toBe(true);
    });

    it('rejects cloud metadata, loopback, and internal IPs', () => {
      expect(isAllowedImageHost('169.254.169.254')).toBe(false);
      expect(isAllowedImageHost('127.0.0.1')).toBe(false);
      expect(isAllowedImageHost('localhost')).toBe(false);
      expect(isAllowedImageHost('10.0.0.1')).toBe(false);
      expect(isAllowedImageHost('192.168.1.1')).toBe(false);
      expect(isAllowedImageHost('172.16.0.1')).toBe(false);
      expect(isAllowedImageHost('0.0.0.0')).toBe(false);
    });

    it('rejects arbitrary external domains', () => {
      expect(isAllowedImageHost('evil-attacker.com')).toBe(false);
      expect(isAllowedImageHost('google.com')).toBe(false);
      expect(isAllowedImageHost('my-internal-service.local')).toBe(false);
    });
  });

  describe('processImageInput', () => {
    it('rejects unallowed domains with a descriptive SSRF security error', async () => {
      await expect(
        processImageInput('https://169.254.169.254/latest/meta-data/')
      ).rejects.toThrow(/not permitted/i);

      await expect(
        processImageInput('https://localhost:3000/api/keys')
      ).rejects.toThrow(/not permitted/i);

      await expect(
        processImageInput('https://evil-host.com/exploit.jpg')
      ).rejects.toThrow(/not permitted/i);
    });

    it('rejects insecure non-HTTPS protocols (http, file, gopher)', async () => {
      await expect(
        processImageInput('http://images.unsplash.com/photo-123')
      ).rejects.toThrow(/Insecure protocol.*Only HTTPS/i);

      await expect(
        processImageInput('file:///etc/passwd')
      ).rejects.toThrow();
    });

    it('processes valid raw base64 data strings without network calls', async () => {
      const rawBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const result = await processImageInput(rawBase64, 'image/png');
      expect(result.base64Data).toBe(rawBase64);
      expect(result.detectedMimeType).toBe('image/png');
    });

    it('processes data URIs and extracts MIME type and clean base64 payload', async () => {
      const dataUri = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2wAA';
      const result = await processImageInput(dataUri);
      expect(result.base64Data).toBe('UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2wAA');
      expect(result.detectedMimeType).toBe('image/webp');
    });

    it('rejects empty or corrupt payloads', async () => {
      await expect(processImageInput('')).rejects.toThrow(/required/i);
      await expect(processImageInput('abc')).rejects.toThrow(/invalid or corrupted/i);
    });
  });
});
