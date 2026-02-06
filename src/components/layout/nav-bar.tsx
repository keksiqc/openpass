import { RotateCcwKey } from 'lucide-react';
import type React from 'react';
import type { AppSettings } from '../../types';
import { ModeToggle } from '../mode-toggle';
import { SettingsDialog } from '../shared/settings-dialog';

type NavBarProps = {
  appSettings: AppSettings;
  handleSettingsChange: (settings: AppSettings) => void;
  handleClearAllData: () => void;
  exportProfiles: () => void;
  importProfiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetToDefaults: () => void;
};

export const NavBar: React.FC<NavBarProps> = ({
  appSettings,
  handleSettingsChange,
  handleClearAllData,
  exportProfiles,
  importProfiles,
  handleResetToDefaults,
}) => (
  <header className="sticky top-0 z-50 w-full bg-background">
    {/* Accent strip */}
    <div className="h-1 w-full bg-accent" />
    <div className="border-foreground border-b-2">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="border-2 border-foreground bg-accent p-2 shadow-brutal-sm">
              <RotateCcwKey className="h-5 w-5 text-accent-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-lg uppercase tracking-[0.2em]">
                OpenPass
              </h1>
              <span className="hidden text-[10px] text-muted-foreground uppercase tracking-[0.15em] sm:block">
                Secure Password Generator
              </span>
            </div>
          </div>
          {/* Navigation and Features */}
          <nav className="flex items-center gap-3">
            <div className="hidden items-center gap-4 md:flex">
              <div className="border-2 border-foreground px-3 py-1.5 text-[10px] uppercase tracking-widest">
                <kbd className="font-bold">Ctrl+G</kbd> Generate
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
