import {
  ChevronDown,
  Code,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Type,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
  easy: "border-amber-600 bg-amber-600/10 text-amber-700 dark:border-amber-500 dark:text-amber-400",
  moderate: "border-blue-600 bg-blue-600/10 text-blue-700 dark:border-blue-500 dark:text-blue-400",
  strong: "border-green-600 bg-green-600/10 text-green-700 dark:border-green-500 dark:text-green-400",
  ultra: "border-accent bg-accent/10 text-accent",
};

const STRENGTH_ACTIVE: Record<ReadableStrength, string> = {
  easy: "border-amber-600 bg-amber-600 text-amber-50 dark:border-amber-500 dark:bg-amber-500 dark:text-amber-950",
  moderate: "border-blue-600 bg-blue-600 text-blue-50 dark:border-blue-500 dark:bg-blue-500 dark:text-blue-950",
  strong: "border-green-600 bg-green-600 text-green-50 dark:border-green-500 dark:bg-green-500 dark:text-green-950",
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

  const outputStrength = useMemo(() => {
    if (!generatedFormat) return null;
    const charset = getCharacterSetFromFormat(activePattern);
    const entropy = calculateEntropy(generatedFormat, charset);
    const strength = createStrengthObject(entropy);
    const timeToCrack = estimateTimeToCrack(entropy);
    return { ...strength, entropy, timeToCrack };
  }, [generatedFormat, activePattern, getCharacterSetFromFormat]);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="border-2 border-foreground bg-card shadow-brutal">
        <div className="border-foreground border-b-2 px-4 py-3 sm:px-5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            Configuration
          </span>
        </div>
        <div className="space-y-5 p-4 sm:space-y-6 sm:p-5">
          {/* Mode Toggle */}
          <div className="space-y-3">
            <Label className="font-bold text-xs uppercase tracking-wider">Mode</Label>
            <div className="grid grid-cols-2 gap-0 border-2 border-foreground">
              <button
                className={`flex items-center justify-center gap-2 border-foreground border-r p-3 font-bold text-xs uppercase tracking-wider transition-colors ${
                  settings.mode === "readable"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-card-foreground hover:bg-secondary"
                }`}
                onClick={() => handleModeChange("readable")}
                type="button"
              >
                <Type className="h-3.5 w-3.5" />
                Readable
              </button>
              <button
                className={`flex items-center justify-center gap-2 p-3 font-bold text-xs uppercase tracking-wider transition-colors ${
                  settings.mode === "custom"
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-card-foreground hover:bg-secondary"
                }`}
                onClick={() => handleModeChange("custom")}
                type="button"
              >
                <Code className="h-3.5 w-3.5" />
                Custom
              </button>
            </div>
          </div>

          {/* Readable Presets */}
          {settings.mode === "readable" ? (
            <div className="space-y-3">
              <Label className="font-bold text-xs uppercase tracking-wider">
                Strength Level
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {READABLE_PRESETS.map((preset) => {
                  const isActive = settings.readableStrength === preset.strength;
                  return (
                    <button
                      className={`border-2 p-2.5 text-left transition-all ${
                        isActive
                          ? STRENGTH_ACTIVE[preset.strength]
                          : `${STRENGTH_ACCENT[preset.strength]} hover:opacity-80`
                      }`}
                      key={preset.strength}
                      onClick={() => handleStrengthChange(preset.strength)}
                      type="button"
                    >
                      <div className="font-bold text-xs uppercase tracking-wider">
                        {preset.label}
                      </div>
                      <div className={`mt-1 text-[10px] leading-tight ${isActive ? "opacity-80" : "opacity-60"}`}>
                        {preset.description}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-2 border-foreground/30 bg-secondary/50 p-3">
                <div className="mb-1 font-bold text-[9px] text-muted-foreground uppercase tracking-widest">
                  Active Pattern
                </div>
                <code className="font-mono text-xs">{activePattern}</code>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label className="font-bold text-xs uppercase tracking-wider" htmlFor="format">
                  Format Pattern
                </Label>
                <Input
                  className="bg-background font-mono text-sm"
                  id="format"
                  onChange={(e) => onSettingsChange({ ...settings, format: e.target.value })}
                  placeholder="e.g., 2u4l2d2{#$%}"
                  value={settings.format}
                />
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <p>
                    <strong>Format:</strong> Nu (uppercase), Nl (lowercase), Nd (digits), N{"{chars}"} (custom)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-xs uppercase tracking-wider">Quick Templates</Label>
                <Select
                  onValueChange={(value) => onSettingsChange({ ...settings, format: value })}
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.templates.map((template) => (
                      <SelectItem key={template.name} value={template.pattern}>
                        <div className="flex flex-col">
                          <span className="font-bold">{template.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {template.pattern}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Collapsible>
                <CollapsibleTrigger className="group flex w-full items-center justify-between border-2 border-foreground bg-secondary p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground">
                  <span className="font-bold text-xs uppercase tracking-wider">Format Guide</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-0 space-y-3 border-2 border-foreground border-t-0 bg-card p-4">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { code: "2u", desc: "2 uppercase" },
                      { code: "4l", desc: "4 lowercase" },
                      { code: "3d", desc: "3 digits" },
                      { code: '2{#$%}', desc: "2 from set" },
                    ].map((item) => (
                      <div className="flex items-center gap-2" key={item.code}>
                        <code className="border-2 border-foreground bg-background px-2 py-0.5 font-mono text-[10px]">
                          {item.code}
                        </code>
                        <span className="text-muted-foreground text-[10px]">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <Button className="w-full" data-generate-button onClick={handleGenerate} size="lg">
        <RefreshCw className="mr-2 h-4 w-4" />
        Generate {settings.mode === "readable" ? "Readable" : "Format"} Password
      </Button>

      {/* Result */}
      {generatedFormat && outputStrength ? (
        <div className="border-2 border-foreground bg-card shadow-brutal">
          <div className="flex items-center justify-between border-foreground border-b-2 px-4 py-3 sm:px-5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Output</span>
            <span
              className={`font-bold text-[10px] uppercase tracking-wider ${getStrengthTextColor(outputStrength.label)}`}
            >
              {outputStrength.label}
            </span>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="h-1.5 w-full bg-muted">
              <div
                className={`h-full transition-all duration-500 ${getStrengthColor(outputStrength.label)}`}
                style={{ width: `${outputStrength.score * 10}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input className="pr-2 font-bold font-mono text-sm" readOnly type={showPassword ? "text" : "password"} value={generatedFormat} />
              </div>
              <Button className="shrink-0" onClick={() => setShowPassword((prev) => !prev)} size="icon" variant="outline" aria-label={showPassword ? "Hide" : "Show"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button className="shrink-0" onClick={() => onCopyToClipboard(generatedFormat)} size="icon" variant="outline" aria-label="Copy">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {getStrengthDescription(outputStrength.label, "format")}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="border-2 border-foreground bg-background p-2.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Entropy</div>
                <div className="font-bold font-mono text-sm">
                  {Math.round(outputStrength.entropy)}
                  <span className="ml-0.5 text-[10px] text-muted-foreground font-normal">bits</span>
                </div>
              </div>
              <div className="border-2 border-foreground bg-background p-2.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Crack Time</div>
                <div className="font-bold font-mono text-sm">{outputStrength.timeToCrack}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
