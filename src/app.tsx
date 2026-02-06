import { BookOpen, Hash, Key, PanelRightOpen, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormatGenerator } from "./components/generators/format-generator";
import { PassphraseGenerator } from "./components/generators/passphrase-generator";
import { PasswordGenerator } from "./components/generators/password-generator";
import { PinGenerator } from "./components/generators/pin-generator";
import { NavBar } from "./components/layout/nav-bar";
import { HistoryPanel } from "./components/shared/history-panel";
import { ProfileManager } from "./components/shared/profile-manager";
import {
  DEFAULT_FORMAT_SETTINGS,
  DEFAULT_PASSPHRASE_SETTINGS,
  DEFAULT_PASSWORD_SETTINGS,
  DEFAULT_PIN_SETTINGS,
} from "./constants/generator";
import {
  clearAllData,
  loadHistory,
  loadProfiles,
  loadSettings,
  saveHistory,
  saveProfiles,
  saveSettings,
} from "./services/storage";
import type {
  AppSettings,
  FormatSettings,
  PassphraseSettings,
  PasswordHistory,
  PasswordSettings,
  PinSettings,
  Profile,
  ProfileType,
} from "./types";

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

  const [pinSettings, setPinSettings] =
    useState<PinSettings>(DEFAULT_PIN_SETTINGS);

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileType>("password");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profileName, setProfileName] = useState("");
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    historyEnabled: true,
    encryptionEnabled: false,
    encryptionKey: "",
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
      if ((event.ctrlKey || event.metaKey) && event.key === "g") {
        event.preventDefault();
        const generateButton = document.querySelector(
          "[data-generate-button]"
        ) as HTMLButtonElement;
        if (generateButton) {
          generateButton.click();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save profiles to localStorage
  const saveProfilesToStorage = (newProfiles: Profile[]) => {
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
    const newHistory = [historyEntry, ...passwordHistory].slice(0, 50);
    saveHistoryToStorage(newHistory);
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Helper function to get current settings based on active tab
  const getCurrentSettings = () => {
    if (activeTab === "password") {
      return passwordSettings;
    }
    if (activeTab === "passphrase") {
      return passphraseSettings;
    }
    if (activeTab === "format") {
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

    if (activeTab === "password") {
      return { ...baseProfile, type: "password", settings: passwordSettings };
    }
    if (activeTab === "passphrase") {
      return {
        ...baseProfile,
        type: "passphrase",
        settings: passphraseSettings,
      };
    }
    if (activeTab === "format") {
      return { ...baseProfile, type: "format", settings: formatSettings };
    }
    return { ...baseProfile, type: "pin", settings: pinSettings };
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
      toast.error("Please enter a profile name");
      return;
    }

    if (
      profiles.some(
        (p) => p.name.toLowerCase() === profileName.trim().toLowerCase()
      )
    ) {
      toast.error("A profile with this name already exists");
      return;
    }

    if (editingProfileId) {
      const updatedProfiles = updateExistingProfile(
        editingProfileId,
        profileName
      );
      saveProfilesToStorage(updatedProfiles);
      setEditingProfileId(null);
      toast.success(`Profile "${profileName.trim()}" updated successfully!`);
    } else {
      const newProfile = createNewProfile(profileName);
      const newProfiles = [...profiles, newProfile];
      saveProfilesToStorage(newProfiles);
      toast.success(`Profile "${newProfile.name}" saved successfully!`);
    }
    setProfileName("");
  };

  // Load profile
  const loadProfile = (profileToLoad: Profile) => {
    setActiveTab(profileToLoad.type);

    switch (profileToLoad.type) {
      case "password":
        setPasswordSettings(profileToLoad.settings);
        break;
      case "passphrase":
        setPassphraseSettings(profileToLoad.settings);
        break;
      case "format":
        setFormatSettings(profileToLoad.settings);
        break;
      case "pin":
        setPinSettings(profileToLoad.settings);
        break;
      default:
        toast.error("Unknown profile type");
        return;
    }

    const updatedProfile = { ...profileToLoad, lastUsed: new Date() };
    const newProfiles = profiles.map((p) =>
      p.id === profileToLoad.id ? updatedProfile : p
    );
    saveProfilesToStorage(newProfiles);

    toast.success(`Profile "${profileToLoad.name}" loaded successfully!`);
  };

  // Edit profile
  const handleEditProfile = (profileToEdit: Profile) => {
    setEditingProfileId(profileToEdit.id);
    setProfileName(profileToEdit.name);
    setActiveTab(profileToEdit.type);
    switch (profileToEdit.type) {
      case "password":
        setPasswordSettings(profileToEdit.settings);
        break;
      case "passphrase":
        setPassphraseSettings(profileToEdit.settings);
        break;
      case "format":
        setFormatSettings(profileToEdit.settings);
        break;
      case "pin":
        setPinSettings(profileToEdit.settings);
        break;
      default:
        toast.error("Unknown profile type");
        return;
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingProfileId(null);
    setProfileName("");
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
    toast.success("History entry deleted!");
  };

  // Clear history
  const clearHistory = () => {
    saveHistoryToStorage([]);
    toast.success("History cleared!");
  };

  // Settings management
  const handleSettingsChange = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    saveSettings(newSettings);

    if (newSettings.historyEnabled) {
      setPasswordHistory(loadHistory());
    } else {
      setPasswordHistory([]);
      saveHistoryToStorage([]);
    }
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    clearAllData();
    setProfiles([]);
    setPasswordHistory([]);
    const defaultSettings = {
      historyEnabled: true,
      encryptionEnabled: false,
      encryptionKey: "",
    };
    setAppSettings(defaultSettings);
    saveSettings(defaultSettings);
    toast.success("All settings reset to defaults!");
  };

  // Clear all data
  const handleClearAllData = () => {
    clearAllData();
    setProfiles([]);
    setPasswordHistory([]);
    setAppSettings({
      historyEnabled: true,
      encryptionEnabled: false,
      encryptionKey: "",
    });
    saveSettings({
      historyEnabled: true,
      encryptionEnabled: false,
      encryptionKey: "",
    });
  };

  // Export/Import functions
  const exportProfiles = () => {
    const dataStr = JSON.stringify({ profiles, passwordHistory }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "openpass-backup.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully!");
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
          const parsedProfiles = data.profiles.map(
            (p: Record<string, unknown>) => ({
              ...p,
              createdAt: new Date(p.createdAt as string),
              lastUsed: p.lastUsed ? new Date(p.lastUsed as string) : undefined,
            })
          );
          saveProfilesToStorage([...profiles, ...parsedProfiles]);
        }
        if (data.passwordHistory) {
          const parsedHistory = data.passwordHistory.map(
            (h: Record<string, unknown>) => ({
              ...h,
              createdAt: new Date(h.createdAt as string),
            })
          );
          saveHistoryToStorage([...passwordHistory, ...parsedHistory]);
        }
        toast.success("Data imported successfully!");
      } catch {
        toast.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
  };

  const [showProfiles, setShowProfiles] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <NavBar
        appSettings={appSettings}
        exportProfiles={exportProfiles}
        handleClearAllData={handleClearAllData}
        handleResetToDefaults={handleResetToDefaults}
        handleSettingsChange={handleSettingsChange}
        importProfiles={importProfiles}
      />

      {/* Main Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* Generator Column */}
          <div className="flex-1 space-y-6">
            {/* Section Header */}
            <div className="flex items-end justify-between border-foreground border-b-2 pb-3">
              <div>
                <span className="text-[10px] text-accent font-bold uppercase tracking-[0.3em]">
                  Generator
                </span>
                <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight sm:text-3xl">
                  Create
                </h2>
              </div>
              <button
                className="flex items-center gap-1.5 border-2 border-foreground bg-card px-3 py-1.5 text-[10px] uppercase tracking-widest transition-colors hover:bg-accent hover:text-accent-foreground lg:hidden"
                onClick={() => setShowProfiles(!showProfiles)}
                type="button"
              >
                <PanelRightOpen className="h-3 w-3" />
                Profiles
              </button>
            </div>

            <Tabs
              className="w-full"
              onValueChange={(value: string) =>
                setActiveTab(value as ProfileType)
              }
              value={activeTab}
            >
              <TabsList className="mb-4 flex h-11 w-full sm:mb-5 sm:h-12">
                <TabsTrigger value="password">
                  <Key className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Password</span>
                </TabsTrigger>
                <TabsTrigger value="passphrase">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Phrase</span>
                </TabsTrigger>
                <TabsTrigger value="format">
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Format</span>
                </TabsTrigger>
                <TabsTrigger value="pin">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">PIN</span>
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
                <PinGenerator
                  onCopyToClipboard={copyToClipboard}
                  onPinGenerated={addToHistory}
                  onSettingsChange={setPinSettings}
                  settings={pinSettings}
                />
              </TabsContent>
            </Tabs>

            {/* History Section */}
            {appSettings.historyEnabled ? (
              <HistoryPanel
                history={passwordHistory}
                onClearHistory={clearHistory}
                onCopyToClipboard={copyToClipboard}
                onDeleteHistoryEntry={handleDeleteHistoryEntry}
              />
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className={`w-full shrink-0 lg:w-80 xl:w-96 ${showProfiles ? "block" : "hidden lg:block"}`}>
            <div className="sticky top-28">
              {/* Section Header */}
              <div className="mb-6 flex items-end justify-between border-foreground border-b-2 pb-3">
                <div>
                  <span className="text-[10px] text-accent font-bold uppercase tracking-[0.3em]">
                    Saved
                  </span>
                  <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight sm:text-3xl">
                    Profiles
                  </h2>
                </div>
              </div>
              <ProfileManager
                activeTab={activeTab}
                editingProfileId={editingProfileId}
                formatSettings={formatSettings}
                onCancelEdit={handleCancelEdit}
                onDeleteProfile={deleteProfile}
                onEditProfile={handleEditProfile}
                onLoadProfile={loadProfile}
                onProfileNameChange={setProfileName}
                onSaveProfile={saveProfile}
                onToggleFavorite={toggleFavorite}
                passphraseSettings={passphraseSettings}
                passwordHistory={passwordHistory}
                passwordSettings={passwordSettings}
                pinSettings={pinSettings}
                profileName={profileName}
                profiles={profiles}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-foreground border-t-2 bg-card">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="border-2 border-foreground bg-foreground p-1">
                <Shield className="h-3 w-3 text-background" />
              </div>
              <p className="text-center text-muted-foreground text-[11px] uppercase tracking-wider sm:text-left">
                100% local. Zero tracking. Your data stays on your device.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground uppercase tracking-widest">
              <span>MIT License</span>
              <span className="text-accent font-bold">{"///"}</span>
              <span>v1.0.0-beta</span>
            </div>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
