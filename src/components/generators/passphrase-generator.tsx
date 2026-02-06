import {
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
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
  settings: PassphraseSettings;
  onSettingsChange: (settings: PassphraseSettings) => void;
  onPassphraseGenerated: (
    passphrase: string,
    historyEntry: PasswordHistory
  ) => void;
  onCopyToClipboard: (text: string) => void;
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
    <div className="space-y-6">
      {/* Configuration */}
      <div className="border-2 border-foreground bg-card shadow-brutal">
        <div className="border-foreground border-b-2 px-4 py-3 sm:px-5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            Configuration
          </span>
        </div>
        <div className="space-y-5 p-4 sm:space-y-6 sm:p-5">
          {/* Word Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-xs uppercase tracking-wider">
                Word Count
              </Label>
              <div className="border-2 border-foreground bg-background px-2.5 py-0.5 text-center font-bold font-mono text-sm tabular-nums">
                {settings.wordCount}
              </div>
            </div>
            <Slider
              className="w-full"
              max={8}
              min={2}
              onValueChange={(value) =>
                onSettingsChange({ ...settings, wordCount: value[0] })
              }
              step={1}
              value={[settings.wordCount]}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>Min: 2</span>
              <span>Max: 8</span>
            </div>
          </div>

          {/* Separator and Case */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-wider" htmlFor="separator">
                Separator
              </Label>
              <Select
                onValueChange={(value) => onSettingsChange({ ...settings, separator: value })}
                value={settings.separator}
              >
                <SelectTrigger className="w-full bg-background">
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
              <Label className="font-bold text-xs uppercase tracking-wider" htmlFor="word-case">
                Word Case
              </Label>
              <Select
                onValueChange={(value) =>
                  onSettingsChange({ ...settings, wordCase: value as PassphraseSettings["wordCase"] })
                }
                value={settings.wordCase}
              >
                <SelectTrigger className="w-full bg-background">
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
            <CollapsibleTrigger className="group flex w-full items-center justify-between border-2 border-foreground bg-secondary p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground">
              <span className="font-bold text-xs uppercase tracking-wider">
                Additional Options
              </span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-0 space-y-3 border-2 border-foreground border-t-0 bg-card p-4">
              <div className="flex items-center justify-between border-2 border-foreground bg-background p-2.5">
                <Label className="flex flex-col pr-2" htmlFor="include-numbers">
                  <span className="font-bold text-xs">Add Numbers</span>
                  <span className="text-[10px] text-muted-foreground">Include digits in passphrase</span>
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
                <div className="flex items-center justify-between border-2 border-foreground bg-background p-2.5">
                  <Label className="flex flex-col pr-2" htmlFor="insert-numbers-randomly">
                    <span className="font-bold text-xs">Random Placement</span>
                    <span className="text-[10px] text-muted-foreground">Distribute numbers randomly</span>
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
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Generate Button */}
      <Button className="w-full" data-generate-button onClick={handleGenerate} size="lg">
        <RefreshCw className="mr-2 h-4 w-4" />
        Generate Passphrase
      </Button>

      {/* Result */}
      {generatedPassphrase ? (
        <div className="border-2 border-foreground bg-card shadow-brutal">
          <div className="flex items-center justify-between border-foreground border-b-2 px-4 py-3 sm:px-5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Output
            </span>
            <span
              className={`font-bold text-[10px] uppercase tracking-wider ${getStrengthTextColor(outputInfo.strength.label)}`}
            >
              {outputInfo.strength.label}
            </span>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
            <div className="h-1.5 w-full bg-muted">
              <div
                className={`h-full transition-all duration-500 ${getStrengthColor(outputInfo.strength.label)}`}
                style={{ width: `${outputInfo.strength.score * 10}%` }}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  className="pr-2 font-bold font-mono text-sm"
                  readOnly
                  type={showPassword ? "text" : "password"}
                  value={generatedPassphrase}
                />
              </div>
              <Button
                className="shrink-0"
                onClick={() => setShowPassword((prev) => !prev)}
                size="icon"
                variant="outline"
                aria-label={showPassword ? "Hide" : "Show"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                className="shrink-0"
                onClick={() => onCopyToClipboard(generatedPassphrase)}
                size="icon"
                variant="outline"
                aria-label="Copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {getStrengthDescription(outputInfo.strength.label, "passphrase")}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <div className="border-2 border-foreground bg-background p-2.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Entropy</div>
                <div className="font-bold font-mono text-sm">
                  {Math.round(outputInfo.entropy)}
                  <span className="ml-0.5 text-[10px] text-muted-foreground font-normal">bits</span>
                </div>
              </div>
              <div className="border-2 border-foreground bg-background p-2.5">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest">Crack Time</div>
                <div className="font-bold font-mono text-sm">{outputInfo.timeToCrack}</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
