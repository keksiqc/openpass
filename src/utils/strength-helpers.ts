import {
  PASSPHRASE_CONSTRAINTS,
  STRENGTH_THRESHOLDS,
} from '../constants/generator';
import type { PasswordStrength } from '../types';

/**
 * Gets strength description based on strength label
 */
export function getStrengthDescription(
  strengthLabel: string,
  type: 'password' | 'passphrase' | 'format' = 'password',
): string {
  const descriptions = {
    password: {
      Weak: 'This password is easy to guess. Consider increasing length and character variety.',
      Fair: 'This password is moderately secure. Adding more character types or length would improve it.',
      Good: 'A good password! For even better security, try increasing its length.',
      Strong: 'Excellent password! Very difficult to crack.',
      Excellent: 'Outstanding! This password offers maximum protection.',
    },
    passphrase: {
      Weak: 'This passphrase is easy to guess. Consider increasing word count or adding numbers.',
      Fair: 'This passphrase is moderately secure. Adding more words or numbers would improve it.',
      Good: 'A good passphrase! For even better security, try increasing its length.',
      Strong: 'Excellent passphrase! Very difficult to crack.',
      Excellent: 'Outstanding! This passphrase offers maximum protection.',
    },
    format: {
      Weak: 'This password is easy to guess. Consider increasing length or character variety in your format.',
      Fair: 'This password is moderately secure. Adjusting the format for more complexity would improve it.',
      Good: 'A good format password! For even better security, try increasing its length or character types.',
      Strong: 'Excellent format password! Very difficult to crack.',
      Excellent: 'Outstanding! This format password offers maximum protection.',
    },
  };

  return (
    descriptions[type][
      strengthLabel as keyof (typeof descriptions)[typeof type]
    ] || ''
  );
}

/**
 * Gets strength color class based on label
 */
export function getStrengthColor(strengthLabel: string): string {
  switch (strengthLabel) {
    case 'Weak':
      return 'bg-red-600';
    case 'Fair':
      return 'bg-yellow-600';
    case 'Good':
      return 'bg-blue-600';
    case 'Strong':
      return 'bg-green-600';
    case 'Excellent':
      return 'bg-green-700';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Creates a standardized strength object for format/passphrase generators
 */
export function createStrengthObject(entropy: number): PasswordStrength {
  if (entropy < STRENGTH_THRESHOLDS.WEAK) {
    return { label: 'Weak', color: 'text-red-600', score: 2 };
  } else if (entropy < STRENGTH_THRESHOLDS.FAIR) {
    return { label: 'Fair', color: 'text-yellow-600', score: 4 };
  } else if (entropy < STRENGTH_THRESHOLDS.GOOD) {
    return { label: 'Good', color: 'text-blue-600', score: 6 };
  } else if (entropy < STRENGTH_THRESHOLDS.STRONG) {
    return { label: 'Strong', color: 'text-green-600', score: 8 };
  } else {
    return { label: 'Excellent', color: 'text-green-700', score: 10 };
  }
}

/**
 * Calculates passphrase strength based on settings
 */
export function calculatePassphraseStrength(settings: {
  wordCount: number;
  includeNumbers: boolean;
  wordCase: string;
  insertNumbersRandomly?: boolean;
}): PasswordStrength {
  const entropyPerWord = Math.log2(PASSPHRASE_CONSTRAINTS.DICTIONARY_SIZE);
  let entropy = settings.wordCount * entropyPerWord;

  if (settings.includeNumbers) {
    entropy += settings.insertNumbersRandomly
      ? Math.log2(settings.wordCount * 10)
      : Math.log2(10 * (settings.wordCount / 2));
  }

  // Adjust score based on wordCase
  if (settings.wordCase !== 'lowercase') {
    entropy += settings.wordCount * Math.log2(1.5);
  }

  return createStrengthObject(entropy);
}
