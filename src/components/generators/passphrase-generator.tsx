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
import { Switch } from '@/components/ui/switch'; // Import Switch
import { TabsContent } from '@/components/ui/tabs';
import { usePassphraseGenerator } from '../../hooks/usePassphraseGenerator';
import type { PassphraseSettings, PasswordHistory } from '../../types';
import { estimateTimeToCrack } from '../../utils/password-strength';
import {
  calculatePassphraseStrength,
  getStrengthColor,
  getStrengthDescription,
} from '../../utils/strength-helpers';

interface PassphraseGeneratorProps {
  settings: PassphraseSettings;
  onSettingsChange: (settings: PassphraseSettings) => void;
  onPassphraseGenerated: (
    passphrase: string,
    historyEntry: PasswordHistory,
  ) => void;
  onCopyToClipboard: (text: string) => void;
}

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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
            <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          Passphrase Generator
        </CardTitle>
        <CardDescription className="text-base leading-relaxed text-muted-foreground">
          Create memorable and secure passphrases from random words.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <TabsContent value="passphrase" className="space-y-8 mt-0">
          {/* Word Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Word Count</Label>
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                {settings.wordCount} words
              </Badge>
            </div>
            <div className="px-1">
              <Slider
                value={[settings.wordCount]}
                onValueChange={(value) =>
                  onSettingsChange({
                    ...settings,
                    wordCount: value[0],
                  })
                }
                max={8}
                min={2}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>2</span>
                <span>8</span>
              </div>
            </div>
          </div>

          {/* Separator and Case Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="separator" className="text-base font-semibold">
                Separator
              </Label>
              <Select
                value={settings.separator}
                onValueChange={(value) =>
                  onSettingsChange({
                    ...settings,
                    separator: value,
                  })
                }
              >
                <SelectTrigger className="bg-card h-12">
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

            <div className="space-y-3">
              <Label htmlFor="word-case" className="text-base font-semibold">
                Word Case
              </Label>
              <Select
                value={settings.wordCase}
                onValueChange={(value) =>
                  onSettingsChange({
                    ...settings,
                    wordCase: value as PassphraseSettings['wordCase'],
                  })
                }
              >
                <SelectTrigger className="bg-card h-12">
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
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted/40 hover:bg-muted/60 rounded-xl border transition-all duration-200 group">
              <span className="text-sm font-medium">Additional Options</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-4 bg-muted/20 rounded-xl border mt-3">
              {/* Add Numbers Option */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                <Label htmlFor="include-numbers" className="flex flex-col pr-2 cursor-pointer">
                  <span className="font-medium text-sm">Add Numbers</span>
                  <span className="text-xs text-muted-foreground">
                    Include numbers in the passphrase
                  </span>
                </Label>
                <Switch
                  id="include-numbers"
                  checked={settings.includeNumbers}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeNumbers: !!checked,
                    })
                  }
                />
              </div>
              {settings.includeNumbers && (
                <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors ml-4">
                  <Label
                    htmlFor="insert-numbers-randomly"
                    className="flex flex-col pr-2 cursor-pointer"
                  >
                    <span className="font-medium text-sm">Insert numbers randomly</span>
                    <span className="text-xs text-muted-foreground">
                      Distribute numbers within the passphrase
                    </span>
                  </Label>
                  <Switch
                    id="insert-numbers-randomly"
                    checked={settings.insertNumbersRandomly}
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
            onClick={handleGenerate}
            className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
            size="lg"
            data-generate-button
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Generate Passphrase
          </Button>

          {/* Generated Passphrase Display */}
          {generatedPassphrase && (
            <div className="space-y-4 p-6 bg-gradient-to-br from-muted/60 to-muted/40 rounded-xl border border-border/60 shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Generated Passphrase
                </Label>
                {(() => {
                  const strength = getPassphraseStrength();
                  return (
                    <Badge
                      variant="secondary"
                      className={`text-sm font-medium px-3 py-1 ${strength.color}`}
                    >
                      {strength.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${getStrengthColor(
                    getPassphraseStrength().label,
                  )}`}
                  style={{ width: `${getPassphraseStrength().score * 10}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getStrengthDescription(
                  getPassphraseStrength().label,
                  'passphrase',
                )}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={generatedPassphrase}
                    readOnly
                    type={showPassword ? 'text' : 'password'}
                    className="font-mono text-sm pr-2 bg-background/60"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0 h-10 w-10"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => onCopyToClipboard(generatedPassphrase)}
                  className="shrink-0 h-10 w-10 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Estimated Entropy:</span>{' '}
                  <span className="font-medium">
                    {Math.round(getPassphraseStrength().score * 1.2)}{' '}
                    bits
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Time to crack:</span>{' '}
                  <span className="font-medium">
                    {estimateTimeToCrack(getPassphraseStrength().score * 1.2)}{' '}
                  </span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </CardContent>
    </Card>
  );
}
