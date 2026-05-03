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
  <header className="sticky top-0 z-50 w-full bg-background">
    {/* Diagonal accent strip */}
    <div className="accent-strip h-1.5 w-full" />
    <div className="border-b-2 border-foreground">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex h-14 items-center justify-between sm:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="shadow-brutal-sm border-2 border-foreground bg-accent p-1.5 sm:p-2">
              <RotateCcwKey className="h-5 w-5 text-accent-foreground sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-display text-lg font-extrabold tracking-tight uppercase sm:text-2xl">
                OpenPass
              </h1>
              <span className="hidden text-[10px] tracking-[0.15em] text-muted-foreground uppercase sm:block">
                Password Generator
              </span>
            </div>
          </div>
          {/* Navigation and Actions */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center md:flex">
              <div className="border-2 border-foreground bg-secondary px-3 py-1.5 text-[10px] tracking-widest uppercase">
                <kbd className="font-bold">Ctrl+G</kbd>{" "}
                <span className="text-muted-foreground">Generate</span>
              </div>
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
    </div>
  </header>
);
