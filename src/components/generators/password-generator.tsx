import { ChevronDown, Copy, Eye, EyeOff, Key, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  isGenerating: boolean;
  onCopyToClipboard: (text: string) => void;
  onGeneratingChange: (generating: boolean) => void;
  onPasswordGenerated: (password: string, historyEntry: PasswordHistory) => void;
  onSettingsChange: (settings: PasswordSettings) => void;
  settings: PasswordSettings;
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-4 w-4 text-accent" />
          Password Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-6">
        {/* Password Length */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Length</Label>
            <Badge variant="secondary">{settings.length} chars</Badge>
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
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Character Types */}
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Character Types</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <Label className="flex flex-col pr-2" htmlFor="uppercase">
                <span className="text-sm font-medium">Uppercase</span>
                <span className="font-mono text-xs text-muted-foreground">A–Z</span>
              </Label>
              <Switch
                checked={settings.includeUppercase}
                id="uppercase"
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, includeUppercase: !!checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <Label className="flex flex-col pr-2" htmlFor="lowercase">
                <span className="text-sm font-medium">Lowercase</span>
                <span className="font-mono text-xs text-muted-foreground">a–z</span>
              </Label>
              <Switch
                checked={settings.includeLowercase}
                id="lowercase"
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, includeLowercase: !!checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <Label className="flex flex-col pr-2" htmlFor="numbers">
                <span className="text-sm font-medium">Numbers</span>
                <span className="font-mono text-xs text-muted-foreground">0–9</span>
              </Label>
              <Switch
                checked={settings.includeNumbers}
                id="numbers"
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, includeNumbers: !!checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <Label className="flex flex-col pr-2" htmlFor="symbols">
                <span className="text-sm font-medium">Symbols</span>
                <span className="font-mono text-xs text-muted-foreground">!@#$%</span>
              </Label>
              <Switch
                checked={settings.includeSymbols}
                id="symbols"
                onCheckedChange={(checked) =>
                  onSettingsChange({ ...settings, includeSymbols: !!checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted">
            <span>Advanced Options</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden">
            <div className="mt-1 space-y-3 rounded-lg border border-border bg-muted/20 p-4">
              <div>
                <Label className="text-xs text-muted-foreground" htmlFor="custom">
                  Custom Characters
                </Label>
                <Input
                  className="mt-1.5 font-mono text-sm"
                  id="custom"
                  onChange={(e) =>
                    onSettingsChange({ ...settings, customCharacters: e.target.value })
                  }
                  placeholder="Add custom characters..."
                  value={settings.customCharacters}
                />
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.excludeSimilar}
                    id="exclude-similar"
                    onCheckedChange={(checked) =>
                      onSettingsChange({ ...settings, excludeSimilar: !!checked })
                    }
                  />
                  <Label className="cursor-pointer text-xs" htmlFor="exclude-similar">
                    Exclude similar characters (0, O, 1, l, I)
                  </Label>
                </div>

                <div className="flex items-center gap-3">
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

              <div className="flex items-center gap-3 border-t border-border pt-3">
                <Switch
                  checked={settings.requireEachCharacterType}
                  id="require-each-type"
                  onCheckedChange={(checked) =>
                    onSettingsChange({ ...settings, requireEachCharacterType: !!checked })
                  }
                />
                <Label className="cursor-pointer text-xs" htmlFor="require-each-type">
                  Enforce each selected character type
                </Label>
              </div>

              {settings.includeNumbers || settings.includeSymbols ? (
                <div className="space-y-3 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Minimum Requirements</p>

                  {settings.includeNumbers ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Min Numbers</Label>
                        <Badge variant="secondary">{settings.minNumbers || 1}</Badge>
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
                        <Badge variant="secondary">{settings.minSymbols || 1}</Badge>
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
            </div>
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
              <RefreshCw className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <RefreshCw />
              Generate Password
            </>
          )}
        </Button>

        {/* Result */}
        {generatedPassword && outputStrength ? (
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
                value={generatedPassword}
              />
              <Button
                onClick={() => setShowPassword((prev) => !prev)}
                size="icon"
                variant="outline"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => onCopyToClipboard(generatedPassword)}
                size="icon"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {getStrengthDescription(outputStrength.label, "password")}
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
