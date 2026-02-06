import { useCallback } from "react";
import { toast } from "sonner";
import type { FormatSettings, PasswordHistory } from "../types";
import { getSecureRandom } from "../utils/crypto";
import { calculateStrength } from "../utils/password-strength";

const DIGIT_REGEX = /\d/;

const CHARSETS: Record<string, string> = {
  u: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  l: "abcdefghijklmnopqrstuvwxyz",
  d: "0123456789",
};

function parseNumber(
  format: string,
  startIndex: number
): { numStr: string; nextIndex: number } {
  let numStr = "";
  let i = startIndex;
  while (i < format.length && DIGIT_REGEX.test(format[i])) {
    numStr += format[i];
    i++;
  }
  return { numStr, nextIndex: i };
}

function parseCustomCharset(
  format: string,
  startIndex: number
): { charset: string; nextIndex: number } {
  let i = startIndex + 1; // skip '{'
  let customSet = "";
  while (i < format.length && format[i] !== "}") {
    customSet += format[i];
    i++;
  }
  return { charset: customSet, nextIndex: i };
}

function resolveCharset(
  type: string,
  format: string,
  index: number
): { charset: string; nextIndex: number } {
  if (type === "{") {
    return parseCustomCharset(format, index);
  }
  return { charset: CHARSETS[type] ?? "", nextIndex: index };
}

function generateRandomChars(charset: string, count: number): string {
  let result = "";
  for (let j = 0; j < count; j++) {
    if (charset) {
      result += charset[getSecureRandom(charset.length)];
    }
  }
  return result;
}

function processFormatSegment(
  format: string,
  startIndex: number
): { chars: string; nextIndex: number } {
  const parsed = parseNumber(format, startIndex);
  let i = parsed.nextIndex;
  const count = Number.parseInt(parsed.numStr, 10);

  if (i >= format.length) {
    return { chars: "", nextIndex: i };
  }

  const type = format[i];
  const resolved = resolveCharset(type, format, i);
  i = resolved.nextIndex;

  if (type !== "{" && !CHARSETS[type]) {
    throw new Error(`Unknown format type: ${type}`);
  }

  return { chars: generateRandomChars(resolved.charset, count), nextIndex: i };
}

function buildPasswordFromFormat(format: string): string {
  let result = "";
  let i = 0;

  while (i < format.length) {
    if (DIGIT_REGEX.test(format[i])) {
      const segment = processFormatSegment(format, i);
      result += segment.chars;
      i = segment.nextIndex;
    }
    i++;
  }

  return result;
}

function collectCharsetFromFormat(format: string): string {
  let charset = "";
  let i = 0;
  while (i < format.length) {
    if (DIGIT_REGEX.test(format[i])) {
      const parsed = parseNumber(format, i);
      i = parsed.nextIndex;

      if (i >= format.length) {
        break;
      }

      const type = format[i];
      const resolved = resolveCharset(type, format, i);
      charset += resolved.charset;
      i = resolved.nextIndex;
    }
    i++;
  }
  return Array.from(new Set(charset)).join("");
}

export const useFormatGenerator = () => {
  const getCharacterSetFromFormat = useCallback(
    (format: string): string => collectCharsetFromFormat(format),
    []
  );

  const generateFormatPassword = useCallback(
    (
      settings: FormatSettings,
      onSuccess: (password: string, historyEntry: PasswordHistory) => void
    ) => {
      try {
        const result = buildPasswordFromFormat(settings.format);
        const strength = calculateStrength(result);

        const historyEntry: PasswordHistory = {
          id: Date.now().toString(),
          password: result,
          type: "format",
          createdAt: new Date(),
          strength: { score: strength.score, label: strength.label },
        };

        onSuccess(result, historyEntry);
        toast.success(`${strength.label} format password generated!`);
      } catch {
        toast.error(
          "Invalid format. Use: Nu (uppercase), Nl (lowercase), Nd (digits), N{chars} (custom)"
        );
      }
    },
    []
  );

  return {
    generateFormatPassword,
    getCharacterSetFromFormat,
  };
};
