// Password generation constants
export const PASSWORD_CONSTRAINTS = {
  MIN_LENGTH: 4,
  MAX_LENGTH: 128,
  MAX_HISTORY_ENTRIES: 50,
  DEFAULT_LENGTH: 16,
} as const;

// Passphrase generation constants
export const PASSPHRASE_CONSTRAINTS = {
  MIN_WORDS: 2,
  MAX_WORDS: 8,
  DEFAULT_WORDS: 4,
  DICTIONARY_SIZE: 7776, // EFF Large Wordlist size
} as const;

// Character sets
export const CHARACTER_SETS = {
  UPPERCASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  LOWERCASE: "abcdefghijklmnopqrstuvwxyz",
  NUMBERS: "0123456789",
  SYMBOLS: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  SIMILAR: "0O1lI",
  AMBIGUOUS: "{}[]()\\/'\"~,;.<>",
} as const;

// Default settings
export const DEFAULT_PASSWORD_SETTINGS = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  customCharacters: "",
  excludeSimilar: false,
  excludeAmbiguous: false,
  minNumbers: 1,
  minSymbols: 1,
  requireEachCharacterType: true,
} as const;

export const DEFAULT_PASSPHRASE_SETTINGS = {
  wordCount: 4,
  separator: "-",
  includeNumbers: false,
  customWords: [] as string[],
  wordCase: "lowercase" as const,
  insertNumbersRandomly: false,
};

export const READABLE_PRESETS = [
  {
    strength: "easy" as const,
    label: "Easy",
    description: "Simple and memorable, 8 chars",
    pattern: "6l2d",
  },
  {
    strength: "moderate" as const,
    label: "Moderate",
    description: "Balanced readability, 12 chars",
    pattern: "1u4l1{-}3d1{-}2l",
  },
  {
    strength: "strong" as const,
    label: "Strong",
    description: "Secure yet typeable, 14 chars",
    pattern: "1u3l2d1{!@#}1{-}1u3l2d",
  },
  {
    strength: "ultra" as const,
    label: "Ultra",
    description: "Maximum with structure, 18 chars",
    pattern: "1u3l1{!@#$}2d1{-}1u3l1{!@#$}2d1u1l",
  },
];

export const DEFAULT_FORMAT_SETTINGS = {
  mode: "readable" as const,
  format: "1u4l1{-}3d1{-}2l",
  readableStrength: "moderate" as const,
  templates: [
    { name: "Strong Mixed", pattern: "2u4l2d2{#$%}" },
    { name: "Alphanumeric", pattern: "3u3l4d" },
    { name: "Complex", pattern: "1u6l1{@#$}3d1{!%&}" },
    { name: "Simple", pattern: "4l4d" },
    { name: "Memorable", pattern: "1u4l1{#$%}4d" },
  ],
};

export const DEFAULT_PIN_SETTINGS = {
  length: 4,
} as const;

// Strength calculation thresholds
export const STRENGTH_THRESHOLDS = {
  WEAK: 60,
  FAIR: 80,
  GOOD: 100,
  STRONG: 120,
} as const;

// Generation limits
export const GENERATION_LIMITS = {
  MAX_ATTEMPTS: 100,
  MAX_ENFORCEMENT_RETRIES: 20,
  GUESSES_PER_SECOND: 1e12,
} as const;
