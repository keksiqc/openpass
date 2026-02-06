import {
  PASSPHRASE_CONSTRAINTS,
  STRENGTH_THRESHOLDS,
} from "../constants/generator";
import type { PasswordStrength } from "../types";

/**
 * Gets strength description based on strength label
 */
export function getStrengthDescription(
  strengthLabel: string,
  type: "password" | "passphrase" | "format" = "password"
): string {
  const descriptions = {
    password: {
      Weak: "Easy to crack. Increase length or add more character types.",
      Fair: "Moderately secure. More length or variety would help.",
      Good: "Solid password. Increasing length would make it even better.",
      Strong: "Very difficult to crack. Great choice.",
      Excellent: "Maximum protection. Outstanding strength.",
    },
    passphrase: {
      Weak: "Easy to guess. Try more words or add numbers.",
      Fair: "Moderately secure. More words would strengthen it.",
      Good: "Solid passphrase. More words would help even more.",
      Strong: "Very difficult to crack. Great choice.",
      Excellent: "Maximum protection. Outstanding strength.",
    },
    format: {
      Weak: "Easy to crack. Increase format complexity.",
      Fair: "Moderately secure. Adjust format for more variety.",
      Good: "Solid password. More character types would strengthen it.",
      Strong: "Very difficult to crack. Great choice.",
      Excellent: "Maximum protection. Outstanding strength.",
    },
  };

  return (
    descriptions[type][
      strengthLabel as keyof (typeof descriptions)[typeof type]
    ] || ""
  );
}

/**
 * Gets strength color class based on label for progress bars
 */
export function getStrengthColor(strengthLabel: string): string {
  switch (strengthLabel) {
    case "Weak":
      return "strength-weak";
    case "Fair":
      return "strength-fair";
    case "Good":
      return "strength-good";
    case "Strong":
      return "strength-strong";
    case "Excellent":
      return "strength-excellent";
    default:
      return "bg-muted-foreground";
  }
}

/**
 * Gets strength text color class based on label
 */
export function getStrengthTextColor(strengthLabel: string): string {
  switch (strengthLabel) {
    case "Weak":
      return "text-red-600 dark:text-red-400";
    case "Fair":
      return "text-amber-600 dark:text-amber-400";
    case "Good":
      return "text-blue-600 dark:text-blue-400";
    case "Strong":
      return "text-green-600 dark:text-green-400";
    case "Excellent":
      return "text-accent";
    default:
      return "text-muted-foreground";
  }
}

/**
 * Creates a standardized strength object for format/passphrase generators
 */
export function createStrengthObject(entropy: number): PasswordStrength {
  if (entropy < STRENGTH_THRESHOLDS.WEAK) {
    return { label: "Weak", color: "text-red-600 dark:text-red-400", score: 2 };
  }
  if (entropy < STRENGTH_THRESHOLDS.FAIR) {
    return {
      label: "Fair",
      color: "text-amber-600 dark:text-amber-400",
      score: 4,
    };
  }
  if (entropy < STRENGTH_THRESHOLDS.GOOD) {
    return {
      label: "Good",
      color: "text-blue-600 dark:text-blue-400",
      score: 6,
    };
  }
  if (entropy < STRENGTH_THRESHOLDS.STRONG) {
    return {
      label: "Strong",
      color: "text-green-600 dark:text-green-400",
      score: 8,
    };
  }
  return { label: "Excellent", color: "text-accent", score: 10 };
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

  if (settings.wordCase !== "lowercase") {
    entropy += settings.wordCount * Math.log2(1.5);
  }

  return createStrengthObject(entropy);
}
