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
import { RefreshCw, RotateCcwKey } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FormatGenerator } from './components/format-generator';
import { HistoryPanel } from './components/history-panel';
import { ModeToggle } from './components/mode-toggle';
import { PassphraseGenerator } from './components/passphrase-generator';
import { PasswordGenerator } from './components/password-generator';
import { ProfileManager } from './components/profile-manager';
import { loadHistory, loadProfiles, saveHistory, saveProfiles } from './services/storage';
import type {
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
      capitalize: false,
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

  // Load data from localStorage on mount
  useEffect(() => {
    setProfiles(loadProfiles());
    setPasswordHistory(loadHistory());
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
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <RotateCcwKey className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">OpenPass</h1>
              <p className="text-muted-foreground">
                Secure Local Password Generator
              </p>
            </div>
          </div>
          <ModeToggle />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Generator */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Password Generator
                </CardTitle>
                <CardDescription>
                  Generate secure passwords, passphrases, and custom formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="passphrase">Passphrase</TabsTrigger>
                    <TabsTrigger value="format">Format</TabsTrigger>
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
          <div className="space-y-6">
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

            <HistoryPanel
              history={passwordHistory}
              onCopyToClipboard={copyToClipboard}
              onClearHistory={clearHistory}
            />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
