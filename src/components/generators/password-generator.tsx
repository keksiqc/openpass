import { ChevronDown, Copy, Eye, EyeOff, Key, RefreshCw } from 'lucide-react';
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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch'; // Import Switch
import { TabsContent } from '@/components/ui/tabs';
import { usePasswordGenerator } from '../../hooks/usePasswordGenerator';
import type { PasswordHistory, PasswordSettings } from '../../types';
import {
  calculateEntropy,
  calculateStrength,
  estimateTimeToCrack,
} from '../../utils/password-strength';
import {
  getStrengthColor,
  getStrengthDescription,
} from '../../utils/strength-helpers';

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

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
            <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Password Generator
        </CardTitle>
        <CardDescription className="text-base leading-relaxed text-muted-foreground">
          Generate strong, unique passwords with customizable options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <TabsContent value="password" className="space-y-8 mt-0">
          {/* Password Length */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Password Length</Label>
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                {settings.length} characters
              </Badge>
            </div>
            <div className="px-1">
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
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>4</span>
                <span>128</span>
              </div>
            </div>
          </div>

          {/* Character Types */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Character Types</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Uppercase Option */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                <Label htmlFor="uppercase" className="flex flex-col pr-2 cursor-pointer">
                  <span className="font-medium text-sm">Uppercase</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    A-Z
                  </span>
                </Label>
                <Switch
                  id="uppercase"
                  checked={settings.includeUppercase}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeUppercase: !!checked,
                    })
                  }
                />
              </div>

              {/* Lowercase Option */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                <Label htmlFor="lowercase" className="flex flex-col pr-2 cursor-pointer">
                  <span className="font-medium text-sm">Lowercase</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    a-z
                  </span>
                </Label>
                <Switch
                  id="lowercase"
                  checked={settings.includeLowercase}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeLowercase: !!checked,
                    })
                  }
                />
              </div>

              {/* Numbers Option */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                <Label htmlFor="numbers" className="flex flex-col pr-2 cursor-pointer">
                  <span className="font-medium text-sm">Numbers</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    0-9
                  </span>
                </Label>
                <Switch
                  id="numbers"
                  checked={settings.includeNumbers}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      includeNumbers: !!checked,
                    })
                  }
                />
              </div>

              {/* Symbols Option */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                <Label htmlFor="symbols" className="flex flex-col pr-2 cursor-pointer">
                  <span className="font-medium text-sm">Symbols</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    !@#$%
                  </span>
                </Label>
                <Switch
                  id="symbols"
                  checked={settings.includeSymbols}
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
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left bg-muted/40 hover:bg-muted/60 rounded-xl border transition-all duration-200 group">
              <span className="text-sm font-medium">Advanced Options</span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 p-4 bg-muted/20 rounded-xl border mt-3">
              <div>
                <Label
                  htmlFor="custom"
                  className="text-sm font-medium text-muted-foreground"
                >
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
                  className="mt-2 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center space-x-3">
                  <Switch
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
                    className="text-sm cursor-pointer"
                  >
                    Exclude similar characters (0,O,1,l,I)
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
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
                    className="text-sm cursor-pointer"
                  >
                    Exclude ambiguous symbols
                  </Label>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t">
                <Switch
                  id="require-each-type"
                  checked={settings.requireEachCharacterType}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      requireEachCharacterType: !!checked,
                    })
                  }
                />
                <Label
                  htmlFor="require-each-type"
                  className="text-sm cursor-pointer"
                >
                  Enforce each selected character type
                </Label>
              </div>

              {/* Minimum Requirements */}
              {(settings.includeNumbers || settings.includeSymbols) && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="text-sm font-medium text-muted-foreground">
                    Minimum Requirements
                  </div>

                  {settings.includeNumbers && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Minimum Numbers</Label>
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Minimum Symbols</Label>
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
            className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
            size="lg"
            disabled={isGenerating}
            data-generate-button
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Generate Password
              </>
            )}
          </Button>

          {/* Generated Password Display */}
          {generatedPassword && (
            <div className="space-y-4 p-6 bg-gradient-to-br from-muted/60 to-muted/40 rounded-xl border border-border/60 shadow-sm">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  Generated Password
                </Label>
                {(() => {
                  const strength = calculateStrength(generatedPassword);
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
                    calculateStrength(generatedPassword).label,
                  )}`}
                  style={{
                    width: `${calculateStrength(generatedPassword).score * 10}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getStrengthDescription(
                  calculateStrength(generatedPassword).label,
                  'password',
                )}
              </p>

              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={generatedPassword}
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
                  onClick={() => onCopyToClipboard(generatedPassword)}
                  className="shrink-0 h-10 w-10 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Entropy:</span>{' '}
                  <span className="font-medium">
                    {Math.round(
                      calculateEntropy(
                        generatedPassword,
                        getCharacterSet(settings),
                      ),
                    )}{' '}
                    bits
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Time to crack:</span>{' '}
                  <span className="font-medium">
                    {estimateTimeToCrack(
                      calculateEntropy(
                        generatedPassword,
                        getCharacterSet(settings),
                      ),
                    )}
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
