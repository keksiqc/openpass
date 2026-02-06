import { useCallback } from "react";
import { toast } from "sonner";
import type { PassphraseSettings, PasswordHistory } from "../types";
import { getSecureRandom } from "../utils/crypto";
import { calculateStrength } from "../utils/password-strength";
import { COMMON_WORDS } from "../utils/words";

function applyWordCase(
  word: string,
  wordCase: PassphraseSettings["wordCase"]
): string {
  switch (wordCase) {
    case "uppercase":
      return word.toUpperCase();
    case "capitalize":
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    case "mixed":
      return Math.random() > 0.5 ? word.toUpperCase() : word.toLowerCase();
    default:
      return word.toLowerCase();
  }
}

function generateWords(
  settings: PassphraseSettings,
  wordSource: string[]
): string[] {
  const words: string[] = [];
  for (let i = 0; i < settings.wordCount; i++) {
    const word = wordSource[getSecureRandom(wordSource.length)];
    words.push(applyWordCase(word, settings.wordCase));
  }
  return words;
}

function insertRandomNumbers(words: string[]): string[] {
  const result = [...words];
  const numberCount = 1 + getSecureRandom(2); // 1-2 numbers for random insertion
  for (let i = 0; i < numberCount; i++) {
    const randomWordIndex = getSecureRandom(result.length);
    const randomNumber = getSecureRandom(10).toString();
    if (result[randomWordIndex].length > 0 && Math.random() > 0.5) {
      const insertPos = getSecureRandom(result[randomWordIndex].length + 1);
      result[randomWordIndex] =
        result[randomWordIndex].slice(0, insertPos) +
        randomNumber +
        result[randomWordIndex].slice(insertPos);
    } else {
      result[randomWordIndex] += randomNumber;
    }
  }
  return result;
}

function joinWords(words: string[], separator: string): string {
  return words.join(separator === "none" ? "" : separator);
}

function appendNumbers(passphrase: string): string {
  let result = passphrase;
  const numberCount = 2 + getSecureRandom(3); // 2-4 numbers appended
  for (let i = 0; i < numberCount; i++) {
    result += getSecureRandom(10);
  }
  return result;
}

export const usePassphraseGenerator = () => {
  const generatePassphrase = useCallback(
    (
      settings: PassphraseSettings,
      onSuccess: (passphrase: string, historyEntry: PasswordHistory) => void
    ) => {
      try {
        const wordSource =
          settings.customWords && settings.customWords.length > 0
            ? settings.customWords
            : COMMON_WORDS;

        const words = generateWords(settings, wordSource);

        let passphrase: string;
        if (settings.includeNumbers && settings.insertNumbersRandomly) {
          const wordsWithNumbers = insertRandomNumbers(words);
          passphrase = joinWords(wordsWithNumbers, settings.separator);
        } else {
          passphrase = joinWords(words, settings.separator);
          if (settings.includeNumbers) {
            passphrase = appendNumbers(passphrase);
          }
        }

        const entropy = Math.log2(wordSource.length ** settings.wordCount);
        const strength = calculateStrength(passphrase);

        // Create history entry
        const historyEntry: PasswordHistory = {
          id: Date.now().toString(),
          password: passphrase,
          type: "passphrase",
          createdAt: new Date(),
          strength: { score: strength.score, label: strength.label },
        };

        onSuccess(passphrase, historyEntry);

        toast.success(
          `${strength.label} passphrase generated! (${Math.round(entropy)} bits entropy)`
        );
      } catch {
        toast.error("Failed to generate passphrase");
      }
    },
    []
  );

  return {
    generatePassphrase,
  };
};
