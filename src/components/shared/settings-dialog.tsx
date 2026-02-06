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
    setLocalSettings((prev) => ({ ...prev, encryptionKey: newKey }));
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
        <Button className="gap-2" size="icon" variant="outline">
          <SettingsIcon className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg uppercase">
            <div className="border-2 border-foreground bg-foreground p-1">
              <SettingsIcon className="h-3.5 w-3.5 text-background" />
            </div>
            Settings
          </DialogTitle>
          <DialogDescription className="text-[11px] uppercase tracking-wider">
            Privacy, security, and data management
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Privacy */}
            <div className="border-2 border-foreground">
              <div className="border-foreground border-b-2 px-4 py-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Privacy
                </span>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-bold text-xs" htmlFor="historyEnabled">
                      Password History
                    </Label>
                    <p className="mt-0.5 max-w-[200px] text-[10px] text-muted-foreground leading-relaxed">
                      Store generated passwords locally
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
              </div>
            </div>

            {/* Security */}
            <div className="border-2 border-foreground">
              <div className="border-foreground border-b-2 px-4 py-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Security
                </span>
              </div>
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-bold text-xs" htmlFor="encryptionEnabled">
                      Encryption
                    </Label>
                    <p className="mt-0.5 max-w-[200px] text-[10px] text-muted-foreground leading-relaxed">
                      Encrypt local data with a key
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
                  <div className="space-y-2 border-foreground/20 border-t pt-3">
                    <Label className="font-bold text-[10px] uppercase tracking-wider" htmlFor="encryptionKey">
                      Key
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          className="pr-9 text-xs"
                          id="encryptionKey"
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              encryptionKey: e.target.value,
                            }))
                          }
                          placeholder="Enter key..."
                          type={showEncryptionKey ? "text" : "password"}
                          value={localSettings.encryptionKey}
                        />
                        <Button
                          className="absolute top-0 right-0 h-full px-2 hover:bg-transparent"
                          onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                          size="sm"
                          type="button"
                          variant="ghost"
                        >
                          {showEncryptionKey ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <Button
                        className="gap-1 text-[10px]"
                        onClick={generateNewKey}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Gen
                      </Button>
                    </div>
                    <p className="text-[9px] text-muted-foreground">
                      Keep this key safe -- needed to decrypt data.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Data Management */}
            <div className="border-2 border-foreground">
              <div className="border-foreground border-b-2 px-4 py-2">
                <div className="flex items-center gap-1.5">
                  <Download className="h-3 w-3" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Data
                  </span>
                </div>
              </div>
              <div className="space-y-2 p-4">
                <Button className="w-full gap-1.5 text-[10px]" onClick={onExportData} size="sm" variant="outline">
                  <Download className="h-3 w-3" />
                  Export All Data
                </Button>
                <div className="relative">
                  <Button className="w-full cursor-pointer gap-1.5 text-[10px]" size="sm" variant="outline">
                    <Upload className="h-3 w-3" />
                    Import Backup
                  </Button>
                  <Input
                    accept=".json"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={onImportData}
                    type="file"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-destructive/50">
              <div className="border-destructive/50 border-b-2 px-4 py-2">
                <div className="flex items-center gap-1.5 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-[10px] uppercase tracking-[0.2em]">
                    Danger
                  </span>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <Button
                    className="gap-1.5 text-[10px]"
                    onClick={handleClearAllData}
                    size="sm"
                    variant={showClearDataConfirm ? "destructive" : "outline"}
                  >
                    <Trash2 className="h-3 w-3" />
                    {showClearDataConfirm ? "Confirm Clear" : "Clear All Data"}
                  </Button>
                  {showClearDataConfirm && (
                    <p className="mt-1.5 text-[9px] text-muted-foreground">
                      Click again to permanently delete everything.
                    </p>
                  )}
                </div>
                <div>
                  <Button
                    className="gap-1.5 text-[10px]"
                    onClick={handleResetToDefaults}
                    size="sm"
                    variant={showResetConfirm ? "destructive" : "outline"}
                  >
                    <RefreshCw className="h-3 w-3" />
                    {showResetConfirm ? "Confirm Reset" : "Reset Settings"}
                  </Button>
                  {showResetConfirm && (
                    <p className="mt-1.5 text-[9px] text-muted-foreground">
                      Click again to reset all settings to defaults.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end gap-2 border-foreground/20 border-t-2 pt-3">
          <Button onClick={handleCancel} size="sm" variant="outline">
            Cancel
          </Button>
          <Button className="gap-1.5" onClick={handleSave} size="sm">
            <Save className="h-3 w-3" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
