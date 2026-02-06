import { ChevronDown, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { usePasswordGenerator } from "../../hooks/use-password-generator";
import type { PasswordHistory, PasswordSettings } from "../../types";
import {
  calculateEntropy,
  calculateStrength,
  estimateTimeToCrack,
} from "../../utils/password-strength";
import {
  getStrengthColor,
  getStrengthDescription,
  getStrengthTextColor,
} from "../../utils/strength-helpers";

interface PasswordGeneratorProps {
  settings: PasswordSettings;
  onSettingsChange: (settings: PasswordSettings) => void;
  onPasswordGenerated: (
    password: string,
    historyEntry: PasswordHistory
  ) => void;
  onCopyToClipboard: (text: string) => void;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

export function PasswordGenerator({
  settings,
  onSettingsChange,
  onPasswordGenerated,
  onCopyToClipboard,
  isGenerating,
  onGeneratingChange,
}: PasswordGeneratorProps) {
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const { generatePassword, getCharacterSet } = usePasswordGenerator();

  const handleGenerate = () => {
    onGeneratingChange(true);
    generatePassword(settings, (password, historyEntry) => {
      setGeneratedPassword(password);
      onPasswordGenerated(password, historyEntry);
      onGeneratingChange(false);
    });
  };

  const outputStrength = useMemo(() => {
    if (!generatedPassword) {
      return null;
    }
    const strength = calculateStrength(generatedPassword);
    const charset = getCharacterSet(settings);
    const entropy = calculateEntropy(generatedPassword, charset);
    const timeToCrack = estimateTimeToCrack(entropy);
    return { ...strength, entropy, timeToCrack };
  }, [generatedPassword, settings, getCharacterSet]);

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
          {/* Password Length */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-xs uppercase tracking-wider">
                Length
              </Label>
              <div className="border-2 border-foreground bg-background px-2.5 py-0.5 text-center font-bold font-mono text-sm tabular-nums">
                {settings.length}
              </div>
            </div>
            <Slider
              className="w-full"
              max={128}
              min={4}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, length: value[0] })
              }
              step={1}
              value={[settings.length]}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>Min: 4</span>
              <span>Max: 128</span>
            </div>
          </div>

          {/* Character Types */}
          <div className="space-y-3">
            <Label className="font-bold text-xs uppercase tracking-wider">
              Characters
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "uppercase", label: "Upper", hint: "A-Z", key: "includeUppercase" as const },
                { id: "lowercase", label: "Lower", hint: "a-z", key: "includeLowercase" as const },
                { id: "numbers", label: "Numbers", hint: "0-9", key: "includeNumbers" as const },
                { id: "symbols", label: "Symbols", hint: "!@#$", key: "includeSymbols" as const },
              ].map((item) => (
                <div
                  className="flex items-center justify-between border-2 border-foreground bg-background p-2.5"
                  key={item.id}
                >
                  <Label className="flex items-baseline gap-1.5 pr-2" htmlFor={item.id}>
                    <span className="font-bold text-xs">{item.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{item.hint}</span>
                  </Label>
                  <Switch
                    checked={settings[item.key]}
                    id={item.id}
                    onCheckedChange={(checked) =>
                      onSettingsChange({ ...settings, [item.key]: !!checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible>
            <CollapsibleTrigger className="group flex w-full items-center justify-between border-2 border-foreground bg-secondary p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground">
              <span className="font-bold text-xs uppercase tracking-wider">
                Advanced
              </span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-0 space-y-3 border-2 border-foreground border-t-0 bg-card p-4">
              <div>
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider" htmlFor="custom">
                  Custom Characters
                </Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  id="custom"
                  onChange={(e) =>
                    onSettingsChange({ ...settings, customCharacters: e.target.value })
                  }
                  placeholder="Add custom characters..."
                  value={settings.customCharacters}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.excludeSimilar}
                    id="exclude-similar"
                    onCheckedChange={(checked) =>
                      onSettingsChange({ ...settings, excludeSimilar: !!checked })
                    }
                  />
                  <Label className="cursor-pointer text-xs" htmlFor="exclude-similar">
                    Exclude similar (0,O,1,l,I)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.excludeAmbiguous}
                    id="exclude-ambiguous"
                    onCheckedChange={(checked) =>
                      onSettingsChange({ ...settings, excludeAmbiguous: !!checked })
                    }
                  />
                  <Label className="cursor-pointer text-xs" htmlFor="exclude-ambiguous">
                    Exclude ambiguous symbols
                  </Label>
                </div>
              </div>

              <div className="flex items-center gap-2 border-foreground/20 border-t-2 pt-3">
                <Switch
                  checked={settings.requireEachCharacterType}
                  id="require-each-type"
                  onCheckedChange={(checked) =>
                    onSettingsChange({ ...settings, requireEachCharacterType: !!checked })
                  }
                />
                <Label className="cursor-pointer text-xs" htmlFor="require-each-type">
                  Enforce each selected type
                </Label>
              </div>

              {settings.includeNumbers || settings.includeSymbols ? (
                <div className="space-y-3 border-foreground/20 border-t-2 pt-3">
                  <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                    Minimums
                  </div>
                  {settings.includeNumbers ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Min Numbers</Label>
                        <Badge variant="outline">{settings.minNumbers || 1}</Badge>
                      </div>
                      <Slider
                        className="w-full"
                        max={Math.min(5, Math.floor(settings.length / 2))}
                        min={0}
                        onValueChange={(value) =>
                          onSettingsChange({ ...settings, minNumbers: value[0] })
                        }
                        step={1}
                        value={[settings.minNumbers || 1]}
                      />
                    </div>
                  ) : null}
                  {settings.includeSymbols ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Min Symbols</Label>
                        <Badge variant="outline">{settings.minSymbols || 1}</Badge>
                      </div>
                      <Slider
                        className="w-full"
                        max={Math.min(5, Math.floor(settings.length / 2))}
                        min={0}
                        onValueChange={(value) =>
                          onSettingsChange({ ...settings, minSymbols: value[0] })
                        }
                        step={1}
                        value={[settings.minSymbols || 1]}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        className="w-full"
        data-generate-button
        disabled={isGenerating}
        onClick={handleGenerate}
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="mr-2 animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
            Generating...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Password
          </>
        )}
      </Button>

      {/* Result */}
      {generatedPassword && outputStrength ? (
        <div className="border-2 border-foreground bg-card shadow-brutal">
          {/* Result Header */}
          <div className="flex items-center justify-between border-foreground border-b-2 px-4 py-3 sm:px-5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Output
            </span>
            <span
              className={`font-bold text-[10px] uppercase tracking-wider ${getStrengthTextColor(outputStrength.label)}`}
            >
              {outputStrength.label}
            </span>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            {/* Strength Bar */}
            <div className="h-1.5 w-full bg-muted">
              <div
                className={`h-full transition-all duration-500 ${getStrengthColor(outputStrength.label)}`}
                style={{ width: `${outputStrength.score * 10}%` }}
              />
            </div>

            {/* Password Display */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  className="pr-2 font-bold font-mono text-sm"
                  readOnly
                  type={showPassword ? "text" : "password"}
                  value={generatedPassword}
                />
              </div>
              <Button
                className="shrink-0"
                onClick={() => setShowPassword((prev) => !prev)}
                size="icon"
                variant="outline"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                className="shrink-0"
                onClick={() => onCopyToClipboard(generatedPassword)}
                size="icon"
                variant="outline"
                aria-label="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {getStrengthDescription(outputStrength.label, "password")}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="border-2 border-foreground bg-background p-2.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                  Entropy
                </div>
                <div className="font-bold font-mono text-sm">
                  {Math.round(outputStrength.entropy)}
                  <span className="ml-0.5 text-[10px] text-muted-foreground font-normal">bits</span>
                </div>
              </div>
              <div className="border-2 border-foreground bg-background p-2.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                  Crack Time
                </div>
                <div className="font-bold font-mono text-sm">
                  {outputStrength.timeToCrack}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
