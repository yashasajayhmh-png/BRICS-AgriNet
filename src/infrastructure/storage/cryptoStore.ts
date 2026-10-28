/**
 * Web Crypto Storage Encryption for sensitive offline agricultural data.
 * Protects farmer PII and precise field plot coordinates at rest using AES-GCM (256-bit).
 * 
 * Standards Reference:
 * W3C Web Cryptography API Recommendation
 */

const KEY_STORE_KEY = 'agrinet_storage_key_salt';

// Generates or retrieves a persistent symmetric device key using Web Crypto
async function getOrCreateDeviceEncryptionKey(): Promise<CryptoKey> {
  const rawSalt = localStorage.getItem(KEY_STORE_KEY);
  let salt: Uint8Array;

  if (rawSalt) {
    salt = new Uint8Array(JSON.parse(rawSalt));
  } else {
    salt = window.crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem(KEY_STORE_KEY, JSON.stringify(Array.from(salt)));
  }

  // Derive key material using PBKDF2
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode('brics-agrinet-offline-device-vault'),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a sensitive string payload
 */
export async function encryptSensitiveField(plaintext: string): Promise<{ ciphertextBase64: string; ivBase64: string }> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback in non-browser environment
    return { ciphertextBase64: btoa(plaintext), ivBase64: '' };
  }

  const key = await getOrCreateDeviceEncryptionKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoded
  );

  const ciphertextBase64 = btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer)));
  const ivBase64 = btoa(String.fromCharCode(...iv));

  return { ciphertextBase64, ivBase64 };
}

/**
 * Decrypt a sensitive string payload
 */
export async function decryptSensitiveField(ciphertextBase64: string, ivBase64: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle || !ivBase64) {
    return atob(ciphertextBase64);
  }

  const key = await getOrCreateDeviceEncryptionKey();
  const iv = new Uint8Array(
    atob(ivBase64)
      .split('')
      .map((c) => c.charCodeAt(0))
  );
  const ciphertext = new Uint8Array(
    atob(ciphertextBase64)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
}
