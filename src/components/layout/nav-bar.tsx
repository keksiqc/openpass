import { RotateCcwKey } from 'lucide-react';
import type React from 'react';
import { ModeToggle } from '../mode-toggle';
import { SettingsDialog } from '../shared/settings-dialog';

interface NavBarProps {
  appSettings: any;
  handleSettingsChange: (settings: any) => void;
  handleClearAllData: () => void;
  exportProfiles: () => void;
  importProfiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleResetToDefaults: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  appSettings,
  handleSettingsChange,
  handleClearAllData,
  exportProfiles,
  importProfiles,
  handleResetToDefaults,
}) => (
  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container mx-auto max-w-7xl px-4">
      <div className="flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <RotateCcwKey className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-2xl tracking-tight">OpenPass</h1>
            <span className="hidden text-muted-foreground text-sm leading-tight sm:block">
              Secure Password Generator
            </span>
          </div>
        </div>
        {/* Navigation and Features */}
        <nav className="flex items-center gap-4">
          <div className="hidden items-center gap-6 md:flex">
            <div className="rounded-md border bg-muted/30 px-3 py-1.5 text-muted-foreground text-xs">
              <kbd className="font-mono text-xs">Ctrl+G</kbd> to generate
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
  </header>
);
