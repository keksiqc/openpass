import { GENERATION_LIMITS } from "../constants/generator";
import type { PasswordStrength } from "../types";

// Regex patterns for password strength analysis (moved to top-level for performance)
const LOWERCASE_REGEX = /[a-z]/;
const UPPERCASE_REGEX = /[A-Z]/;
const DIGIT_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[^a-zA-Z0-9]/;
const REPEATED_CHARS_REGEX = /(.)\1{2,}/;
const SEQUENTIAL_NUMBERS_REGEX = /012|123|234|345|456|567|678|789|890/;
const SEQUENTIAL_LETTERS_REGEX =
  /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i;

// Helper function to check character variety
const checkCharacterVariety = (password: string): number => {
  let score = 0;
  if (LOWERCASE_REGEX.test(password)) {
    score += 1;
  }
  if (UPPERCASE_REGEX.test(password)) {
    score += 1;
  }
  if (DIGIT_REGEX.test(password)) {
    score += 1;
  }
  if (SPECIAL_CHAR_REGEX.test(password)) {
    score += 1;
  }
  return score;
};

// Helper function to apply pattern penalties
const applyPatternPenalties = (password: string): number => {
  let penalties = 0;
  if (REPEATED_CHARS_REGEX.test(password)) {
    penalties += 1; // Repeated characters
  }
  if (SEQUENTIAL_NUMBERS_REGEX.test(password)) {
    penalties += 1; // Sequential numbers
  }
  if (SEQUENTIAL_LETTERS_REGEX.test(password)) {
    penalties += 1; // Sequential letters
  }
  return penalties;
};

// Helper function to get strength label and color
const getStrengthLabel = (score: number): { label: string; color: string } => {
  if (score <= 2) {
    return { label: "Weak", color: "text-red-600 dark:text-red-400" };
  }
  if (score <= 4) {
    return { label: "Fair", color: "text-amber-600 dark:text-amber-400" };
  }
  if (score <= 6) {
    return { label: "Good", color: "text-blue-600 dark:text-blue-400" };
  }
  if (score <= 8) {
    return { label: "Strong", color: "text-green-600 dark:text-green-400" };
  }
  return { label: "Excellent", color: "text-accent" };
};

// Password strength calculator
export const calculateStrength = (password: string): PasswordStrength => {
  let score = 0;
  const length = password.length;

  // Length scoring
  if (length >= 8) {
    score += 1;
  }
  if (length >= 12) {
    score += 1;
  }
  if (length >= 16) {
    score += 1;
  }
  if (length >= 20) {
    score += 1;
  }

  // Character variety scoring
  score += checkCharacterVariety(password);

  // Bonus points for high diversity
  const uniqueChars = new Set(password).size;
  if (uniqueChars > length * 0.7) {
    score += 1;
  }

  // Apply pattern penalties
  score -= applyPatternPenalties(password);

  // Ensure minimum score of 0
  score = Math.max(0, score);

  const strengthInfo = getStrengthLabel(score);
  return { score, ...strengthInfo };
};

// Enhanced entropy calculation
export const calculateEntropy = (password: string, charset: string): number => {
  if (!(charset && password)) {
    return 0;
  }
  return Math.log2(charset.length ** password.length);
};

// Time to crack estimation
export const estimateTimeToCrack = (entropy: number): string => {
  const secondsToCrack =
    2 ** (entropy - 1) / GENERATION_LIMITS.GUESSES_PER_SECOND;

  if (secondsToCrack < 60) {
    return "Instantly";
  }
  if (secondsToCrack < 3600) {
    return `${Math.round(secondsToCrack / 60)} minutes`;
  }
  if (secondsToCrack < 86_400) {
    return `${Math.round(secondsToCrack / 3600)} hours`;
  }
  if (secondsToCrack < 31_536_000) {
    return `${Math.round(secondsToCrack / 86_400)} days`;
  }
  if (secondsToCrack < 31_536_000_000) {
    return `${Math.round(secondsToCrack / 31_536_000)} years`;
  }
  return "Centuries";
};
