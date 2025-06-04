import {
  AlertTriangle,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TabsContent } from '@/components/ui/tabs';
import { usePasswordGenerator } from '../hooks/usePasswordGenerator';
import type { PasswordHistory, PasswordSettings } from '../types';
import {
  calculateEntropy,
  estimateTimeToCrack,
} from '../utils/password-strength';

interface PasswordGeneratorProps {
  settings: PasswordSettings;
  onSettingsChange: (settings: PasswordSettings) => void;
  onPasswordGenerated: (
    password: string,
    historyEntry: PasswordHistory,
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

  const getStrengthBadge = (password: string) => {
    const strength = calculateEntropy(password, getCharacterSet(settings));
    if (strength < 40) {
      return (
        <Badge
          variant="destructive"
          className="text-xs flex items-center gap-1"
        >
          <AlertTriangle className="h-3 w-3" />
          Weak
        </Badge>
      );
    } else if (strength < 60) {
      return (
        <Badge variant="secondary" className="text-xs">
          Fair
        </Badge>
      );
    } else if (strength < 80) {
      return (
        <Badge variant="outline" className="text-xs">
          Good
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="text-xs flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Strong
        </Badge>
      );
    }
  };

  return (
    <TabsContent value="password" className="space-y-6">
      {/* Password Length */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Password Length</Label>
          <Badge variant="outline" className="text-sm">
            {settings.length} characters
          </Badge>
        </div>
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
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>4</span>
          <span>128</span>
        </div>
      </div>

      {/* Character Types */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Character Types</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
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
            <Label htmlFor="uppercase" className="flex-1 cursor-pointer">
              <div className="font-medium">Uppercase</div>
              <div className="text-xs text-muted-foreground font-mono">A-Z</div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
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
            <Label htmlFor="lowercase" className="flex-1 cursor-pointer">
              <div className="font-medium">Lowercase</div>
              <div className="text-xs text-muted-foreground font-mono">a-z</div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
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
            <Label htmlFor="numbers" className="flex-1 cursor-pointer">
              <div className="font-medium">Numbers</div>
              <div className="text-xs text-muted-foreground font-mono">0-9</div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
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
            <Label htmlFor="symbols" className="flex-1 cursor-pointer">
              <div className="font-medium">Symbols</div>
              <div className="text-xs text-muted-foreground font-mono">
                !@#$%
              </div>
            </Label>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-muted/30 hover:bg-muted/50 rounded-lg border transition-colors">
          <span className="text-sm font-medium">Advanced Options</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 p-4 bg-muted/20 rounded-lg border mt-2">
          <div>
            <Label htmlFor="custom" className="text-xs text-muted-foreground">
              Custom Characters
            </Label>
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
              className="mt-1 font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
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
              <Label
                htmlFor="exclude-similar"
                className="text-xs cursor-pointer"
              >
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
              <Label
                htmlFor="exclude-ambiguous"
                className="text-xs cursor-pointer"
              >
                Exclude ambiguous symbols
              </Label>
            </div>
          </div>

          {/* Minimum Requirements */}
          {(settings.includeNumbers || settings.includeSymbols) && (
            <div className="space-y-3 pt-3 border-t">
              <div className="text-xs font-medium text-muted-foreground">
                Minimum Requirements
              </div>

              {settings.includeNumbers && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Min Numbers</Label>
                    <Badge variant="outline" className="text-xs">
                      {settings.minNumbers || 1}
                    </Badge>
                  </div>
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
                    className="w-full"
                  />
                </div>
              )}

              {settings.includeSymbols && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Min Symbols</Label>
                    <Badge variant="outline" className="text-xs">
                      {settings.minSymbols || 1}
                    </Badge>
                  </div>
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
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        className="w-full"
        size="lg"
        disabled={isGenerating}
        data-generate-button
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

      {/* Generated Password Display */}
      {generatedPassword && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Generated Password</Label>
            {getStrengthBadge(generatedPassword)}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={generatedPassword}
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
              onClick={() => onCopyToClipboard(generatedPassword)}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <strong>Entropy:</strong>{' '}
              {Math.round(
                calculateEntropy(generatedPassword, getCharacterSet(settings)),
              )}{' '}
              bits
            </div>
            <div>
              <strong>Time to crack:</strong>{' '}
              {estimateTimeToCrack(
                calculateEntropy(generatedPassword, getCharacterSet(settings)),
              )}
            </div>
          </div>
        </div>
      )}
    </TabsContent>
  );
}
