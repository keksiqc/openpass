import { Copy, Hash, RefreshCw } from 'lucide-react'; // Added RefreshCw
import { toast } from 'sonner';
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
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="rounded-lg border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 p-2">
            <Hash className="h-4 w-4 text-primary" />
          </div>
          PIN Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {' '}
        {/* Changed from space-y-8 to space-y-6 */}
        <div className="space-y-3">
          <Label className="font-medium text-base" htmlFor="pin-length">
            PIN Length: {length}
          </Label>
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
          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <Label className="font-medium text-sm">Generated PIN</Label>
            <div className="flex items-center gap-2">
              <Input
                className="pr-2 font-mono text-sm"
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
