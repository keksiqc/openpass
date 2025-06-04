
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { TabsContent } from '@/components/ui/tabs';
import { BookOpen, ChevronDown, Copy, Eye, EyeOff, Shield } from 'lucide-react';
import { useState } from 'react';
import { usePassphraseGenerator } from '../hooks/usePassphraseGenerator';
import type { PassphraseSettings, PasswordHistory } from '../types';

interface PassphraseGeneratorProps {
  settings: PassphraseSettings;
  onSettingsChange: (settings: PassphraseSettings) => void;
  onPassphraseGenerated: (passphrase: string, historyEntry: PasswordHistory) => void;
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

  const getStrengthBadge = (_passphrase: string) => {
    // For passphrases, estimate based on word count, separator, and numbers
    const wordCount = settings.wordCount;
    const hasNumbers = settings.includeNumbers;
    const entropy = wordCount * 12.9 + (hasNumbers ? 6.6 : 0); // Rough estimation
    
    if (entropy < 50) {
      return <Badge variant="destructive" className="text-xs">Weak</Badge>;
    } else if (entropy < 70) {
      return <Badge variant="secondary" className="text-xs">Fair</Badge>;
    } else if (entropy < 90) {
      return <Badge variant="outline" className="text-xs">Good</Badge>;
    } else {
      return <Badge variant="default" className="text-xs flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Strong
      </Badge>;
    }
  };

  return (
    <TabsContent value="passphrase" className="space-y-6">
      {/* Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Why use passphrases?</p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Passphrases like "correct-horse-battery-staple" are easier to remember than complex passwords 
              while providing excellent security through length and entropy.
            </p>
          </div>
        </div>
      </div>

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
          <Label htmlFor="separator" className="text-base font-medium">Separator</Label>
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
          <Label htmlFor="word-case" className="text-base font-medium">Word Case</Label>
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
          <div className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <Checkbox
              id="include-numbers"
              checked={settings.includeNumbers}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  includeNumbers: !!checked,
                })
              }
            />
            <Label htmlFor="include-numbers" className="flex-1 cursor-pointer">
              <div className="font-medium">Add Numbers</div>
              <div className="text-xs text-muted-foreground">Append random digits to the passphrase</div>
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Generate Button */}
      <Button 
        onClick={handleGenerate} 
        className="w-full" 
        size="lg"
        data-generate-button
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Generate Passphrase
      </Button>

      {/* Generated Passphrase Display */}
      {generatedPassphrase && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Generated Passphrase
            </Label>
            {getStrengthBadge(generatedPassphrase)}
          </div>
          
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
          
          <div className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Passphrases are easier to remember while maintaining high security
          </div>
        </div>
      )}
    </TabsContent>
  );
}
