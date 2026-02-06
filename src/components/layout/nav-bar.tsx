import { Github, Lock, RotateCcwKey } from "lucide-react";
import type React from "react";
import type { AppSettings } from "../../types";
import { ModeToggle } from "../mode-toggle";
import { SettingsDialog } from "../shared/settings-dialog";

interface NavBarProps {
  appSettings: AppSettings;
  handleSettingsChange: (settings: AppSettings) => void;
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
  <header className="sticky top-0 z-50 w-full bg-background">
    {/* Top accent line */}
    <div className="h-1 w-full bg-accent" />
    <div className="border-foreground border-b-2">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between sm:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="border-2 border-foreground bg-foreground p-1.5">
              <RotateCcwKey className="h-4 w-4 text-background sm:h-5 sm:w-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="font-display font-extrabold text-lg uppercase tracking-tight sm:text-xl">
                OpenPass
              </h1>
              <span className="hidden text-[10px] text-muted-foreground uppercase tracking-[0.2em] sm:block">
                v1.0
              </span>
            </div>
          </div>

          {/* Actions */}
          <nav className="flex items-center gap-2">
            <div className="hidden items-center md:flex">
              <div className="border-2 border-foreground bg-card px-3 py-1 text-[10px] uppercase tracking-widest">
                <kbd className="font-bold">Ctrl+G</kbd>{" "}
                <span className="text-muted-foreground">Generate</span>
              </div>
            </div>
            <a
              className="inline-flex size-9 shrink-0 items-center justify-center border-2 border-foreground bg-background text-foreground shadow-brutal-sm transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground active:translate-y-0.5 active:shadow-none"
              href="https://github.com/keksiqc/openpass"
              rel="noopener noreferrer"
              target="_blank"
              aria-label="GitHub repository"
            >
              <Github className="h-4 w-4" />
            </a>
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
    {/* Status bar */}
    <div className="overflow-hidden border-foreground border-b bg-card">
      <div className="flex h-7 items-center">
        <div className="flex shrink-0 items-center gap-1.5 border-foreground border-r bg-accent px-3 text-[10px] text-accent-foreground uppercase tracking-widest">
          <Lock className="h-2.5 w-2.5" />
          Secure
        </div>
        <div className="flex flex-1 items-center overflow-hidden px-3">
          <div className="flex animate-marquee items-center gap-6 whitespace-nowrap text-[10px] text-muted-foreground uppercase tracking-widest">
            <span>Client-side only</span>
            <span className="text-accent">{"///"}</span>
            <span>Zero data transmitted</span>
            <span className="text-accent">{"///"}</span>
            <span>Cryptographically secure</span>
            <span className="text-accent">{"///"}</span>
            <span>Open source</span>
            <span className="text-accent">{"///"}</span>
            <span>Client-side only</span>
            <span className="text-accent">{"///"}</span>
            <span>Zero data transmitted</span>
            <span className="text-accent">{"///"}</span>
            <span>Cryptographically secure</span>
            <span className="text-accent">{"///"}</span>
            <span>Open source</span>
            <span className="text-accent">{"///"}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);
