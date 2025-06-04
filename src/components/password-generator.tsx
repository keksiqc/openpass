
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TabsContent } from '@/components/ui/tabs';
import { Copy, Eye, EyeOff, RefreshCw, Zap } from 'lucide-react';
import { useState } from 'react';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import type { PasswordHistory, PasswordSettings } from '../types';
import { calculateEntropy, estimateTimeToCrack } from '../utils/password-strength';

interface PasswordGeneratorProps {
  settings: PasswordSettings;
  onSettingsChange: (settings: PasswordSettings) => void;
  onPasswordGenerated: (password: string, historyEntry: PasswordHistory) => void;
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
  const [generatedPassword, setGeneratedPassword] = useState('');
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

  return (
    <TabsContent value="password" className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label>Length: {settings.length}</Label>
          <Slider
            value={[settings.length]}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                length: value[0],
              })
            }
            max={128}
            min={4}
            step={1}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="uppercase"
              checked={settings.includeUppercase}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  includeUppercase: !!checked,
                })
              }
            />
            <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowercase"
              checked={settings.includeLowercase}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  includeLowercase: !!checked,
                })
              }
            />
            <Label htmlFor="lowercase">Lowercase (a-z)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="numbers"
              checked={settings.includeNumbers}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  includeNumbers: !!checked,
                })
              }
            />
            <Label htmlFor="numbers">Numbers (0-9)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="symbols"
              checked={settings.includeSymbols}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  includeSymbols: !!checked,
                })
              }
            />
            <Label htmlFor="symbols">Symbols (!@#$...)</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="custom">Custom Characters</Label>
            <Input
              id="custom"
              value={settings.customCharacters}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  customCharacters: e.target.value,
                })
              }
              placeholder="Add custom characters..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-similar"
                checked={settings.excludeSimilar}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...settings,
                    excludeSimilar: !!checked,
                  })
                }
              />
              <Label htmlFor="exclude-similar" className="text-sm">
                Exclude similar (0,O,1,l,I)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-ambiguous"
                checked={settings.excludeAmbiguous}
                onCheckedChange={(checked) =>
                  onSettingsChange({
                    ...settings,
                    excludeAmbiguous: !!checked,
                  })
                }
              />
              <Label htmlFor="exclude-ambiguous" className="text-sm">
                Exclude ambiguous symbols
              </Label>
            </div>
          </div>
        </div>

        {(settings.includeNumbers || settings.includeSymbols) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2 sm:col-span-2">
              Minimum Requirements:
            </div>

            {settings.includeNumbers && (
              <div>
                <Label>Min Numbers: {settings.minNumbers}</Label>
                <Slider
                  value={[settings.minNumbers || 1]}
                  onValueChange={(value) =>
                    onSettingsChange({
                      ...settings,
                      minNumbers: value[0],
                    })
                  }
                  max={Math.min(5, Math.floor(settings.length / 2))}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}

            {settings.includeSymbols && (
              <div>
                <Label>Min Symbols: {settings.minSymbols}</Label>
                <Slider
                  value={[settings.minSymbols || 1]}
                  onValueChange={(value) =>
                    onSettingsChange({
                      ...settings,
                      minSymbols: value[0],
                    })
                  }
                  max={Math.min(5, Math.floor(settings.length / 2))}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Button
        onClick={handleGenerate}
        className="w-full"
        size="lg"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Generate Password
          </>
        )}
      </Button>

      {generatedPassword && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">
              Generated Password
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={generatedPassword}
              readOnly
              type={showPassword ? 'text' : 'password'}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
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
              onClick={() => onCopyToClipboard(generatedPassword)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            Entropy:{' '}
            {Math.round(
              calculateEntropy(generatedPassword, getCharacterSet(settings)),
            )}{' '}
            bits • Time to crack:{' '}
            {estimateTimeToCrack(
              calculateEntropy(generatedPassword, getCharacterSet(settings)),
            )}
          </div>
        </div>
      )}
    </TabsContent>
  );
}
