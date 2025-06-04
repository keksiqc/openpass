export interface PasswordProfile {
  id: string;
  name: string;
  type: 'password' | 'passphrase' | 'format';
  settings: any;
  createdAt: Date;
  lastUsed?: Date;
  isFavorite?: boolean;
}

export interface PasswordSettings {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  customCharacters: string;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  minNumbers?: number;
  minSymbols?: number;
}

export interface PassphraseSettings {
  wordCount: number;
  separator: string;
  includeNumbers: boolean;
  customWords?: string[];
  wordCase: 'lowercase' | 'uppercase' | 'capitalize' | 'mixed';
}

export interface FormatSettings {
  format: string;
  templates: Array<{ name: string; pattern: string }>;
}

export interface PasswordHistory {
  id: string;
  password: string;
  type: 'password' | 'passphrase' | 'format';
  createdAt: Date;
  strength: { score: number; label: string };
}

export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export interface AppSettings {
  historyEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey: string;
}
