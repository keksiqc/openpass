import { Copy, Eye, EyeOff, Hash, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { usePinGenerator } from "../../hooks/use-pin-generator";
import type { PasswordHistory, PinSettings } from "../../types";

interface PinGeneratorProps {
  settings: PinSettings;
  onSettingsChange: (settings: PinSettings) => void;
  onPinGenerated: (pin: string, historyEntry: PasswordHistory) => void;
  onCopyToClipboard: (text: string) => void;
}

export function PinGenerator({
  settings,
  onSettingsChange,
  onPinGenerated,
  onCopyToClipboard,
}: PinGeneratorProps) {
  const [showPin, setShowPin] = useState(true);
  const { pin, generatePin } = usePinGenerator();

  const handleGenerate = () => {
    generatePin(settings, (generatedPin, historyEntry) => {
      onPinGenerated(generatedPin, historyEntry);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <Hash className="h-4 w-4 text-accent-foreground" />
          </div>
          PIN Generator
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm leading-relaxed">
          Generate cryptographically secure numeric PINs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label
              className="font-bold text-sm uppercase tracking-wider"
              htmlFor="pin-length"
            >
              PIN Length
            </Label>
            <Badge variant="outline">{settings.length} digits</Badge>
          </div>
          <Slider
            className="w-full"
            id="pin-length"
            max={12}
            min={4}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, length: value[0] })
            }
            value={[settings.length]}
          />
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>4</span>
            <span>12</span>
          </div>
        </div>

        <Button
          className="w-full"
          data-generate-button
          onClick={handleGenerate}
          size="lg"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate PIN
        </Button>

        {pin ? (
          <div className="space-y-3 border-2 border-foreground p-4 shadow-brutal">
            <Label className="font-bold text-xs uppercase tracking-widest">
              Output
            </Label>
            <div className="flex items-center gap-2">
              <Input
                className="pr-2 font-bold font-mono text-lg tracking-[0.3em]"
                readOnly
                type={showPin ? "text" : "password"}
                value={pin}
              />
              <Button
                className="shrink-0"
                onClick={() => setShowPin((prev) => !prev)}
                size="icon"
                variant="outline"
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                className="shrink-0"
                onClick={() => onCopyToClipboard(pin)}
                size="icon"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-foreground/20 border-t-2 pt-3 text-muted-foreground text-xs">
              <strong>Combinations:</strong>{" "}
              {(10 ** settings.length).toLocaleString()}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
