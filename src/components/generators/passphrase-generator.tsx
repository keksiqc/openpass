import { BookOpen, ChevronDown, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PASSPHRASE_CONSTRAINTS } from "../../constants/generator";
import { usePassphraseGenerator } from "../../hooks/use-passphrase-generator";
import type { PassphraseSettings, PasswordHistory } from "../../types";
import { estimateTimeToCrack } from "../../utils/password-strength";
import {
  calculatePassphraseStrength,
  getStrengthColor,
  getStrengthDescription,
  getStrengthTextColor,
} from "../../utils/strength-helpers";

interface PassphraseGeneratorProps {
  onCopyToClipboard: (text: string) => void;
  onPassphraseGenerated: (passphrase: string, historyEntry: PasswordHistory) => void;
  onSettingsChange: (settings: PassphraseSettings) => void;
  settings: PassphraseSettings;
}

export function PassphraseGenerator({
  settings,
  onSettingsChange,
  onPassphraseGenerated,
  onCopyToClipboard,
}: PassphraseGeneratorProps) {
  const [generatedPassphrase, setGeneratedPassphrase] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const { generatePassphrase } = usePassphraseGenerator();

  const handleGenerate = () => {
    generatePassphrase(settings, (passphrase, historyEntry) => {
      setGeneratedPassphrase(passphrase);
      onPassphraseGenerated(passphrase, historyEntry);
    });
  };

  const outputInfo = useMemo(() => {
    const strength = calculatePassphraseStrength(settings);

    const entropyPerWord = Math.log2(PASSPHRASE_CONSTRAINTS.DICTIONARY_SIZE);
    let entropy = settings.wordCount * entropyPerWord;
    if (settings.includeNumbers) {
      entropy += settings.insertNumbersRandomly
        ? Math.log2(settings.wordCount * 10)
        : Math.log2(10 * (settings.wordCount / 2));
    }
    if (settings.wordCase !== "lowercase") {
      entropy += settings.wordCount * Math.log2(1.5);
    }

    const timeToCrack = estimateTimeToCrack(entropy);
    return { strength, entropy, timeToCrack };
  }, [settings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          Passphrase Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-6">
        {/* Word Count */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Word Count</Label>
            <Badge variant="secondary">{settings.wordCount} words</Badge>
          </div>
          <Slider
            className="w-full"
            max={8}
            min={2}
            onValueChange={(value) => onSettingsChange({ ...settings, wordCount: value[0] })}
            step={1}
            value={[settings.wordCount]}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2</span>
            <span>8</span>
          </div>
        </div>

        {/* Separator and Case */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="separator">
              Separator
            </Label>
            <Select
              onValueChange={(value) => onSettingsChange({ ...settings, separator: value })}
              value={settings.separator}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-">Hyphen (-)</SelectItem>
                <SelectItem value="_">Underscore (_)</SelectItem>
                <SelectItem value=" ">Space ( )</SelectItem>
                <SelectItem value=".">Period (.)</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="word-case">
              Word Case
            </Label>
            <Select
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  wordCase: value as PassphraseSettings["wordCase"],
                })
              }
              value={settings.wordCase}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lowercase">lowercase</SelectItem>
                <SelectItem value="uppercase">UPPERCASE</SelectItem>
                <SelectItem value="capitalize">Capitalize</SelectItem>
                <SelectItem value="mixed">MiXeD cAsE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Options */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-muted/50 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted">
            <span>Additional Options</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden">
            <div className="mt-1 space-y-2 rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2.5">
                <Label className="flex flex-col pr-2" htmlFor="include-numbers">
                  <span className="text-sm font-medium">Add Numbers</span>
                  <span className="text-xs text-muted-foreground">
                    Include digits in the passphrase
                  </span>
                </Label>
                <Switch
                  checked={settings.includeNumbers}
                  id="include-numbers"
                  onCheckedChange={(checked) =>
                    onSettingsChange({ ...settings, includeNumbers: !!checked })
                  }
                />
              </div>
              {settings.includeNumbers ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2.5">
                  <Label className="flex flex-col pr-2" htmlFor="insert-numbers-randomly">
                    <span className="text-sm font-medium">Random placement</span>
                    <span className="text-xs text-muted-foreground">
                      Distribute numbers within the passphrase
                    </span>
                  </Label>
                  <Switch
                    checked={settings.insertNumbersRandomly}
                    id="insert-numbers-randomly"
                    onCheckedChange={(checked) =>
                      onSettingsChange({ ...settings, insertNumbersRandomly: !!checked })
                    }
                  />
                </div>
              ) : null}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Generate Button */}
        <Button className="w-full" data-generate-button onClick={handleGenerate} size="lg">
          <RefreshCw />
          Generate Passphrase
        </Button>

        {/* Result */}
        {generatedPassphrase ? (
          <div className="space-y-3 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Result</span>
              <span
                className={`text-xs font-semibold ${getStrengthTextColor(outputInfo.strength.label)}`}
              >
                {outputInfo.strength.label}
              </span>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(outputInfo.strength.label)}`}
                style={{ width: `${outputInfo.strength.score * 10}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Input
                className="flex-1 font-mono text-sm font-medium"
                readOnly
                type={showPassword ? "text" : "password"}
                value={generatedPassphrase}
              />
              <Button
                onClick={() => setShowPassword((prev) => !prev)}
                size="icon"
                variant="outline"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => onCopyToClipboard(generatedPassphrase)}
                size="icon"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {getStrengthDescription(outputInfo.strength.label, "passphrase")}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-background/80 px-3 py-2">
                <div className="mb-0.5 text-[10px] text-muted-foreground">Entropy</div>
                <div className="font-mono font-medium">{Math.round(outputInfo.entropy)} bits</div>
              </div>
              <div className="rounded-lg bg-background/80 px-3 py-2">
                <div className="mb-0.5 text-[10px] text-muted-foreground">Time to crack</div>
                <div className="font-mono font-medium">{outputInfo.timeToCrack}</div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
