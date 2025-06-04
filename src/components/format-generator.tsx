
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TabsContent } from '@/components/ui/tabs';
import { Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useFormatGenerator } from '../hooks/useFormatGenerator';
import type { FormatSettings, PasswordHistory } from '../types';

interface FormatGeneratorProps {
  settings: FormatSettings;
  onSettingsChange: (settings: FormatSettings) => void;
  onFormatGenerated: (format: string, historyEntry: PasswordHistory) => void;
  onCopyToClipboard: (text: string) => void;
}

export function FormatGenerator({
  settings,
  onSettingsChange,
  onFormatGenerated,
  onCopyToClipboard,
}: FormatGeneratorProps) {
  const [generatedFormat, setGeneratedFormat] = useState('');
  const { generateFormatPassword } = useFormatGenerator();

  const handleGenerate = () => {
    generateFormatPassword(settings, (format, historyEntry) => {
      setGeneratedFormat(format);
      onFormatGenerated(format, historyEntry);
    });
  };

  return (
    <TabsContent value="format" className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="format">Format Pattern</Label>
          <Input
            id="format"
            value={settings.format}
            onChange={(e) =>
              onSettingsChange({
                ...settings,
                format: e.target.value,
              })
            }
            placeholder="e.g., 2u4l2d2{#$%}"
            className="font-mono"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Format: Nu (uppercase), Nl (lowercase), Nd (digits), N{'{chars}'} (custom)
          </div>
        </div>

        <div>
          <Label htmlFor="template">Quick Templates</Label>
          <Select
            onValueChange={(value) =>
              onSettingsChange({
                ...settings,
                format: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              {settings.templates.map((template) => (
                <SelectItem key={template.name} value={template.pattern}>
                  {template.name} ({template.pattern})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 bg-muted/30 rounded text-sm space-y-1">
          <div className="font-medium">Format Guide:</div>
          <div>• <code>2u</code> - 2 uppercase letters</div>
          <div>• <code>4l</code> - 4 lowercase letters</div>
          <div>• <code>3d</code> - 3 digits</div>
          <div>• <code>1{'{#$%}'}</code> - 1 character from custom set</div>
        </div>
      </div>

      <Button onClick={handleGenerate} className="w-full" size="lg">
        <RefreshCw className="h-4 w-4 mr-2" />
        Generate Format Password
      </Button>

      {generatedFormat && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
            Generated Format Password
          </Label>
          <div className="flex items-center gap-2">
            <Input
              value={generatedFormat}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => onCopyToClipboard(generatedFormat)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </TabsContent>
  );
}
