import { ChevronDown, Copy, Eye, EyeOff, Key, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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

  // Derive strength once for output display
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <Key className="h-4 w-4 text-accent-foreground" />
          </div>
          Password Generator
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed sm:text-sm">
          Configure character types and length, then generate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-8">
        <div className="space-y-5 sm:space-y-6">
          {/* Password Length */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-sm uppercase tracking-wider">
                Length
              </Label>
              <Badge variant="outline">{settings.length} chars</Badge>
            </div>
            <Slider
              className="w-full"
              max={128}
              min={4}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  length: value[0],
                })
              }
              step={1}
              value={[settings.length]}
            />
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>4</span>
              <span>128</span>
            </div>
          </div>

          {/* Character Types */}
          <div className="space-y-3">
            <Label className="font-bold text-sm uppercase tracking-wider">
              Character Types
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="flex items-center justify-between border-2 border-foreground p-2.5 sm:p-3">
                <Label className="flex flex-col pr-2" htmlFor="uppercase">
                  <span className="font-bold text-xs sm:text-sm">
                    Uppercase
                  </span>
                  <span className="font-mono text-muted-foreground text-xs">
                    A-Z
                  </span>
                </Label>
                <Switch
                  checked={settings.includeUppercase}
                  id="uppercase"
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeUppercase: !!checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between border-2 border-foreground p-2.5 sm:p-3">
                <Label className="flex flex-col pr-2" htmlFor="lowercase">
                  <span className="font-bold text-xs sm:text-sm">
                    Lowercase
                  </span>
                  <span className="font-mono text-muted-foreground text-xs">
                    a-z
                  </span>
                </Label>
                <Switch
                  checked={settings.includeLowercase}
                  id="lowercase"
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeLowercase: !!checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between border-2 border-foreground p-2.5 sm:p-3">
                <Label className="flex flex-col pr-2" htmlFor="numbers">
                  <span className="font-bold text-xs sm:text-sm">Numbers</span>
                  <span className="font-mono text-muted-foreground text-xs">
                    0-9
                  </span>
                </Label>
                <Switch
                  checked={settings.includeNumbers}
                  id="numbers"
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeNumbers: !!checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between border-2 border-foreground p-2.5 sm:p-3">
                <Label className="flex flex-col pr-2" htmlFor="symbols">
                  <span className="font-bold text-xs sm:text-sm">Symbols</span>
                  <span className="font-mono text-muted-foreground text-xs">
                    !@#$%
                  </span>
                </Label>
                <Switch
                  checked={settings.includeSymbols}
                  id="symbols"
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeSymbols: !!checked,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between border-2 border-foreground bg-secondary p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground">
              <span className="font-bold text-sm uppercase tracking-wider">
                Advanced Options
              </span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-0 space-y-3 border-2 border-foreground border-t-0 bg-secondary/50 p-4">
              <div>
                <Label
                  className="text-muted-foreground text-xs uppercase tracking-wider"
                  htmlFor="custom"
                >
                  Custom Characters
                </Label>
                <Input
                  className="mt-1 font-mono text-sm"
                  id="custom"
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      customCharacters: e.target.value,
                    })
                  }
                  placeholder="Add custom characters..."
                  value={settings.customCharacters}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.excludeSimilar}
                    id="exclude-similar"
                    onCheckedChange={(checked) =>
                      onSettingsChange({
                        ...settings,
                        excludeSimilar: !!checked,
                      })
                    }
                  />
                  <Label
                    className="cursor-pointer text-xs"
                    htmlFor="exclude-similar"
                  >
                    Exclude similar (0,O,1,l,I)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.excludeAmbiguous}
                    id="exclude-ambiguous"
                    onCheckedChange={(checked) =>
                      onSettingsChange({
                        ...settings,
                        excludeAmbiguous: !!checked,
                      })
                    }
                  />
                  <Label
                    className="cursor-pointer text-xs"
                    htmlFor="exclude-ambiguous"
                  >
                    Exclude ambiguous symbols
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-2 border-foreground/20 border-t-2 pt-3">
                <Switch
                  checked={settings.requireEachCharacterType}
                  id="require-each-type"
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      requireEachCharacterType: !!checked,
                    })
                  }
                />
                <Label
                  className="cursor-pointer text-xs"
                  htmlFor="require-each-type"
                >
                  Enforce each selected character type
                </Label>
              </div>

              {/* Minimum Requirements */}
              {settings.includeNumbers || settings.includeSymbols ? (
                <div className="space-y-3 border-foreground/20 border-t-2 pt-3">
                  <div className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
                    Minimum Requirements
                  </div>

                  {settings.includeNumbers ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Min Numbers</Label>
                        <Badge variant="outline">
                          {settings.minNumbers || 1}
                        </Badge>
                      </div>
                      <Slider
                        className="w-full"
                        max={Math.min(5, Math.floor(settings.length / 2))}
                        min={0}
                        onValueChange={(value) =>
                          onSettingsChange({
                            ...settings,
                            minNumbers: value[0],
                          })
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
                        <Badge variant="outline">
                          {settings.minSymbols || 1}
                        </Badge>
                      </div>
                      <Slider
                        className="w-full"
                        max={Math.min(5, Math.floor(settings.length / 2))}
                        min={0}
                        onValueChange={(value) =>
                          onSettingsChange({
                            ...settings,
                            minSymbols: value[0],
                          })
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

          {/* Generated Password Display */}
          {generatedPassword && outputStrength ? (
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
                    value={generatedPassword}
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
                  onClick={() => onCopyToClipboard(generatedPassword)}
                  size="icon"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 border-foreground/10 border-t pt-3 text-muted-foreground text-xs">
                <p className="text-muted-foreground text-xs">
                  {getStrengthDescription(outputStrength.label, "password")}
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
