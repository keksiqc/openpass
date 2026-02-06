import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      {/* Configuration */}
      <div className="border-2 border-foreground bg-card shadow-brutal">
        <div className="border-foreground border-b-2 px-4 py-3 sm:px-5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            Configuration
          </span>
        </div>
        <div className="space-y-5 p-4 sm:p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="font-bold text-xs uppercase tracking-wider" htmlFor="pin-length">
                PIN Length
              </Label>
              <div className="border-2 border-foreground bg-background px-2.5 py-0.5 text-center font-bold font-mono text-sm tabular-nums">
                {settings.length}
              </div>
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
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
              <span>Min: 4</span>
              <span>Max: 12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button className="w-full" data-generate-button onClick={handleGenerate} size="lg">
        <RefreshCw className="mr-2 h-4 w-4" />
        Generate PIN
      </Button>

      {/* Result */}
      {pin ? (
        <div className="border-2 border-foreground bg-card shadow-brutal">
          <div className="border-foreground border-b-2 px-4 py-3 sm:px-5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Output
            </span>
          </div>
          <div className="space-y-4 p-4 sm:p-5">
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
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                className="shrink-0"
                onClick={() => onCopyToClipboard(pin)}
                size="icon"
                variant="outline"
                aria-label="Copy PIN"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-2 border-foreground bg-background p-2.5">
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest">
                Possible Combinations
              </div>
              <div className="font-bold font-mono text-sm">
                {(10 ** settings.length).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
