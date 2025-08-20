import { GENERATION_LIMITS } from '../constants/generator';
import type { PasswordStrength } from '../types';

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

  // Character variety
  if (/[a-z]/.test(password)) {
    score += 1;
  }
  if (/[A-Z]/.test(password)) {
    score += 1;
  }
  if (/[0-9]/.test(password)) {
    score += 1;
  }
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  // Bonus points for high diversity
  const uniqueChars = new Set(password).size;
  if (uniqueChars > length * 0.7) {
    score += 1;
  }

  // Pattern detection penalties
  if (/(.)\1{2,}/.test(password)) {
    score -= 1; // Repeated characters
  }
  if (/012|123|234|345|456|567|678|789|890/.test(password)) {
    score -= 1; // Sequential numbers
  }
  if (
    /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(
      password
    )
  ) {
    score -= 1; // Sequential letters
  }

  // Ensure minimum score of 0
  score = Math.max(0, score);

  if (score <= 2) {
    return { score, label: 'Weak', color: 'text-red-600' };
  }
  if (score <= 4) {
    return { score, label: 'Fair', color: 'text-yellow-600' };
  }
  if (score <= 6) {
    return { score, label: 'Good', color: 'text-blue-600' };
  }
  if (score <= 8) {
    return { score, label: 'Strong', color: 'text-green-600' };
  }
  return { score, label: 'Excellent', color: 'text-green-700' };
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
    return 'Instantly';
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
  return 'Centuries';
};
