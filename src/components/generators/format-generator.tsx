import {
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
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
import { useFormatGenerator } from '../../hooks/useFormatGenerator';
import type { FormatSettings, PasswordHistory } from '../../types';
import {
  calculateEntropy,
  estimateTimeToCrack,
} from '../../utils/password-strength';
import {
  createStrengthObject,
  getStrengthColor,
  getStrengthDescription,
} from '../../utils/strength-helpers';

type FormatGeneratorProps = {
  settings: FormatSettings;
  onSettingsChange: (settings: FormatSettings) => void;
  onFormatGenerated: (format: string, historyEntry: PasswordHistory) => void;
  onCopyToClipboard: (text: string) => void;
};

export function FormatGenerator({
  settings,
  onSettingsChange,
  onFormatGenerated,
  onCopyToClipboard,
}: FormatGeneratorProps) {
  const [generatedFormat, setGeneratedFormat] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const { generateFormatPassword, getCharacterSetFromFormat } =
    useFormatGenerator();

  const handleGenerate = () => {
    generateFormatPassword(settings, (format, historyEntry) => {
      setGeneratedFormat(format);
      onFormatGenerated(format, historyEntry);
    });
  };

  const getFormatStrength = (password: string) => {
    const charset = getCharacterSetFromFormat(settings.format);
    const entropy = calculateEntropy(password, charset);
    return createStrengthObject(entropy);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <Settings className="h-4 w-4 text-accent-foreground" />
          </div>
          Format Generator
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm leading-relaxed">
          Define password formats using a flexible pattern system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-6">
          {/* Format Pattern Input */}
          <div className="space-y-3">
            <Label
              className="font-bold text-sm uppercase tracking-wider"
              htmlFor="format"
            >
              Format Pattern
            </Label>
            <Input
              className="bg-card font-mono text-sm"
              id="format"
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  format: e.target.value,
                })
              }
              placeholder="e.g., 2u4l2d2{#$%}"
              value={settings.format}
            />
            <div className="space-y-1 text-muted-foreground text-xs">
              <p>
                <strong>Format:</strong> Nu (uppercase), Nl (lowercase), Nd
                (digits), N{'{chars}'} (custom)
              </p>
              <p>
                <strong>Example:</strong>{' '}
                <code className="border border-foreground/30 bg-secondary px-1 font-mono">
                  3u2l4d
                </code>{' '}
                →{' '}
                <code className="border border-foreground/30 bg-secondary px-1 font-mono">
                  ABCde1234
                </code>
              </p>
            </div>
          </div>
          {/* Quick Templates */}
          <div className="space-y-3">
            <Label className="font-bold text-sm uppercase tracking-wider">
              Quick Templates
            </Label>
            <Select
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  format: value,
                })
              }
            >
              <SelectTrigger className="w-full bg-card">
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {settings.templates.map((template) => (
                  <SelectItem key={template.name} value={template.pattern}>
                    <div className="flex flex-col">
                      <span className="font-bold">{template.name}</span>
                      <span className="font-mono text-muted-foreground text-xs">
                        {template.pattern}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Format Guide */}
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between border-2 border-foreground bg-secondary p-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground">
              <span className="font-bold text-sm uppercase tracking-wider">
                Format Guide
              </span>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-0 space-y-3 border-2 border-foreground border-t-0 bg-secondary/50 p-4">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <code className="border-2 border-foreground bg-background px-2 py-1 font-mono text-xs">
                    2u
                  </code>
                  <span className="text-muted-foreground">
                    2 uppercase letters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="border-2 border-foreground bg-background px-2 py-1 font-mono text-xs">
                    4l
                  </code>
                  <span className="text-muted-foreground">
                    4 lowercase letters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="border-2 border-foreground bg-background px-2 py-1 font-mono text-xs">
                    3d
                  </code>
                  <span className="text-muted-foreground">3 digits</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="border-2 border-foreground bg-background px-2 py-1 font-mono text-xs">
                    2{'{#$%}'}
                  </code>
                  <span className="text-muted-foreground">
                    2 from custom set
                  </span>
                </div>
              </div>
              <div className="mt-4 border-2 border-foreground bg-background p-3">
                <div className="mb-2 font-bold text-muted-foreground text-xs uppercase tracking-wider">
                  Popular Patterns:
                </div>
                <div className="space-y-1 text-xs">
                  <div>
                    <code className="font-mono">4u4l4d</code> → Strong
                    alphanumeric (12 chars)
                  </div>
                  <div>
                    <code className="font-mono">2u6l2d2{'{!@#}'}</code> →
                    Complex mixed (12 chars)
                  </div>
                  <div>
                    <code className="font-mono">8l4d</code> → Simple memorable
                    (12 chars)
                  </div>
                </div>
              </div>
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
            Generate Format Password
          </Button>
          {/* Generated Format Password Display */}
          {generatedFormat && (
            <div className="space-y-4 border-2 border-foreground p-4 shadow-brutal">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs uppercase tracking-widest">
                  Output
                </Label>
                {(() => {
                  const strength = getFormatStrength(generatedFormat);
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

              <div className="h-3 w-full border-2 border-foreground bg-muted">
                <div
                  className={`h-full ${getStrengthColor(
                    getFormatStrength(generatedFormat).label
                  )}`}
                  style={{
                    width: `${getFormatStrength(generatedFormat).score * 10}%`,
                  }}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {getStrengthDescription(
                  getFormatStrength(generatedFormat).label,
                  'format'
                )}
              </p>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    className="pr-2 font-bold font-mono text-sm"
                    readOnly
                    type={showPassword ? 'text' : 'password'}
                    value={generatedFormat}
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
                  onClick={() => onCopyToClipboard(generatedFormat)}
                  size="icon"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-2 border-foreground/20 border-t-2 pt-3 text-muted-foreground text-xs sm:grid-cols-2">
                <div>
                  <strong>Entropy:</strong>{' '}
                  {Math.round(
                    calculateEntropy(
                      generatedFormat,
                      getCharacterSetFromFormat(settings.format)
                    )
                  )}{' '}
                  bits
                </div>
                <div>
                  <strong>Time to crack:</strong>{' '}
                  {estimateTimeToCrack(
                    calculateEntropy(
                      generatedFormat,
                      getCharacterSetFromFormat(settings.format)
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
