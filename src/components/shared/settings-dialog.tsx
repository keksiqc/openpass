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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToDefaults: () => void;
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
    toast.success("Settings saved successfully!");
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setIsOpen(false);
  };

  const generateNewKey = () => {
    const newKey = generateKey();
    setLocalSettings((prev) => ({
      ...prev,
      encryptionKey: newKey,
    }));
    toast.success("New encryption key generated!");
  };

  const handleClearAllData = () => {
    if (showClearDataConfirm) {
      onClearAllData();
      setShowClearDataConfirm(false);
      setIsOpen(false);
      toast.success("All data cleared successfully!");
    } else {
      setShowClearDataConfirm(true);
    }
  };

  const handleResetToDefaults = () => {
    if (showResetConfirm) {
      onResetToDefaults();
      setShowResetConfirm(false);
      setIsOpen(false);
      toast.success("All settings reset to defaults!");
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="outline">
          <SettingsIcon className="h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="border-2 border-foreground bg-accent p-1.5">
              <SettingsIcon className="h-4 w-4 text-accent-foreground" />
            </div>
            Application Settings
          </DialogTitle>
          <DialogDescription>
            Configure privacy and security options for OpenPass
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Privacy Settings */}
            <Card className="border-2 shadow-none">
              <CardHeader>
                <CardTitle className="text-sm">Privacy Settings</CardTitle>
                <CardDescription className="text-sm">
                  Control what data is stored locally
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      className="font-bold text-sm"
                      htmlFor="historyEnabled"
                    >
                      Enable Password History
                    </Label>
                    <p className="mt-1 max-w-xs text-muted-foreground text-xs">
                      Store generated passwords in local history for easy access
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.historyEnabled}
                    id="historyEnabled"
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
            <Card className="border-2 shadow-none">
              <CardHeader>
                <CardTitle className="text-sm">Security Settings</CardTitle>
                <CardDescription className="text-sm">
                  Encrypt your locally stored data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      className="font-bold text-sm"
                      htmlFor="encryptionEnabled"
                    >
                      Enable Local Data Encryption
                    </Label>
                    <p className="mt-1 max-w-xs text-muted-foreground text-xs">
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
                  <div className="space-y-3 pl-2">
                    <Label
                      className="font-bold text-sm"
                      htmlFor="encryptionKey"
                    >
                      Encryption Key
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          className="pr-10"
                          id="encryptionKey"
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              encryptionKey: e.target.value,
                            }))
                          }
                          placeholder="Enter encryption key..."
                          type={showEncryptionKey ? "text" : "password"}
                          value={localSettings.encryptionKey}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowEncryptionKey(!showEncryptionKey)
                          }
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
                        className="gap-2"
                        onClick={generateNewKey}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Generate
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
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
            <Card className="border-2 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4" />
                  Data Management
                </CardTitle>
                <CardDescription className="text-sm">
                  Export and import your profiles and history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full gap-2"
                  onClick={onExportData}
                  variant="outline"
                >
                  <Download className="h-4 w-4" />
                  Export All Data
                </Button>
                <div className="relative">
                  <Button
                    className="w-full cursor-pointer gap-2"
                    variant="outline"
                  >
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
            <Card className="border-2 border-destructive/50 shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive text-sm">
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
                    className="gap-2"
                    onClick={handleClearAllData}
                    variant={showClearDataConfirm ? "destructive" : "outline"}
                  >
                    <Trash2 className="h-4 w-4" />
                    {showClearDataConfirm
                      ? "Confirm: Clear All Data"
                      : "Clear All Data"}
                  </Button>
                  {showClearDataConfirm && (
                    <p className="text-muted-foreground text-xs">
                      Click again to permanently delete all profiles, history,
                      and settings.
                    </p>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  <Button
                    className="gap-2"
                    onClick={handleResetToDefaults}
                    variant={showResetConfirm ? "destructive" : "outline"}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {showResetConfirm
                      ? "Confirm: Reset All Settings"
                      : "Reset All Settings"}
                  </Button>
                  {showResetConfirm && (
                    <p className="text-muted-foreground text-xs">
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
        <div className="flex justify-end gap-3 border-foreground/20 border-t-2 pt-4">
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
