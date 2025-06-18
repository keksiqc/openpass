export interface PasswordProfileSettings extends PasswordSettings {}
export interface PassphraseProfileSettings extends PassphraseSettings {}
export interface FormatProfileSettings extends FormatSettings {}
// Placeholder for PIN settings if it becomes part of profiles
export interface PinProfileSettings { length: number; }


export interface PasswordProfile {
  id: string;
  name: string;
  type: 'password' | 'passphrase' | 'format' | 'pin'; // Added 'pin'
  settings: PasswordProfileSettings | PassphraseProfileSettings | FormatProfileSettings | PinProfileSettings;
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
  requireEachCharacterType?: boolean; // Added new field
}

export interface PassphraseSettings {
  wordCount: number;
  separator: string;
  includeNumbers: boolean;
  customWords?: string[];
  wordCase: 'lowercase' | 'uppercase' | 'capitalize' | 'mixed';
  insertNumbersRandomly?: boolean; // Added new field
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
