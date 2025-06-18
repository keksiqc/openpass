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
import { usePassphraseGenerator } from '../hooks/usePassphraseGenerator';
import type { PassphraseSettings, PasswordHistory } from '../types';
import { estimateTimeToCrack } from '../utils/password-strength'; // Removed calculateEntropy

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
    // Removed unused 'passphrase' parameter
    const wordCount = settings.wordCount;
    const hasNumbers = settings.includeNumbers;
    // A more accurate entropy calculation for passphrases would involve the dictionary size
    // For simplicity, we'll use a rough estimate based on common dictionary sizes (e.g., 7776 words for EFF)
    const estimatedDictionarySize = 7776; // EFF Large Wordlist size
    const entropyPerWord = Math.log2(estimatedDictionarySize);
    let entropy = wordCount * entropyPerWord;

    if (hasNumbers) {
      // Add a bit more entropy for numbers. This is a rough estimate.
      // If numbers are inserted randomly, entropy increases more significantly.
      // If appended, it's less, but still an increase.
      entropy += settings.insertNumbersRandomly
        ? Math.log2(wordCount * 10)
        : Math.log2(10 * (settings.wordCount / 2));
    }

    // Adjust score based on wordCase, if not purely lowercase
    if (settings.wordCase !== 'lowercase') {
      entropy += wordCount * Math.log2(1.5); // Rough boost for case variation
    }

    if (entropy < 60) {
      return { label: 'Weak', color: 'text-red-600', score: 20 };
    } else if (entropy < 80) {
      return { label: 'Fair', color: 'text-yellow-600', score: 40 };
    } else if (entropy < 100) {
      return { label: 'Good', color: 'text-blue-600', score: 60 };
    } else if (entropy < 120) {
      return { label: 'Strong', color: 'text-green-600', score: 80 };
    } else {
      return { label: 'Excellent', color: 'text-green-700', score: 100 };
    }
  };

  const getStrengthDescription = (strengthLabel: string) => {
    switch (strengthLabel) {
      case 'Weak':
        return 'This passphrase is easy to guess. Consider increasing word count or adding numbers.';
      case 'Fair':
        return 'This passphrase is moderately secure. Adding more words or numbers would improve it.';
      case 'Good':
        return 'A good passphrase! For even better security, try increasing its length.';
      case 'Strong':
        return 'Excellent passphrase! Very difficult to crack.';
      case 'Excellent':
        return 'Outstanding! This passphrase offers maximum protection.';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          Passphrase Generator
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          Create memorable and secure passphrases from random words.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <TabsContent value="passphrase" className="space-y-6">
          {/* Word Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Word Count</Label>
              <Badge variant="outline" className="text-sm">
                {settings.wordCount} words
              </Badge>
            </div>
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
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2</span>
              <span>8</span>
            </div>
          </div>

          {/* Separator and Case Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="separator" className="text-base font-medium">
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
              <Label htmlFor="word-case" className="text-base font-medium">
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
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-muted/30 hover:bg-muted/50 rounded-lg border transition-colors">
              <span className="text-sm font-medium">Additional Options</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 p-4 bg-muted/20 rounded-lg border mt-2">
              {/* Add Numbers Option - New Structure */}
              <div className="flex items-center justify-between rounded-md border p-3 shadow-sm">
                <Label htmlFor="include-numbers" className="flex flex-col pr-2">
                  <span className="font-medium">Add Numbers</span>
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
              {settings.includeNumbers && ( // Only show if "Add Numbers" is checked
                // Insert Numbers Randomly Option - New Structure (with slight indent if desired, or remove ml-6 for same level)
                <div className="flex items-center justify-between rounded-md border p-3 shadow-sm ml-0 mt-2">
                  {' '}
                  {/* Adjusted indent and margin top */}
                  <Label
                    htmlFor="insert-numbers-randomly"
                    className="flex flex-col pr-2"
                  >
                    <span className="font-medium">Insert numbers randomly</span>
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
            className="w-full"
            size="lg"
            data-generate-button
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Passphrase
          </Button>

          {/* Generated Passphrase Display */}
          {generatedPassphrase && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Generated Passphrase
                </Label>
                {(() => {
                  const strength = getPassphraseStrength(); // Called without parameter
                  return (
                    <Badge
                      variant="outline"
                      className={`text-xs ${strength.color}`}
                    >
                      {strength.label}
                    </Badge>
                  );
                })()}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                <div
                  className={`h-2.5 rounded-full ${(() => {
                    const strength = getPassphraseStrength(); // Called without parameter
                    if (strength.label === 'Weak') return 'bg-red-600';
                    if (strength.label === 'Fair') return 'bg-yellow-600';
                    if (strength.label === 'Good') return 'bg-blue-600';
                    if (strength.label === 'Strong') return 'bg-green-600';
                    if (strength.label === 'Excellent') return 'bg-green-700';
                    return 'bg-gray-400';
                  })()}`}
                  style={{ width: `${getPassphraseStrength().score}%` }} // Called without parameter
                ></div>
              </div>
              <p className="text-xs text-muted-foreground">
                {getStrengthDescription(getPassphraseStrength().label)}{' '}
                {/* Called without parameter */}
              </p>

              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={generatedPassphrase}
                    readOnly
                    type={showPassword ? 'text' : 'password'}
                    className="font-mono text-sm pr-2"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onCopyToClipboard(generatedPassphrase)}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
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
