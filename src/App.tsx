// filepath: /workspaces/openpass/src/App.tsx

import { BookOpen, Hash, Key, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormatGenerator } from './components/generators/format-generator';
import { PassphraseGenerator } from './components/generators/passphrase-generator';
import { PasswordGenerator } from './components/generators/password-generator';
import { PinGenerator } from './components/generators/pin-generator';
import { NavBar } from './components/layout/nav-bar';
import { HistoryPanel } from './components/shared/history-panel';
import { ProfileManager } from './components/shared/profile-manager';
import {
  DEFAULT_FORMAT_SETTINGS,
  DEFAULT_PASSPHRASE_SETTINGS,
  DEFAULT_PASSWORD_SETTINGS,
  DEFAULT_PIN_SETTINGS,
} from './constants/generator';
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
  PasswordSettings,
  PinSettings,
  Profile,
  ProfileType,
} from './types';

export default function App() {
  // Settings states with enhanced defaults
  const [passwordSettings, setPasswordSettings] = useState<PasswordSettings>(
    DEFAULT_PASSWORD_SETTINGS,
  );

  const [passphraseSettings, setPassphraseSettings] =
    useState<PassphraseSettings>(DEFAULT_PASSPHRASE_SETTINGS);

  const [formatSettings, setFormatSettings] = useState<FormatSettings>(
    DEFAULT_FORMAT_SETTINGS,
  );

  // Placeholder for PIN settings
  const [pinSettings, setPinSettings] =
    useState<PinSettings>(DEFAULT_PIN_SETTINGS);

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileType>('password');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileName, setProfileName] = useState('');
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
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
                    : activeTab === 'format'
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
      } else if (activeTab === 'format') {
        newProfile = {
          id: Date.now().toString(),
          name: profileName.trim(),
          type: 'format', // Literal type
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
      case 'format': // Formerly 'custom'
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
      case 'format': // Formerly 'custom'
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
      <NavBar
        appSettings={appSettings}
        handleSettingsChange={handleSettingsChange}
        handleClearAllData={handleClearAllData}
        exportProfiles={exportProfiles}
        importProfiles={importProfiles}
        handleResetToDefaults={handleResetToDefaults}
      />
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
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 h-12 rounded-xl">
                <TabsTrigger value="password">
                  <Key className="h-4 w-4 mr-2" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="passphrase">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Passphrase
                </TabsTrigger>
                <TabsTrigger value="format">
                  <Settings className="h-4 w-4 mr-2" />
                  Format
                </TabsTrigger>
                <TabsTrigger value="pin">
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

              <TabsContent value="format">
                <FormatGenerator
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
