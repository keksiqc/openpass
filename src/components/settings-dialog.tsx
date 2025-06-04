import { AlertTriangle, Eye, EyeOff, Save, RefreshCw, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { AppSettings } from '../types';
import { SimpleEncryption } from '../utils/encryption';
import { Button } from './ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card';
import { Checkbox } from './ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SettingsDialogProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClearAllData: () => void;
}

export function SettingsDialog({
  settings,
  onSettingsChange,
  onClearAllData,
}: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setIsOpen(false);
    toast.success('Settings saved successfully!');
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setIsOpen(false);
  };

  const generateNewKey = () => {
    const newKey = SimpleEncryption.generateKey();
    setLocalSettings(prev => ({
      ...prev,
      encryptionKey: newKey,
    }));
    toast.success('New encryption key generated!');
  };

  const handleClearAllData = () => {
    if (showClearDataConfirm) {
      onClearAllData();
      setShowClearDataConfirm(false);
      setIsOpen(false);
      toast.success('All data cleared successfully!');
    } else {
      setShowClearDataConfirm(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Application Settings
          </DialogTitle>
          <DialogDescription>
            Configure privacy and security options for OpenPass
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Privacy Settings</CardTitle>
              <CardDescription className="text-sm">
                Control what data is stored locally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="historyEnabled"
                  checked={localSettings.historyEnabled}
                  onCheckedChange={(checked) =>
                    setLocalSettings(prev => ({
                      ...prev,
                      historyEnabled: checked as boolean,
                    }))
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="historyEnabled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable Password History
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Store generated passwords in local history for easy access
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security Settings</CardTitle>
              <CardDescription className="text-sm">
                Encrypt your locally stored data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="encryptionEnabled"
                  checked={localSettings.encryptionEnabled}
                  onCheckedChange={(checked) =>
                    setLocalSettings(prev => ({
                      ...prev,
                      encryptionEnabled: checked as boolean,
                    }))
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="encryptionEnabled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Enable Local Data Encryption
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Encrypt profiles and history with a custom key
                  </p>
                </div>
              </div>

              {localSettings.encryptionEnabled && (
                <div className="space-y-3 pl-6">
                  <Label htmlFor="encryptionKey" className="text-sm font-medium">
                    Encryption Key
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="encryptionKey"
                        type={showEncryptionKey ? 'text' : 'password'}
                        value={localSettings.encryptionKey}
                        onChange={(e) =>
                          setLocalSettings(prev => ({
                            ...prev,
                            encryptionKey: e.target.value,
                          }))
                        }
                        placeholder="Enter encryption key..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                      >
                        {showEncryptionKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateNewKey}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep this key safe! You'll need it to decrypt your data.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-sm">
                Permanently delete all stored data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant={showClearDataConfirm ? 'destructive' : 'outline'}
                  onClick={handleClearAllData}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {showClearDataConfirm ? 'Confirm: Clear All Data' : 'Clear All Data'}
                </Button>
                {showClearDataConfirm && (
                  <p className="text-xs text-muted-foreground">
                    Click again to permanently delete all profiles, history, and settings.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
