import { RotateCcwKey } from 'lucide-react';
import type React from 'react';
import { ModeToggle } from './mode-toggle';
import { SettingsDialog } from './settings-dialog';

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
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary text-primary-foreground">
            <RotateCcwKey className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">OpenPass</h1>
            <span className="text-sm text-muted-foreground hidden sm:block leading-tight">
              Secure Password Generator
            </span>
          </div>
        </div>
        {/* Navigation and Features */}
        <nav className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            <div className="text-xs text-muted-foreground border rounded-md px-3 py-1.5 bg-muted/30">
              <kbd className="font-mono text-xs">Ctrl+G</kbd> to generate
            </div>
          </div>
          <SettingsDialog
            settings={appSettings}
            onSettingsChange={handleSettingsChange}
            onClearAllData={handleClearAllData}
            onExportData={exportProfiles}
            onImportData={importProfiles}
            onResetToDefaults={handleResetToDefaults}
          />
          <ModeToggle />
        </nav>
      </div>
    </div>
  </header>
);
