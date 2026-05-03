import { ChevronDown, Code, Copy, Eye, EyeOff, RefreshCw, Settings, Type } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import type { FormatMode, FormatSettings, PasswordHistory, ReadableStrength } from "../../types";
import { calculateEntropy, estimateTimeToCrack } from "../../utils/password-strength";
import {
  createStrengthObject,
  getStrengthColor,
  getStrengthDescription,
  getStrengthTextColor,
} from "../../utils/strength-helpers";

interface FormatGeneratorProps {
  onCopyToClipboard: (text: string) => void;
  onFormatGenerated: (format: string, historyEntry: PasswordHistory) => void;
  onSettingsChange: (settings: FormatSettings) => void;
  settings: FormatSettings;
}

const STRENGTH_ACCENT: Record<ReadableStrength, string> = {
  easy: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-400",
  moderate:
    "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700/50 dark:bg-blue-900/20 dark:text-blue-400",
  strong:
    "border-green-300 bg-green-50 text-green-700 dark:border-green-700/50 dark:bg-green-900/20 dark:text-green-400",
  ultra: "border-accent/40 bg-accent/5 text-accent",
};

const STRENGTH_ACTIVE: Record<ReadableStrength, string> = {
  easy: "border-amber-500 bg-amber-500 text-white",
  moderate: "border-blue-500 bg-blue-500 text-white",
  strong: "border-green-500 bg-green-500 text-white",
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
  const { generateFormatPassword, getCharacterSetFromFormat } = useFormatGenerator();

  const activePattern =
    settings.mode === "readable"
      ? (READABLE_PRESETS.find((p) => p.strength === settings.readableStrength)?.pattern ??
        settings.format)
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
      const preset = READABLE_PRESETS.find((p) => p.strength === settings.readableStrength);
      onSettingsChange({ ...settings, mode, format: preset?.pattern ?? settings.format });
      return;
    }
    onSettingsChange({ ...settings, mode });
  };

  const handleStrengthChange = (strength: ReadableStrength) => {
    const preset = READABLE_PRESETS.find((p) => p.strength === strength);
    if (preset) {
      onSettingsChange({ ...settings, readableStrength: strength, format: preset.pattern });
    }
  };

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
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-accent" />
          Format Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-6">
        {/* Mode Toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Mode</Label>
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              className={`flex flex-1 items-center justify-center gap-2 border-r border-border py-2.5 text-sm font-medium transition-colors ${
                settings.mode === "readable"
                  ? "bg-accent text-accent-foreground"
                  : "bg-background hover:bg-muted"
              }`}
              onClick={() => handleModeChange("readable")}
              type="button"
            >
              <Type className="h-4 w-4" />
              Readable
            </button>
            <button
              className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                settings.mode === "custom"
                  ? "bg-accent text-accent-foreground"
                  : "bg-background hover:bg-muted"
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
            <Label className="text-sm font-medium">Strength Level</Label>
            <div className="grid grid-cols-2 gap-2">
              {READABLE_PRESETS.map((preset) => {
                const isActive = settings.readableStrength === preset.strength;
                return (
                  <button
                    className={`rounded-lg border p-3 text-left transition-all ${
                      isActive
                        ? STRENGTH_ACTIVE[preset.strength]
                        : `${STRENGTH_ACCENT[preset.strength]} hover:opacity-90`
                    }`}
                    key={preset.strength}
                    onClick={() => handleStrengthChange(preset.strength)}
                    type="button"
                  >
                    <div className="text-sm font-medium">{preset.label}</div>
                    <div
                      className={`mt-0.5 text-xs leading-snug ${isActive ? "opacity-75" : "opacity-60"}`}
                    >
                      {preset.description}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2.5">
              <div className="mb-1 text-[10px] text-muted-foreground">Active Pattern</div>
              <code className="font-mono text-xs">{activePattern}</code>
            </div>
          </div>
        ) : (
          <>
            {/* Custom Format Pattern */}
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="format">
                Format Pattern
              </Label>
              <Input
                className="font-mono text-sm"
                id="format"
                onChange={(e) => onSettingsChange({ ...settings, format: e.target.value })}
                placeholder="e.g., 2u4l2d2{#$%}"
                value={settings.format}
              />
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  <strong>Tokens:</strong> Nu (uppercase), Nl (lowercase), Nd (digits), N{"{chars}"}{" "}
                  (custom)
                </p>
                <p>
                  <strong>Example:</strong>{" "}
                  <code className="rounded bg-muted px-1 font-mono">3u2l4d</code>
                  {" → "}
                  <code className="rounded bg-muted px-1 font-mono">ABCde1234</code>
                </p>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Templates</Label>
              <Select onValueChange={(value) => onSettingsChange({ ...settings, format: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a template…" />
                </SelectTrigger>
                <SelectContent>
                  {settings.templates.map((template) => (
                    <SelectItem key={template.name} value={template.pattern}>
                      <div className="flex flex-col">
                        <span className="font-medium">{template.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">
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
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted">
                <span>Format Guide</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden">
                <div className="mt-1 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">2u</code>
                      <span className="text-xs text-muted-foreground">2 uppercase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">4l</code>
                      <span className="text-xs text-muted-foreground">4 lowercase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">3d</code>
                      <span className="text-xs text-muted-foreground">3 digits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                        2{"{#$%}"}
                      </code>
                      <span className="text-xs text-muted-foreground">2 from custom set</span>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-background/80 p-3">
                    <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">
                      Popular Patterns
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>
                        <code className="font-mono text-foreground">4u4l4d</code> — Strong
                        alphanumeric
                      </div>
                      <div>
                        <code className="font-mono text-foreground">2u6l2d2{"{!@#}"}</code> —
                        Complex mixed
                      </div>
                      <div>
                        <code className="font-mono text-foreground">8l4d</code> — Simple memorable
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}

        {/* Generate Button */}
        <Button className="w-full" data-generate-button onClick={handleGenerate} size="lg">
          <RefreshCw />
          Generate {settings.mode === "readable" ? "Readable" : "Format"} Password
        </Button>

        {/* Result */}
        {generatedFormat && outputStrength ? (
          <div className="space-y-3 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Result</span>
              <span
                className={`text-xs font-semibold ${getStrengthTextColor(outputStrength.label)}`}
              >
                {outputStrength.label}
              </span>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(outputStrength.label)}`}
                style={{ width: `${outputStrength.score * 10}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Input
                className="flex-1 font-mono text-sm font-medium"
                readOnly
                type={showPassword ? "text" : "password"}
                value={generatedFormat}
              />
              <Button
                onClick={() => setShowPassword((prev) => !prev)}
                size="icon"
                variant="outline"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => onCopyToClipboard(generatedFormat)}
                size="icon"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {getStrengthDescription(outputStrength.label, "format")}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-background/80 px-3 py-2">
                <div className="mb-0.5 text-[10px] text-muted-foreground">Entropy</div>
                <div className="font-mono font-medium">
                  {Math.round(outputStrength.entropy)} bits
                </div>
              </div>
              <div className="rounded-lg bg-background/80 px-3 py-2">
                <div className="mb-0.5 text-[10px] text-muted-foreground">Time to crack</div>
                <div className="font-mono font-medium">{outputStrength.timeToCrack}</div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
