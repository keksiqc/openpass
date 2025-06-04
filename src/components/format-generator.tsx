import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { TabsContent } from '@/components/ui/tabs';
import { ChevronDown, Copy, Eye, EyeOff, Settings, Shield } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(true);
  const { generateFormatPassword } = useFormatGenerator();

  const handleGenerate = () => {
    generateFormatPassword(settings, (format, historyEntry) => {
      setGeneratedFormat(format);
      onFormatGenerated(format, historyEntry);
    });
  };

  return (
    <TabsContent value="format" className="space-y-6">
      {/* Format Pattern Input */}
      <div className="space-y-3">
        <Label htmlFor="format" className="text-base font-medium">Format Pattern</Label>
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
          className="font-mono text-sm bg-card"
        />
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Format:</strong> Nu (uppercase), Nl (lowercase), Nd (digits), N{`{chars}`} (custom)</p>
          <p><strong>Example:</strong> <code className="font-mono bg-muted px-1 rounded">3u2l4d</code> → <code className="font-mono bg-muted px-1 rounded">ABCde1234</code></p>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Quick Templates</Label>
        <Select
          onValueChange={(value) =>
            onSettingsChange({
              ...settings,
              format: value,
            })
          }
        >
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="Choose a template..." />
          </SelectTrigger>
          <SelectContent>
            {settings.templates.map((template) => (
              <SelectItem key={template.name} value={template.pattern}>
                <div className="flex flex-col">
                  <span className="font-medium">{template.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{template.pattern}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Format Guide */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left bg-muted/30 hover:bg-muted/50 rounded-lg border transition-colors">
          <span className="text-sm font-medium">Format Guide</span>
          <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 p-4 bg-muted/20 rounded-lg border mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-background rounded text-xs font-mono">2u</code>
              <span className="text-muted-foreground">2 uppercase letters</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-background rounded text-xs font-mono">4l</code>
              <span className="text-muted-foreground">4 lowercase letters</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-background rounded text-xs font-mono">3d</code>
              <span className="text-muted-foreground">3 digits</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-background rounded text-xs font-mono">2{`{#$%}`}</code>
              <span className="text-muted-foreground">2 from custom set</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-background rounded-lg border">
            <div className="text-xs font-medium mb-2 text-muted-foreground">Popular Patterns:</div>
            <div className="space-y-1 text-xs">
              <div><code className="font-mono">4u4l4d</code> → Strong alphanumeric (12 chars)</div>
              <div><code className="font-mono">2u6l2d2{`{!@#}`}</code> → Complex mixed (12 chars)</div>
              <div><code className="font-mono">8l4d</code> → Simple memorable (12 chars)</div>
            </div>
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
        <Settings className="h-4 w-4 mr-2" />
        Generate Format Password
      </Button>

      {/* Generated Format Password Display */}
      {generatedFormat && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              Generated Format Password
            </Label>
            <Badge variant="default" className="text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Custom
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={generatedFormat}
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
              onClick={() => onCopyToClipboard(generatedFormat)}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <strong>Pattern used:</strong> <code className="font-mono">{settings.format}</code>
          </div>
        </div>
      )}
    </TabsContent>
  );
}
