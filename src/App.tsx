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
    DEFAULT_PASSWORD_SETTINGS
  );

  const [passphraseSettings, setPassphraseSettings] =
    useState<PassphraseSettings>(DEFAULT_PASSPHRASE_SETTINGS);

  const [formatSettings, setFormatSettings] = useState<FormatSettings>(
    DEFAULT_FORMAT_SETTINGS
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
          '[data-generate-button]'
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

  // Helper function to get current settings based on active tab
  const getCurrentSettings = () => {
    if (activeTab === 'password') {
      return passwordSettings;
    }
    if (activeTab === 'passphrase') {
      return passphraseSettings;
    }
    if (activeTab === 'format') {
      return formatSettings;
    }
    return pinSettings;
  };

  // Helper function to create a new profile
  const createNewProfile = (name: string): Profile => {
    const baseProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date(),
      isFavorite: false,
    };

    if (activeTab === 'password') {
      return { ...baseProfile, type: 'password', settings: passwordSettings };
    }
    if (activeTab === 'passphrase') {
      return {
        ...baseProfile,
        type: 'passphrase',
        settings: passphraseSettings,
      };
    }
    if (activeTab === 'format') {
      return { ...baseProfile, type: 'format', settings: formatSettings };
    }
    return { ...baseProfile, type: 'pin', settings: pinSettings };
  };

  // Helper function to update existing profile
  const updateExistingProfile = (profileId: string, name: string) => {
    return profiles.map((p) =>
      p.id === profileId
        ? ({
            ...p,
            name: name.trim(),
            type: activeTab,
            settings: getCurrentSettings(),
          } as Profile)
        : p
    );
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
        (p) => p.name.toLowerCase() === profileName.trim().toLowerCase()
      )
    ) {
      toast.error('A profile with this name already exists');
      return;
    }

    if (editingProfileId) {
      // Update existing profile
      const updatedProfiles = updateExistingProfile(
        editingProfileId,
        profileName
      );
      saveProfilesToStorage(updatedProfiles);
      setEditingProfileId(null);
      toast.success(`Profile "${profileName.trim()}" updated successfully!`);
    } else {
      // Create new profile
      const newProfile = createNewProfile(profileName);
      const newProfiles = [...profiles, newProfile];
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
      default:
        // This should never happen with proper typing, but handle gracefully
        toast.error('Unknown profile type');
        return;
    }

    // Update last used
    const updatedProfile = { ...profileToLoad, lastUsed: new Date() };
    const newProfiles = profiles.map((p) =>
      p.id === profileToLoad.id ? updatedProfile : p
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
      default:
        // This should never happen with proper typing, but handle gracefully
        toast.error('Unknown profile type');
        return;
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
      p.id === profileId ? { ...p, isFavorite: !p.isFavorite } : p
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
    if (newSettings.historyEnabled) {
      // Reload history if it was re-enabled
      setPasswordHistory(loadHistory());
    } else {
      setPasswordHistory([]);
      saveHistoryToStorage([]);
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
    if (!file) {
      return;
    }

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
        exportProfiles={exportProfiles}
        handleClearAllData={handleClearAllData}
        handleResetToDefaults={handleResetToDefaults}
        handleSettingsChange={handleSettingsChange}
        importProfiles={importProfiles}
      />
      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Generator */}
          <div className="space-y-8 lg:col-span-2">
            <Tabs
              className="w-full"
              onValueChange={(value: string) =>
                setActiveTab(value as ProfileType)
              }
              value={activeTab}
            >
              <TabsList className="mb-4 grid h-12 w-full grid-cols-2 rounded-xl sm:grid-cols-4">
                <TabsTrigger value="password">
                  <Key className="mr-2 h-4 w-4" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="passphrase">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Passphrase
                </TabsTrigger>
                <TabsTrigger value="format">
                  <Settings className="mr-2 h-4 w-4" />
                  Format
                </TabsTrigger>
                <TabsTrigger value="pin">
                  <Hash className="mr-2 h-4 w-4" />
                  PIN
                </TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <PasswordGenerator
                  isGenerating={isGenerating}
                  onCopyToClipboard={copyToClipboard}
                  onGeneratingChange={setIsGenerating}
                  onPasswordGenerated={addToHistory}
                  onSettingsChange={setPasswordSettings}
                  settings={passwordSettings}
                />
              </TabsContent>

              <TabsContent value="passphrase">
                <PassphraseGenerator
                  onCopyToClipboard={copyToClipboard}
                  onPassphraseGenerated={addToHistory}
                  onSettingsChange={setPassphraseSettings}
                  settings={passphraseSettings}
                />
              </TabsContent>

              <TabsContent value="format">
                <FormatGenerator
                  onCopyToClipboard={copyToClipboard}
                  onFormatGenerated={addToHistory}
                  onSettingsChange={setFormatSettings}
                  settings={formatSettings}
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
                onClearHistory={clearHistory}
                onCopyToClipboard={copyToClipboard}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ProfileManager
                activeTab={activeTab}
                editingProfileId={editingProfileId}
                formatSettings={formatSettings}
                onCancelEdit={handleCancelEdit}
                onDeleteProfile={deleteProfile}
                onEditProfile={handleEditProfile}
                onLoadProfile={loadProfile}
                onProfileNameChange={setProfileName} // Pass pinSettings
                onSaveProfile={saveProfile}
                onToggleFavorite={toggleFavorite}
                passphraseSettings={passphraseSettings}
                passwordHistory={passwordHistory}
                passwordSettings={passwordSettings}
                pinSettings={pinSettings} // Pass new prop
                profileName={profileName} // Pass new prop
                profiles={profiles} // Pass new prop
              />
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
