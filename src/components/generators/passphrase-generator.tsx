import {
  BookOpen,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from '@/components/ui/tabs';
import { usePassphraseGenerator } from '../../hooks/usePassphraseGenerator';
import type { PassphraseSettings, PasswordHistory } from '../../types';
import { estimateTimeToCrack } from '../../utils/password-strength';
import {
  calculatePassphraseStrength,
  getStrengthColor,
  getStrengthDescription,
} from '../../utils/strength-helpers';

type PassphraseGeneratorProps = {
  settings: PassphraseSettings;
  onSettingsChange: (settings: PassphraseSettings) => void;
  onPassphraseGenerated: (
    passphrase: string,
    historyEntry: PasswordHistory
  ) => void;
  onCopyToClipboard: (text: string) => void;
};

export function PassphraseGenerator({
  settings,
  onSettingsChange,
  onPassphraseGenerated,
  onCopyToClipboard,
}: PassphraseGeneratorProps) {
  const [generatedPassphrase, setGeneratedPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const { generatePassphrase } = usePassphraseGenerator();

  const handleGenerate = () => {
    generatePassphrase(settings, (passphrase, historyEntry) => {
      setGeneratedPassphrase(passphrase);
      onPassphraseGenerated(passphrase, historyEntry);
    });
  };

  const getPassphraseStrength = () => {
    return calculatePassphraseStrength(settings);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <BookOpen className="h-4 w-4 text-accent-foreground" />
          </div>
          Passphrase Generator
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm leading-relaxed">
          Create memorable and secure passphrases from random words.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <TabsContent className="space-y-6" value="passphrase">
          {/* Word Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-sm uppercase tracking-wider">
                Word Count
              </Label>
              <Badge variant="outline">{settings.wordCount} words</Badge>
            </div>
            <Slider
              className="w-full"
              max={8}
              min={2}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  wordCount: value[0],
                })
              }
              step={1}
              value={[settings.wordCount]}
            />
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>2</span>
              <span>8</span>
            </div>
          </div>

          {/* Separator and Case Options */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                className="font-bold text-sm uppercase tracking-wider"
                htmlFor="separator"
              >
                Separator
              </Label>
              <Select
                onValueChange={(value) =>
                  onSettingsChange({
                    ...settings,
                    separator: value,
                  })
                }
                value={settings.separator}
              >
                <SelectTrigger className="w-full bg-card">
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
              <Label
                className="font-bold text-sm uppercase tracking-wider"
                htmlFor="word-case"
              >
                Word Case
              </Label>
              <Select
                onValueChange={(value) =>
                  onSettingsChange({
                    ...settings,
                    wordCase: value as PassphraseSettings['wordCase'],
                  })
                }
                value={settings.wordCase}
              >
                <SelectTrigger className="w-full bg-card">
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
            <CollapsibleTrigger className="flex w-full items-center justify-between border-2 border-foreground bg-secondary p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground">
              <span className="font-bold text-sm uppercase tracking-wider">
                Additional Options
              </span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-0 space-y-3 border-2 border-foreground border-t-0 bg-secondary/50 p-4">
              {/* Add Numbers Option */}
              <div className="flex items-center justify-between border-2 border-foreground p-3">
                <Label className="flex flex-col pr-2" htmlFor="include-numbers">
                  <span className="font-bold text-sm">Add Numbers</span>
                  <span className="text-muted-foreground text-xs">
                    Include numbers in the passphrase
                  </span>
                </Label>
                <Switch
                  checked={settings.includeNumbers}
                  id="include-numbers"
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeNumbers: !!checked,
                    })
                  }
                />
              </div>
              {settings.includeNumbers && (
                <div className="mt-2 ml-0 flex items-center justify-between border-2 border-foreground p-3">
                  <Label
                    className="flex flex-col pr-2"
                    htmlFor="insert-numbers-randomly"
                  >
                    <span className="font-bold text-sm">
                      Insert numbers randomly
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Distribute numbers within the passphrase
                    </span>
                  </Label>
                  <Switch
                    checked={settings.insertNumbersRandomly}
                    id="insert-numbers-randomly"
                    onCheckedChange={(checked) =>
                      onSettingsChange({
                        ...settings,
                        insertNumbersRandomly: !!checked,
                      })
                    }
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Generate Button */}
          <Button
            className="w-full"
            data-generate-button
            onClick={handleGenerate}
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Passphrase
          </Button>

          {/* Generated Passphrase Display */}
          {generatedPassphrase && (
            <div className="space-y-4 border-2 border-foreground p-4 shadow-brutal">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs uppercase tracking-widest">
                  Output
                </Label>
                {(() => {
                  const strength = getPassphraseStrength();
                  return (
                    <Badge
                      className={`text-xs ${strength.color}`}
                      variant="outline"
                    >
                      {strength.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="h-3 w-full border-2 border-foreground bg-muted">
                <div
                  className={`h-full ${getStrengthColor(
                    getPassphraseStrength().label
                  )}`}
                  style={{ width: `${getPassphraseStrength().score * 10}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {getStrengthDescription(
                  getPassphraseStrength().label,
                  'passphrase'
                )}
              </p>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    className="pr-2 font-bold font-mono text-sm"
                    readOnly
                    type={showPassword ? 'text' : 'password'}
                    value={generatedPassphrase}
                  />
                </div>
                <Button
                  className="shrink-0"
                  onClick={() => setShowPassword(!showPassword)}
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
                  onClick={() => onCopyToClipboard(generatedPassphrase)}
                  size="icon"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 border-foreground/20 border-t-2 pt-3 text-muted-foreground text-xs sm:grid-cols-2">
                <div>
                  <strong>Estimated Entropy:</strong>{' '}
                  {Math.round(getPassphraseStrength().score * 1.2)} bits
                </div>
                <div>
                  <strong>Time to crack:</strong>{' '}
                  {estimateTimeToCrack(
                    getPassphraseStrength().score * 1.2
                  )}{' '}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </CardContent>
    </Card>
  );
}
