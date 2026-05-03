import { Copy, Eye, EyeOff, Hash, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { usePinGenerator } from "../../hooks/use-pin-generator";
import type { PasswordHistory, PinSettings } from "../../types";

interface PinGeneratorProps {
  onCopyToClipboard: (text: string) => void;
  onPinGenerated: (pin: string, historyEntry: PasswordHistory) => void;
  onSettingsChange: (settings: PinSettings) => void;
  settings: PinSettings;
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
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-accent" />
          PIN Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium" htmlFor="pin-length">
              PIN Length
            </Label>
            <Badge variant="secondary">{settings.length} digits</Badge>
          </div>
          <Slider
            className="w-full"
            id="pin-length"
            max={12}
            min={4}
            onValueChange={(value) => onSettingsChange({ ...settings, length: value[0] })}
            value={[settings.length]}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>12</span>
          </div>
        </div>

        <Button className="w-full" data-generate-button onClick={handleGenerate} size="lg">
          <RefreshCw />
          Generate PIN
        </Button>

        {pin ? (
          <div className="space-y-3 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <span className="text-xs font-medium text-muted-foreground">Result</span>
            <div className="flex items-center gap-2">
              <Input
                className="flex-1 font-mono text-lg font-semibold tracking-[0.25em]"
                readOnly
                type={showPin ? "text" : "password"}
                value={pin}
              />
              <Button onClick={() => setShowPin((prev) => !prev)} size="icon" variant="outline">
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button onClick={() => onCopyToClipboard(pin)} size="icon" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-lg bg-background/80 px-3 py-2 text-xs">
              <div className="mb-0.5 text-[10px] text-muted-foreground">Possible combinations</div>
              <div className="font-mono font-medium">
                {(10 ** settings.length).toLocaleString()}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
