import { RotateCcwKey } from "lucide-react";
import type React from "react";
import type { AppSettings } from "../../types";
import { ModeToggle } from "../mode-toggle";
import { SettingsDialog } from "../shared/settings-dialog";

interface NavBarProps {
  appSettings: AppSettings;
  exportProfiles: () => void;
  handleClearAllData: () => void;
  handleResetToDefaults: () => void;
  handleSettingsChange: (settings: AppSettings) => void;
  importProfiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  appSettings,
  handleSettingsChange,
  handleClearAllData,
  exportProfiles,
  importProfiles,
  handleResetToDefaults,
}) => (
  <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
    <div className="container mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex h-14 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <RotateCcwKey className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tracking-tight">OpenPass</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Password Generator
            </span>
          </div>
        </div>

        {/* Navigation and Actions */}
        <nav className="flex items-center gap-2">
          <div className="hidden items-center md:flex">
            <span className="rounded-md bg-muted px-2.5 py-1.5 text-xs text-muted-foreground">
              <kbd className="font-mono font-medium">⌘G</kbd>
              <span className="ml-1.5">Generate</span>
            </span>
          </div>
          <SettingsDialog
            onClearAllData={handleClearAllData}
            onExportData={exportProfiles}
            onImportData={importProfiles}
            onResetToDefaults={handleResetToDefaults}
            onSettingsChange={handleSettingsChange}
            settings={appSettings}
          />
          <ModeToggle />
        </nav>
      </div>
    </div>
  </header>
);
