import { Copy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { usePinGenerator } from '../hooks/usePinGenerator';
import { toast } from 'sonner';

export function PinGenerator() {
  const { pin, length, setLength, generatePin } = usePinGenerator();

  const handleCopyToClipboard = () => {
    if (pin) {
      navigator.clipboard.writeText(pin);
      toast.success('PIN copied to clipboard!');
    } else {
      toast.error('No PIN generated yet.');
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Settings className="h-5 w-5 text-primary" />
          PIN Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="pin-length" className="text-base font-medium">
            PIN Length: {length}
          </Label>
          <Slider
            id="pin-length"
            min={4}
            max={12}
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            className="w-full"
          />
        </div>

        <Button
          onClick={generatePin}
          className="w-full"
          size="lg"
          data-generate-button
        >
          <Settings className="h-4 w-4 mr-2" />
          Generate PIN
        </Button>

        {pin && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
            <Label className="text-sm font-medium">Generated PIN</Label>
            <div className="flex items-center gap-2">
              <Input
                value={pin}
                readOnly
                type="text"
                className="font-mono text-sm pr-2"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyToClipboard}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
}
