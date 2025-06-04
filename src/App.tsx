// filepath: /workspaces/openpass/src/App.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, RefreshCw, RotateCcwKey, Settings, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FormatGenerator } from './components/format-generator';
import { HistoryPanel } from './components/history-panel';
import { ModeToggle } from './components/mode-toggle';
import { PassphraseGenerator } from './components/passphrase-generator';
import { PasswordGenerator } from './components/password-generator';
import { ProfileManager } from './components/profile-manager';
import { SettingsDialog } from './components/settings-dialog';
import { Badge } from './components/ui/badge';
import {
  clearAllData,
  loadHistory,
  loadProfiles,
  loadSettings,
  saveHistory,
  saveProfiles,
  saveSettings,
} from './services/storage';
import type {
  AppSettings,
  FormatSettings,
  PassphraseSettings,
  PasswordHistory,
  PasswordProfile,
  PasswordSettings,
} from './types';

export default function App() {
  // Settings states with enhanced defaults
  const [passwordSettings, setPasswordSettings] = useState<PasswordSettings>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    customCharacters: '',
    excludeSimilar: false,
    excludeAmbiguous: false,
    minNumbers: 1,
    minSymbols: 1,
  });

  const [passphraseSettings, setPassphraseSettings] =
    useState<PassphraseSettings>({
      wordCount: 4,
      separator: '-',
      includeNumbers: false,
      customWords: [],
      wordCase: 'lowercase',
    });

  const [formatSettings, setFormatSettings] = useState<FormatSettings>({
    format: '2u4l2d2{#$%}',
    templates: [
      { name: 'Strong Mixed', pattern: '2u4l2d2{#$%}' },
      { name: 'Alphanumeric', pattern: '3u3l4d' },
      { name: 'Complex', pattern: '1u6l1{@#$}3d1{!%&}' },
      { name: 'Simple', pattern: '4l4d' },
    ],
  });

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('password');
  const [profiles, setProfiles] = useState<PasswordProfile[]>([]);
  const [profileName, setProfileName] = useState('');
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    historyEnabled: true,
    encryptionEnabled: false,
    encryptionKey: '',
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const settings = loadSettings();
    setAppSettings(settings);
    setProfiles(loadProfiles());
    setPasswordHistory(loadHistory());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + G to generate password
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        // Trigger generation based on active tab
        const generateButton = document.querySelector(
          '[data-generate-button]',
        ) as HTMLButtonElement;
        if (generateButton) {
          generateButton.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save profiles to localStorage
  const saveProfilesToStorage = (newProfiles: PasswordProfile[]) => {
    saveProfiles(newProfiles);
    setProfiles(newProfiles);
  };

  // Save history to localStorage
  const saveHistoryToStorage = (newHistory: PasswordHistory[]) => {
    saveHistory(newHistory);
    setPasswordHistory(newHistory);
  };

  // Add to history
  const addToHistory = (_password: string, historyEntry: PasswordHistory) => {
    if (!appSettings.historyEnabled) {
      return;
    }
    const newHistory = [historyEntry, ...passwordHistory].slice(0, 50); // Keep last 50
    saveHistoryToStorage(newHistory);
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Save profile
  const saveProfile = () => {
    if (!profileName.trim()) {
      toast.error('Please enter a profile name');
      return;
    }

    // Check for duplicate names
    if (
      profiles.some(
        (p) => p.name.toLowerCase() === profileName.trim().toLowerCase(),
      )
    ) {
      toast.error('A profile with this name already exists');
      return;
    }

    const newProfile: PasswordProfile = {
      id: Date.now().toString(),
      name: profileName.trim(),
      type: activeTab as any,
      settings:
        activeTab === 'password'
          ? passwordSettings
          : activeTab === 'passphrase'
            ? passphraseSettings
            : formatSettings,
      createdAt: new Date(),
      isFavorite: false,
    };

    const newProfiles = [...profiles, newProfile];
    saveProfilesToStorage(newProfiles);
    setProfileName('');

    toast.success(`Profile "${newProfile.name}" saved successfully!`);
  };

  // Load profile
  const loadProfile = (profile: PasswordProfile) => {
    setActiveTab(profile.type);

    switch (profile.type) {
      case 'password':
        setPasswordSettings({ ...passwordSettings, ...profile.settings });
        break;
      case 'passphrase':
        setPassphraseSettings({ ...passphraseSettings, ...profile.settings });
        break;
      case 'format':
        setFormatSettings({ ...formatSettings, ...profile.settings });
        break;
    }

    // Update last used
    const updatedProfile = { ...profile, lastUsed: new Date() };
    const newProfiles = profiles.map((p) =>
      p.id === profile.id ? updatedProfile : p,
    );
    saveProfilesToStorage(newProfiles);

    toast.success(`Profile "${profile.name}" loaded successfully!`);
  };

  // Toggle favorite profile
  const toggleFavorite = (profileId: string) => {
    const newProfiles = profiles.map((p) =>
      p.id === profileId ? { ...p, isFavorite: !p.isFavorite } : p,
    );
    saveProfilesToStorage(newProfiles);
  };

  // Delete profile
  const deleteProfile = (profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    const newProfiles = profiles.filter((p) => p.id !== profileId);
    saveProfilesToStorage(newProfiles);
    toast.success(`Profile "${profile?.name}" deleted successfully!`);
  };

  // Clear history
  const clearHistory = () => {
    saveHistoryToStorage([]);
    toast.success('History cleared!');
  };

  // Settings management
  const handleSettingsChange = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    saveSettings(newSettings);
    
    // If history was disabled, clear it
    if (!newSettings.historyEnabled) {
      setPasswordHistory([]);
      saveHistoryToStorage([]);
    } else {
      // Reload history if it was re-enabled
      setPasswordHistory(loadHistory());
    }
  };

  // Clear all data
  const handleClearAllData = () => {
    clearAllData();
    setProfiles([]);
    setPasswordHistory([]);
    setAppSettings({
      historyEnabled: true,
      encryptionEnabled: false,
      encryptionKey: '',
    });
    saveSettings({
      historyEnabled: true,
      encryptionEnabled: false,
      encryptionKey: '',
    });
  };

  // Export/Import functions
  const exportProfiles = () => {
    const dataStr = JSON.stringify({ profiles, passwordHistory }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'openpass-backup.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const importProfiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.profiles) {
          saveProfilesToStorage([...profiles, ...data.profiles]);
        }
        if (data.passwordHistory) {
          saveHistoryToStorage([...passwordHistory, ...data.passwordHistory]);
        }
        toast.success('Data imported successfully!');
      } catch {
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <RotateCcwKey className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold tracking-tight">OpenPass</h1>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Secure Password Generator
                </span>
              </div>
            </div>

            {/* Navigation and Features */}
            <nav className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>100% Local & Secure</span>
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground border rounded px-2 py-1">
                  <kbd className="font-mono">Ctrl+G</kbd> to generate
                </div>
              </div>
              <SettingsDialog
                settings={appSettings}
                onSettingsChange={handleSettingsChange}
                onClearAllData={handleClearAllData}
              />
              <ModeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Grid Layout */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* Main Generator */}
          <div className="xl:col-span-2">
            <Card className="border shadow-sm">
              <CardHeader >
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <RefreshCw className="h-5 w-5 text-primary" />
                  </div>
                  Password Generator
                </CardTitle>
                <CardDescription className="text-sm">
                  Choose your preferred method to generate secure passwords
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger
                      value="password"
                      className="text-sm data-[state=active]:text-blue-600 data-[state=active]:border-blue-200"
                    >
                      <Zap className="h-4 w-4 mr-1.5" />
                      Password
                    </TabsTrigger>
                    <TabsTrigger
                      value="passphrase"
                      className="text-sm data-[state=active]:text-green-600 data-[state=active]:border-green-200"
                    >
                      <BookOpen className="h-4 w-4 mr-1.5" />
                      Passphrase
                    </TabsTrigger>
                    <TabsTrigger
                      value="format"
                      className="text-sm data-[state=active]:text-purple-600 data-[state=active]:border-purple-200"
                    >
                      <Settings className="h-4 w-4 mr-1.5" />
                      Format
                    </TabsTrigger>
                  </TabsList>

                  <PasswordGenerator
                    settings={passwordSettings}
                    onSettingsChange={setPasswordSettings}
                    onPasswordGenerated={addToHistory}
                    onCopyToClipboard={copyToClipboard}
                    isGenerating={isGenerating}
                    onGeneratingChange={setIsGenerating}
                  />

                  <PassphraseGenerator
                    settings={passphraseSettings}
                    onSettingsChange={setPassphraseSettings}
                    onPassphraseGenerated={addToHistory}
                    onCopyToClipboard={copyToClipboard}
                  />

                  <FormatGenerator
                    settings={formatSettings}
                    onSettingsChange={setFormatSettings}
                    onFormatGenerated={addToHistory}
                    onCopyToClipboard={copyToClipboard}
                  />
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6">
              <ProfileManager
                profiles={profiles}
                profileName={profileName}
                onProfileNameChange={setProfileName}
                activeTab={activeTab}
                passwordSettings={passwordSettings}
                passphraseSettings={passphraseSettings}
                formatSettings={formatSettings}
                passwordHistory={passwordHistory}
                onSaveProfile={saveProfile}
                onLoadProfile={loadProfile}
                onToggleFavorite={toggleFavorite}
                onDeleteProfile={deleteProfile}
                onExportData={exportProfiles}
                onImportData={importProfiles}
              />

              {appSettings.historyEnabled && (
                <HistoryPanel
                  history={passwordHistory}
                  onCopyToClipboard={copyToClipboard}
                  onClearHistory={clearHistory}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
