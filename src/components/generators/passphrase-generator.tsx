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
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="rounded-lg border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 p-2">
            <BookOpen className="h-4 w-4 text-primary" />
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
              <Label className="font-medium text-base">Word Count</Label>
              <Badge className="text-sm" variant="outline">
                {settings.wordCount} words
              </Badge>
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
              <Label className="font-medium text-base" htmlFor="separator">
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
                <SelectTrigger className="bg-card">
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
              <Label className="font-medium text-base" htmlFor="word-case">
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
                <SelectTrigger className="bg-card">
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
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50">
              <span className="font-medium text-sm">Additional Options</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-3 rounded-lg border bg-muted/20 p-4">
              {/* Add Numbers Option - New Structure */}
              <div className="flex items-center justify-between rounded-md border p-3 shadow-sm">
                <Label className="flex flex-col pr-2" htmlFor="include-numbers">
                  <span className="font-medium">Add Numbers</span>
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
              {settings.includeNumbers && ( // Only show if "Add Numbers" is checked
                // Insert Numbers Randomly Option - New Structure (with slight indent if desired, or remove ml-6 for same level)
                <div className="mt-2 ml-0 flex items-center justify-between rounded-md border p-3 shadow-sm">
                  {' '}
                  {/* Adjusted indent and margin top */}
                  <Label
                    className="flex flex-col pr-2"
                    htmlFor="insert-numbers-randomly"
                  >
                    <span className="font-medium">Insert numbers randomly</span>
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
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-sm">
                  Generated Passphrase
                </Label>
                {(() => {
                  const strength = getPassphraseStrength(); // Called without parameter
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

              <div className="mb-2 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-2.5 rounded-full ${getStrengthColor(
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
                    className="pr-2 font-mono text-sm"
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

              <div className="grid grid-cols-1 gap-2 text-muted-foreground text-xs sm:grid-cols-2">
                <div>
                  <strong>Estimated Entropy:</strong>{' '}
                  {Math.round(getPassphraseStrength().score * 1.2)}{' '}
                  {/* Called without parameter */}
                  bits
                </div>
                <div>
                  <strong>Time to crack:</strong>{' '}
                  {estimateTimeToCrack(getPassphraseStrength().score * 1.2)}{' '}
                  {/* Called without parameter */}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </CardContent>
    </Card>
  );
}
