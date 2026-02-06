import { Copy, Hash, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { usePinGenerator } from '../../hooks/usePinGenerator';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <Hash className="h-4 w-4 text-accent-foreground" />
          </div>
          PIN Generator
        </CardTitle>
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
            <Badge variant="outline">{length} digits</Badge>
          </div>
          <Slider
            className="w-full"
            id="pin-length"
            max={12}
            min={4}
            onValueChange={(value) => setLength(value[0])}
            value={[length]}
          />
        </div>
        <Button
          className="w-full"
          data-generate-button
          onClick={generatePin}
          size="lg"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate PIN
        </Button>
        {pin && (
          <div className="space-y-3 border-2 border-foreground p-4 shadow-brutal">
            <Label className="font-bold text-xs uppercase tracking-widest">
              Output
            </Label>
            <div className="flex items-center gap-2">
              <Input
                className="pr-2 font-bold font-mono text-lg tracking-[0.3em]"
                readOnly
                type="text"
                value={pin}
              />
              <Button
                className="shrink-0"
                onClick={handleCopyToClipboard}
                size="icon"
                variant="outline"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
