
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Copy, RefreshCw } from 'lucide-react';
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
  const { generatePassphrase } = usePassphraseGenerator();

  const handleGenerate = () => {
    generatePassphrase(settings, (passphrase, historyEntry) => {
      setGeneratedPassphrase(passphrase);
      onPassphraseGenerated(passphrase, historyEntry);
    });
  };

  return (
    <TabsContent value="passphrase" className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label>Word Count: {settings.wordCount}</Label>
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
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="separator">Separator</Label>
          <Select
            value={settings.separator}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                separator: value,
              })
            }
          >
            <SelectTrigger>
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

        <div>
          <Label htmlFor="word-case">Word Case</Label>
          <Select
            value={settings.wordCase}
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                wordCase: value as PassphraseSettings['wordCase'],
              })
            }
          >
            <SelectTrigger>
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

        <div className="flex items-center space-x-2">
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
          <Label htmlFor="include-numbers">Add numbers at the end</Label>
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full" size="lg">
        <RefreshCw className="h-4 w-4 mr-2" />
        Generate Passphrase
      </Button>

      {generatedPassphrase && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
            Generated Passphrase
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={generatedPassphrase}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onCopyToClipboard(generatedPassphrase)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </TabsContent>
  );
}
