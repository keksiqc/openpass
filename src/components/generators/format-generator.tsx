import {
  ChevronDown,
  Code,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  Type,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { READABLE_PRESETS } from "../../constants/generator";
import { useFormatGenerator } from "../../hooks/use-format-generator";
import type {
  FormatMode,
  FormatSettings,
  PasswordHistory,
  ReadableStrength,
} from "../../types";
import {
  calculateEntropy,
  estimateTimeToCrack,
} from "../../utils/password-strength";
import {
  createStrengthObject,
  getStrengthColor,
  getStrengthDescription,
  getStrengthTextColor,
} from "../../utils/strength-helpers";

interface FormatGeneratorProps {
  settings: FormatSettings;
  onSettingsChange: (settings: FormatSettings) => void;
  onFormatGenerated: (format: string, historyEntry: PasswordHistory) => void;
  onCopyToClipboard: (text: string) => void;
}

const STRENGTH_ACCENT: Record<ReadableStrength, string> = {
  easy: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  moderate: "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  strong: "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400",
  ultra: "border-accent bg-accent/10 text-accent",
};

const STRENGTH_ACTIVE: Record<ReadableStrength, string> = {
  easy: "border-amber-500 bg-amber-500 text-amber-950",
  moderate: "border-blue-500 bg-blue-500 text-white",
  strong: "border-green-500 bg-green-500 text-green-950",
  ultra: "border-accent bg-accent text-accent-foreground",
};

export function FormatGenerator({
  settings,
  onSettingsChange,
  onFormatGenerated,
  onCopyToClipboard,
}: FormatGeneratorProps) {
  const [generatedFormat, setGeneratedFormat] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const { generateFormatPassword, getCharacterSetFromFormat } =
    useFormatGenerator();

  const activePattern =
    settings.mode === "readable"
      ? (READABLE_PRESETS.find((p) => p.strength === settings.readableStrength)
          ?.pattern ?? settings.format)
      : settings.format;

  const handleGenerate = () => {
    const genSettings = { ...settings, format: activePattern };
    generateFormatPassword(genSettings, (format, historyEntry) => {
      setGeneratedFormat(format);
      onFormatGenerated(format, historyEntry);
    });
  };

  const handleModeChange = (mode: FormatMode) => {
    if (mode === "readable") {
      const preset = READABLE_PRESETS.find(
        (p) => p.strength === settings.readableStrength
      );
      onSettingsChange({
        ...settings,
        mode,
        format: preset?.pattern ?? settings.format,
      });
      return;
    }
    onSettingsChange({ ...settings, mode });
  };

  const handleStrengthChange = (strength: ReadableStrength) => {
    const preset = READABLE_PRESETS.find((p) => p.strength === strength);
    if (preset) {
      onSettingsChange({
        ...settings,
        readableStrength: strength,
        format: preset.pattern,
      });
    }
  };

  // Derive strength once for output display
  const outputStrength = useMemo(() => {
    if (!generatedFormat) {
      return null;
    }
    const charset = getCharacterSetFromFormat(activePattern);
    const entropy = calculateEntropy(generatedFormat, charset);
    const strength = createStrengthObject(entropy);
    const timeToCrack = estimateTimeToCrack(entropy);
    return { ...strength, entropy, timeToCrack };
  }, [generatedFormat, activePattern, getCharacterSetFromFormat]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <Settings className="h-4 w-4 text-accent-foreground" />
          </div>
          Format Generator
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed sm:text-sm">
          Readable presets or custom format patterns for structured passwords.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-8">
        <div className="space-y-5 sm:space-y-6">
          {/* Mode Toggle */}
          <div className="space-y-3">
            <Label className="font-bold text-sm uppercase tracking-wider">
              Mode
            </Label>
            <div className="grid grid-cols-2 gap-0 border-2 border-foreground">
              <button
                className={`flex items-center justify-center gap-2 border-foreground border-r p-3 font-bold text-sm uppercase tracking-wider transition-colors ${
                  settings.mode === "readable"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card hover:bg-secondary"
                }`}
                onClick={() => handleModeChange("readable")}
                type="button"
              >
                <Type className="h-4 w-4" />
                Readable
              </button>
              <button
                className={`flex items-center justify-center gap-2 p-3 font-bold text-sm uppercase tracking-wider transition-colors ${
                  settings.mode === "custom"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card hover:bg-secondary"
                }`}
                onClick={() => handleModeChange("custom")}
                type="button"
              >
                <Code className="h-4 w-4" />
                Custom
              </button>
            </div>
          </div>

          {/* Readable Presets */}
          {settings.mode === "readable" ? (
            <div className="space-y-3">
              <Label className="font-bold text-sm uppercase tracking-wider">
                Strength Level
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {READABLE_PRESETS.map((preset) => {
                  const isActive =
                    settings.readableStrength === preset.strength;
                  return (
                    <button
                      className={`border-2 p-2.5 text-left transition-all sm:p-3 ${
                        isActive
                          ? STRENGTH_ACTIVE[preset.strength]
                          : `${STRENGTH_ACCENT[preset.strength]} hover:opacity-80`
                      }`}
                      key={preset.strength}
                      onClick={() => handleStrengthChange(preset.strength)}
                      type="button"
                    >
                      <div className="font-bold text-xs uppercase tracking-wider sm:text-sm">
                        {preset.label}
                      </div>
                      <div
                        className={`mt-1 text-[10px] leading-tight ${isActive ? "opacity-80" : "opacity-60"}`}
                      >
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-2 border-foreground/30 bg-secondary/50 p-3">
                <div className="mb-1 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                  Active Pattern
                </div>
                <code className="font-mono text-xs">{activePattern}</code>
              </div>
            </div>
          ) : (
            <>
              {/* Custom Format Pattern Input */}
              <div className="space-y-3">
                <Label
                  className="font-bold text-sm uppercase tracking-wider"
                  htmlFor="format"
                >
                  Format Pattern
                </Label>
                <Input
                  className="bg-card font-mono text-sm"
                  id="format"
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      format: e.target.value,
                    })
                  }
                  placeholder="e.g., 2u4l2d2{#$%}"
                  value={settings.format}
                />
                <div className="space-y-1 text-muted-foreground text-xs">
                  <p>
                    <strong>Format:</strong> Nu (uppercase), Nl (lowercase), Nd
                    (digits), N{"{chars}"} (custom)
                  </p>
                  <p>
                    <strong>Example:</strong>{" "}
                    <code className="border border-foreground/30 bg-secondary px-1 font-mono">
                      3u2l4d
                    </code>{" "}
                    →{" "}
                    <code className="border border-foreground/30 bg-secondary px-1 font-mono">
                      ABCde1234
                    </code>
                  </p>
                </div>
              </div>

              {/* Quick Templates */}
              <div className="space-y-3">
                <Label className="font-bold text-sm uppercase tracking-wider">
                  Quick Templates
                </Label>
                <Select
                  onValueChange={(value) =>
                    onSettingsChange({
                      ...settings,
                      format: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full bg-card">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.templates.map((template) => (
                      <SelectItem key={template.name} value={template.pattern}>
                        <div className="flex flex-col">
                          <span className="font-bold">{template.name}</span>
                          <span className="font-mono text-muted-foreground text-xs">
                            {template.pattern}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format Guide */}
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between border-2 border-foreground bg-secondary p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground">
                  <span className="font-bold text-sm uppercase tracking-wider">
                    Format Guide
                  </span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-0 space-y-3 border-2 border-foreground border-t-0 bg-secondary/50 p-4">
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <code className="border-2 border-foreground bg-background px-2 py-1 font-mono text-xs">
                        2u
                      </code>
                      <span className="text-muted-foreground">
                        2 uppercase letters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="border-2 border-foreground bg-background px-2 py-1 font-mono text-xs">
                        4l
                      </code>
                      <span className="text-muted-foreground">
                        4 lowercase letters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="border-2 border-foreground bg-background px-2 py-1 font-mono text-xs">
                        3d
                      </code>
                      <span className="text-muted-foreground">3 digits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="border-2 border-foreground bg-background px-2 py-1 font-mono text-xs">
                        2{"{#$%}"}
                      </code>
                      <span className="text-muted-foreground">
                        2 from custom set
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 border-2 border-foreground bg-background p-3">
                    <div className="mb-2 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                      Popular Patterns:
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>
                        <code className="font-mono">4u4l4d</code> → Strong
                        alphanumeric (12 chars)
                      </div>
                      <div>
                        <code className="font-mono">2u6l2d2{"{!@#}"}</code> →
                        Complex mixed (12 chars)
                      </div>
                      <div>
                        <code className="font-mono">8l4d</code> → Simple
                        memorable (12 chars)
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* Generate Button */}
          <Button
            className="w-full"
            data-generate-button
            onClick={handleGenerate}
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate {settings.mode === "readable" ? "Readable" : "Format"}{" "}
            Password
          </Button>

          {/* Generated Format Password Display */}
          {generatedFormat && outputStrength ? (
            <div className="space-y-4 border-2 border-accent bg-accent/5 p-4 shadow-brutal-accent sm:p-5">
              <div className="flex items-center justify-between">
                <Label className="font-bold font-display text-sm uppercase tracking-tight">
                  Result
                </Label>
                <span
                  className={`font-bold text-xs uppercase tracking-wider ${getStrengthTextColor(outputStrength.label)}`}
                >
                  {outputStrength.label}
                </span>
              </div>

              {/* Strength Bar */}
              <div className="h-2 w-full border border-foreground/20 bg-muted">
                <div
                  className={`h-full transition-all duration-300 ${getStrengthColor(outputStrength.label)}`}
                  style={{
                    width: `${outputStrength.score * 10}%`,
                  }}
                />
              </div>

              {/* Password Display */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    className="pr-2 font-bold font-mono text-sm"
                    readOnly
                    type={showPassword ? "text" : "password"}
                    value={generatedFormat}
                  />
                </div>
                <Button
                  className="shrink-0"
                  onClick={() => setShowPassword((prev) => !prev)}
                  size="icon"
                  variant="outline"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  className="shrink-0"
                  onClick={() => onCopyToClipboard(generatedFormat)}
                  size="icon"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 border-foreground/10 border-t pt-3">
                <p className="text-muted-foreground text-xs">
                  {getStrengthDescription(outputStrength.label, "format")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="border border-foreground/20 bg-background p-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Entropy
                  </div>
                  <div className="font-bold">
                    {Math.round(outputStrength.entropy)} bits
                  </div>
                </div>
                <div className="border border-foreground/20 bg-background p-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Time to crack
                  </div>
                  <div className="font-bold">{outputStrength.timeToCrack}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
