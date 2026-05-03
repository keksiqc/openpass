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
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { AppSettings } from "../../types";
import { generateKey } from "../../utils/encryption";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

interface SettingsDialogProps {
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDefaults: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  settings: AppSettings;
}

export function SettingsDialog({
  settings,
  onSettingsChange,
  onClearAllData,
  onExportData,
  onImportData,
  onResetToDefaults,
}: SettingsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setIsOpen(false);
    toast.success("Settings saved");
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setIsOpen(false);
  };

  const generateNewKey = () => {
    const newKey = generateKey();
    setLocalSettings((prev) => ({ ...prev, encryptionKey: newKey }));
    toast.success("New encryption key generated");
  };

  const handleClearAllData = () => {
    if (showClearDataConfirm) {
      onClearAllData();
      setShowClearDataConfirm(false);
      setIsOpen(false);
      toast.success("All data cleared");
    } else {
      setShowClearDataConfirm(true);
    }
  };

  const handleResetToDefaults = () => {
    if (showResetConfirm) {
      onResetToDefaults();
      setShowResetConfirm(false);
      setIsOpen(false);
      toast.success("Settings reset to defaults");
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <SettingsIcon className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-accent" />
            Application Settings
          </DialogTitle>
          <DialogDescription>Configure privacy and security options for OpenPass</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Privacy */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-sm">Privacy</CardTitle>
                <CardDescription className="text-xs">
                  Control what data is stored locally
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium" htmlFor="historyEnabled">
                      Password History
                    </Label>
                    <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
                      Store generated passwords locally for quick access
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.historyEnabled}
                    id="historyEnabled"
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({ ...prev, historyEnabled: checked as boolean }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="text-sm">Security</CardTitle>
                <CardDescription className="text-xs">
                  Encrypt your locally stored data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium" htmlFor="encryptionEnabled">
                      Local Encryption
                    </Label>
                    <p className="mt-0.5 max-w-xs text-xs text-muted-foreground">
                      Encrypt profiles and history with a custom key
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.encryptionEnabled}
                    id="encryptionEnabled"
                    onCheckedChange={(checked) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        encryptionEnabled: checked as boolean,
                      }))
                    }
                  />
                </div>
                {localSettings.encryptionEnabled && (
                  <div className="space-y-2.5">
                    <Label className="text-sm font-medium" htmlFor="encryptionKey">
                      Encryption Key
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          className="pr-10 font-mono text-sm"
                          id="encryptionKey"
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              encryptionKey: e.target.value,
                            }))
                          }
                          placeholder="Enter encryption key…"
                          type={showEncryptionKey ? "text" : "password"}
                          value={localSettings.encryptionKey}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          {showEncryptionKey ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        className="gap-1.5"
                        onClick={generateNewKey}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep this key safe — you'll need it to decrypt your data.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Data Management */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Download className="h-4 w-4" />
                  Data Management
                </CardTitle>
                <CardDescription className="text-xs">
                  Export and import profiles and history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Button className="w-full gap-2" onClick={onExportData} variant="outline">
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
                <div className="relative">
                  <Button className="w-full cursor-pointer gap-2" variant="outline">
                    <Upload className="h-4 w-4" />
                    Import From Backup
                  </Button>
                  <Input
                    accept=".json"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={onImportData}
                    type="file"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-xs">
                  Permanently delete stored data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Button
                  className="gap-2"
                  onClick={handleClearAllData}
                  variant={showClearDataConfirm ? "destructive" : "outline"}
                >
                  <Trash2 className="h-4 w-4" />
                  {showClearDataConfirm ? "Confirm: Clear All Data" : "Clear All Data"}
                </Button>
                {showClearDataConfirm && (
                  <p className="text-xs text-muted-foreground">
                    Click again to permanently delete all profiles, history, and settings.
                  </p>
                )}
                <Button
                  className="gap-2"
                  onClick={handleResetToDefaults}
                  variant={showResetConfirm ? "destructive" : "outline"}
                >
                  <RefreshCw className="h-4 w-4" />
                  {showResetConfirm ? "Confirm: Reset Settings" : "Reset All Settings"}
                </Button>
                {showResetConfirm && (
                  <p className="text-xs text-muted-foreground">
                    Click again to reset all settings. This will clear profiles and history too.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
