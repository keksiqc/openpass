// Simple encryption utility for local storage
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Simple XOR-based encryption for demo purposes
// In production, use a proper encryption library like crypto-js
export function encrypt(text: string, key: string): string {
  if (!key) {
    return text;
  }

  const keyBytes = encoder.encode(key);
  const textBytes = encoder.encode(text);
  const encrypted = new Uint8Array(textBytes.length);

  for (let i = 0; i < textBytes.length; i++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: XOR is intentional for encryption
    encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
  }

  return btoa(String.fromCharCode(...encrypted));
}

export function decrypt(encryptedText: string, key: string): string {
  if (!key) {
    return encryptedText;
  }

  try {
    const keyBytes = encoder.encode(key);
    const encryptedBytes = new Uint8Array(
      atob(encryptedText)
        .split("")
        .map((char) => char.charCodeAt(0))
    );
    const decrypted = new Uint8Array(encryptedBytes.length);

    for (let i = 0; i < encryptedBytes.length; i++) {
      // biome-ignore lint/suspicious/noBitwiseOperators: XOR is intentional for encryption
      decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    return decoder.decode(decrypted);
  } catch (_error) {
    return encryptedText;
  }
}

// Generate a random encryption key
export function generateKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
