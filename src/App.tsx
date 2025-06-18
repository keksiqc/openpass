// filepath: /workspaces/openpass/src/App.tsx

import { BookOpen, Hash, Key, RotateCcwKey, Settings } from 'lucide-react'; // Added Shield
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomGenerator } from './components/custom-generator';
import { HistoryPanel } from './components/history-panel';
import { ModeToggle } from './components/mode-toggle';
import { PassphraseGenerator } from './components/passphrase-generator';
import { PasswordGenerator } from './components/password-generator';
import { PinGenerator } from './components/pin-generator'; // Import PinGenerator
import { ProfileManager } from './components/profile-manager';
import { SettingsDialog } from './components/settings-dialog';
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
  // FormatProfileSettings, // Removed
  PassphraseSettings,
  // PassphraseProfileSettings, // Removed
  PasswordHistory,
  PasswordSettings,
  // PasswordProfileSettings, // Removed
  PinSettings, // For Pin generator state
  Profile, // Updated umbrella Profile type
  ProfileType, // For activeTab state
  // PinProfileSettings, // Removed
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
    requireEachCharacterType: true, // Added
  });

  const [passphraseSettings, setPassphraseSettings] =
    useState<PassphraseSettings>({
      wordCount: 4,
      separator: '-',
      includeNumbers: false,
      customWords: [],
      wordCase: 'lowercase',
      insertNumbersRandomly: false, // Added
    });

  const [formatSettings, setFormatSettings] = useState<FormatSettings>({
    format: '2u4l2d2{#$%}',
    templates: [
      { name: 'Strong Mixed', pattern: '2u4l2d2{#$%}' },
      { name: 'Alphanumeric', pattern: '3u3l4d' },
      { name: 'Complex', pattern: '1u6l1{@#$}3d1{!%&}' },
      { name: 'Simple', pattern: '4l4d' },
      { name: 'Memorable', pattern: '1u4l1{#$%}4d' },
    ],
  });

  // Placeholder for PIN settings
  const [pinSettings, setPinSettings] = useState<PinSettings>({ length: 4 }); // Use PinSettings type

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileType>('password'); // Use ProfileType
  const [profiles, setProfiles] = useState<Profile[]>([]); // Use Profile[]
  const [profileName, setProfileName] = useState('');
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null); // New state for editing profile
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
  const saveProfilesToStorage = (newProfiles: Profile[]) => {
    // Changed to Profile[]
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

    if (editingProfileId) {
      // Update existing profile
      const updatedProfiles = profiles.map((p) =>
        p.id === editingProfileId
          ? ({
              ...p,
              name: profileName.trim(),
              type: activeTab, // activeTab is already ProfileType
              settings:
                activeTab === 'password'
                  ? passwordSettings
                  : activeTab === 'passphrase'
                    ? passphraseSettings
                    : activeTab === 'custom'
                      ? formatSettings
                      : pinSettings,
            } as Profile) // Ensure the constructed object matches one of the Profile union types
          : p,
      );
      saveProfilesToStorage(updatedProfiles);
      setEditingProfileId(null);
      toast.success(`Profile "${profileName.trim()}" updated successfully!`);
    } else {
      // Create new profile
      let newProfile: Profile | null = null;

      if (activeTab === 'password') {
        newProfile = {
          id: Date.now().toString(),
          name: profileName.trim(),
          type: 'password', // Literal type
          settings: passwordSettings, // Specific settings type
          createdAt: new Date(),
          isFavorite: false,
        };
      } else if (activeTab === 'passphrase') {
        newProfile = {
          id: Date.now().toString(),
          name: profileName.trim(),
          type: 'passphrase', // Literal type
          settings: passphraseSettings, // Specific settings type
          createdAt: new Date(),
          isFavorite: false,
        };
      } else if (activeTab === 'custom') {
        newProfile = {
          id: Date.now().toString(),
          name: profileName.trim(),
          type: 'custom', // Literal type
          settings: formatSettings, // Specific settings type
          createdAt: new Date(),
          isFavorite: false,
        };
      } else if (activeTab === 'pin') {
        newProfile = {
          id: Date.now().toString(),
          name: profileName.trim(),
          type: 'pin', // Literal type
          settings: pinSettings, // Specific settings type
          createdAt: new Date(),
          isFavorite: false,
        };
      }

      if (!newProfile) {
        // This case should ideally not be reached if activeTab is always a valid ProfileType
        toast.error('Invalid profile type selected. Cannot save profile.');
        return;
      }

      const newProfiles = [...profiles, newProfile]; // newProfile is now one of the specific Profile union members
      saveProfilesToStorage(newProfiles);
      toast.success(`Profile "${newProfile.name}" saved successfully!`);
    }
    setProfileName('');
  };

  // Load profile
  const loadProfile = (profileToLoad: Profile) => {
    // Parameter type is Profile
    setActiveTab(profileToLoad.type);

    switch (profileToLoad.type) {
      case 'password':
        setPasswordSettings(profileToLoad.settings);
        break;
      case 'passphrase':
        setPassphraseSettings(profileToLoad.settings);
        break;
      case 'custom': // Formerly 'format'
        setFormatSettings(profileToLoad.settings);
        break;
      case 'pin':
        setPinSettings(profileToLoad.settings);
        break;
    }

    // Update last used
    const updatedProfile = { ...profileToLoad, lastUsed: new Date() };
    const newProfiles = profiles.map((p) =>
      p.id === profileToLoad.id ? updatedProfile : p,
    );
    saveProfilesToStorage(newProfiles);

    toast.success(`Profile "${profileToLoad.name}" loaded successfully!`);
  };

  // Edit profile
  const handleEditProfile = (profileToEdit: Profile) => {
    // Parameter type is Profile
    setEditingProfileId(profileToEdit.id);
    setProfileName(profileToEdit.name);
    setActiveTab(profileToEdit.type);
    switch (profileToEdit.type) {
      case 'password':
        setPasswordSettings(profileToEdit.settings);
        break;
      case 'passphrase':
        setPassphraseSettings(profileToEdit.settings);
        break;
      case 'custom': // Formerly 'format'
        setFormatSettings(profileToEdit.settings);
        break;
      case 'pin':
        setPinSettings(profileToEdit.settings);
        break;
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingProfileId(null);
    setProfileName('');
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

  // Delete individual history entry
  const handleDeleteHistoryEntry = (id: string) => {
    const newHistory = passwordHistory.filter((entry) => entry.id !== id);
    saveHistoryToStorage(newHistory);
    toast.success('History entry deleted!');
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

  // Reset to defaults
  const handleResetToDefaults = () => {
    clearAllData(); // Clears profiles and history
    setProfiles([]);
    setPasswordHistory([]);
    const defaultSettings = {
      historyEnabled: true,
      encryptionEnabled: false,
      encryptionKey: '',
    };
    setAppSettings(defaultSettings);
    saveSettings(defaultSettings);
    toast.success('All settings reset to defaults!');
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
                onResetToDefaults={handleResetToDefaults} // Pass new prop
              />
              <ModeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Generator */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs
              value={activeTab}
              onValueChange={(value: string) =>
                setActiveTab(value as ProfileType)
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8 h-12 rounded-xl">
                {' '}
                {/* Updated grid-cols */}
                <TabsTrigger
                  value="password"
                  className="text-sm font-medium data-[state=active]:text-blue-600 data-[state=active]:border-blue-200 h-full"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Password
                </TabsTrigger>
                <TabsTrigger
                  value="passphrase"
                  className="text-sm font-medium data-[state=active]:text-green-600 data-[state=active]:border-green-200 h-full"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Passphrase
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  className="text-sm font-medium data-[state=active]:text-purple-600 data-[state=active]:border-purple-200 h-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Custom
                </TabsTrigger>
                <TabsTrigger
                  value="pin"
                  className="text-sm font-medium data-[state=active]:text-red-600 data-[state=active]:border-red-200 h-full"
                >
                  <Hash className="h-4 w-4 mr-2" />
                  PIN
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <PasswordGenerator
                  settings={passwordSettings}
                  onSettingsChange={setPasswordSettings}
                  onPasswordGenerated={addToHistory}
                  onCopyToClipboard={copyToClipboard}
                  isGenerating={isGenerating}
                  onGeneratingChange={setIsGenerating}
                />
              </TabsContent>

              <TabsContent value="passphrase">
                <PassphraseGenerator
                  settings={passphraseSettings}
                  onSettingsChange={setPassphraseSettings}
                  onPassphraseGenerated={addToHistory}
                  onCopyToClipboard={copyToClipboard}
                />
              </TabsContent>

              <TabsContent value="custom">
                <CustomGenerator
                  settings={formatSettings}
                  onSettingsChange={setFormatSettings}
                  onFormatGenerated={addToHistory}
                  onCopyToClipboard={copyToClipboard}
                />
              </TabsContent>

              <TabsContent value="pin">
                <PinGenerator />
              </TabsContent>
            </Tabs>

            {/* History Section - Moved under generator */}
            {appSettings.historyEnabled && (
              <HistoryPanel
                history={passwordHistory}
                onCopyToClipboard={copyToClipboard}
                onClearHistory={clearHistory}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProfileManager
                profiles={profiles}
                profileName={profileName}
                onProfileNameChange={setProfileName}
                activeTab={activeTab}
                passwordSettings={passwordSettings}
                passphraseSettings={passphraseSettings}
                formatSettings={formatSettings}
                pinSettings={pinSettings} // Pass pinSettings
                passwordHistory={passwordHistory}
                onSaveProfile={saveProfile}
                onLoadProfile={loadProfile}
                onToggleFavorite={toggleFavorite}
                onDeleteProfile={deleteProfile}
                onEditProfile={handleEditProfile} // Pass new prop
                editingProfileId={editingProfileId} // Pass new prop
                onCancelEdit={handleCancelEdit} // Pass new prop
              />
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
