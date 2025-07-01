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
  <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
              <RotateCcwKey className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight">OpenPass</h1>
              <span className="text-xs text-muted-foreground hidden sm:block leading-tight font-medium">
                Secure Password Generator
              </span>
            </div>
          </div>
        </div>

        {/* Navigation and Features */}
        <nav className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4">
            <div className="text-xs text-muted-foreground border rounded-lg px-3 py-2 bg-muted/40 backdrop-blur-sm">
              <kbd className="font-mono text-xs font-medium bg-background/80 px-1.5 py-0.5 rounded border shadow-sm">
                Ctrl+G
              </kbd>
              <span className="ml-2">to generate</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <SettingsDialog
              settings={appSettings}
              onSettingsChange={handleSettingsChange}
              onClearAllData={handleClearAllData}
              onExportData={exportProfiles}
              onImportData={importProfiles}
              onResetToDefaults={handleResetToDefaults}
            />
            <ModeToggle />
          </div>
        </nav>
      </div>
    </div>
  </header>
);
