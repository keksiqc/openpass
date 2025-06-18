import {
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  Trash2,
  Upload,
} from 'lucide-react';
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
import { Switch } from './ui/switch';
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
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDefaults: () => void; // New prop for resetting settings
}

export function SettingsDialog({
  settings,
  onSettingsChange,
  onClearAllData,
  onExportData,
  onImportData,
  onResetToDefaults, // Destructure new prop
}: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false); // New state for reset confirmation

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
    setLocalSettings((prev) => ({
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

  const handleResetToDefaults = () => {
    if (showResetConfirm) {
      onResetToDefaults();
      setShowResetConfirm(false);
      setIsOpen(false);
      toast.success('All settings reset to defaults!');
    } else {
      setShowResetConfirm(true);
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
              <SettingsIcon className="h-4 w-4 text-primary" />
            </div>
            Application Settings
          </DialogTitle>
          <DialogDescription>
            Configure privacy and security options for OpenPass
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Privacy Settings</CardTitle>
                <CardDescription className="text-sm">
                  Control what data is stored locally
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="historyEnabled" className="text-sm font-medium">
                      Enable Password History
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Store generated passwords in local history for easy access
                    </p>
                  </div>
                  <Switch
                    id="historyEnabled"
                    checked={localSettings.historyEnabled}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        historyEnabled: checked as boolean,
                      }))
                    }
                  />
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
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="encryptionEnabled" className="text-sm font-medium">
                      Enable Local Data Encryption
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Encrypt profiles and history with a custom key
                    </p>
                  </div>
                  <Switch
                    id="encryptionEnabled"
                    checked={localSettings.encryptionEnabled}
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        encryptionEnabled: checked as boolean,
                      }))
                    }
                  />
                </div>
                {localSettings.encryptionEnabled && (
                  <div className="space-y-3 pl-2">
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
                            setLocalSettings((prev) => ({
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Data Management
                </CardTitle>
                <CardDescription className="text-sm">
                  Export and import your profiles and history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={onExportData}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full gap-2 cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    Import From Backup
                  </Button>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={onImportData}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
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
                    {showClearDataConfirm
                      ? 'Confirm: Clear All Data'
                      : 'Clear All Data'}
                  </Button>
                  {showClearDataConfirm && (
                    <p className="text-xs text-muted-foreground">
                      Click again to permanently delete all profiles, history,
                      and settings.
                    </p>
                  )}
                </div>
                <div className="space-y-3 mt-4">
                  <Button
                    variant={showResetConfirm ? 'destructive' : 'outline'}
                    onClick={handleResetToDefaults}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {showResetConfirm
                      ? 'Confirm: Reset All Settings'
                      : 'Reset All Settings'}
                  </Button>
                  {showResetConfirm && (
                    <p className="text-xs text-muted-foreground">
                      Click again to reset all application settings to their
                      default values. This will also clear all profiles and
                      history.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
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
