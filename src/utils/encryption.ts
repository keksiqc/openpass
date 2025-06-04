// Simple encryption utility for local storage
export class SimpleEncryption {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  // Simple XOR-based encryption for demo purposes
  // In production, use a proper encryption library like crypto-js
  static encrypt(text: string, key: string): string {
    if (!key) return text;
    
    const keyBytes = this.encoder.encode(key);
    const textBytes = this.encoder.encode(text);
    const encrypted = new Uint8Array(textBytes.length);
    
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = textBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return btoa(String.fromCharCode(...encrypted));
  }

  static decrypt(encryptedText: string, key: string): string {
    if (!key) return encryptedText;
    
    try {
      const keyBytes = this.encoder.encode(key);
      const encryptedBytes = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      );
      const decrypted = new Uint8Array(encryptedBytes.length);
      
      for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
      }
      
      return this.decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedText;
    }
  }

  // Generate a random encryption key
  static generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
