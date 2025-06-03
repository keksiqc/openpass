import {
  Copy,
  Download,
  Eye,
  EyeOff,
  History,
  RefreshCw,
  RotateCcwKey,
  Save,
  Settings,
  Shield,
  Star,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModeToggle } from './components/mode-toggle';

// Enhanced word list for passphrases with better security
const COMMON_WORDS = [
  'ancient',
  'bridge',
  'canyon',
  'dragon',
  'forest',
  'golden',
  'harbor',
  'island',
  'jungle',
  'kingdom',
  'legend',
  'mystic',
  'ocean',
  'palace',
  'quartz',
  'river',
  'shadow',
  'thunder',
  'valley',
  'wizard',
  'crystal',
  'falcon',
  'glacier',
  'horizon',
  'lightning',
  'mountain',
  'phoenix',
  'starlight',
  'temple',
  'universe',
  'whisper',
  'amber',
  'beacon',
  'cosmos',
  'diamond',
  'ember',
  'frozen',
  'galaxy',
  'harmony',
  'infinity',
  'journey',
  'labyrinth',
  'melody',
  'nebula',
  'oasis',
  'prism',
  'quantum',
  'radiant',
  'serenity',
  'twilight',
  'utopia',
  'vortex',
  'wanderer',
  'xenith',
  'yearning',
  'zenith',
  'aurora',
  'butterfly',
  'cascade',
  'destiny',
  'eclipse',
  'firefly',
  'guardian',
];

// Password strength calculator
const calculateStrength = (
  password: string,
): { score: number; label: string; color: string } => {
  let score = 0;
  const length = password.length;

  // Length scoring
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (length >= 20) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Complexity bonuses
  if (
    length >= 16 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  ) {
    score += 2;
  }

  if (score <= 3) return { score, label: 'Weak', color: 'text-destructive' };
  if (score <= 6) return { score, label: 'Fair', color: 'text-yellow-600' };
  if (score <= 8) return { score, label: 'Good', color: 'text-blue-600' };
  if (score <= 10) return { score, label: 'Strong', color: 'text-green-600' };
  return { score, label: 'Excellent', color: 'text-green-700' };
};

interface PasswordProfile {
  id: string;
  name: string;
  type: 'password' | 'passphrase' | 'format';
  settings: any;
  createdAt: Date;
  lastUsed?: Date;
  isFavorite?: boolean;
}

interface PasswordSettings {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  customCharacters: string;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  minNumbers?: number;
  minSymbols?: number;
}

interface PassphraseSettings {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  includeNumbers: boolean;
  customWords?: string[];
  wordCase: 'lowercase' | 'uppercase' | 'capitalize' | 'mixed';
}

interface FormatSettings {
  format: string;
  templates: Array<{ name: string; pattern: string }>;
}

interface PasswordHistory {
  id: string;
  password: string;
  type: 'password' | 'passphrase' | 'format';
  createdAt: Date;
  strength: { score: number; label: string };
}

// interface GeneratedResult {
//   value: string;
//   strength: { score: number; label: string; color: string };
//   entropy: number;
//   timeToCrack: string;
// }

export default function App() {
  // State for generated results
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedPassphrase, setGeneratedPassphrase] = useState('');
  const [generatedFormat, setGeneratedFormat] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Enhanced profile management
  const [profiles, setProfiles] = useState<PasswordProfile[]>([]);
  const [profileName, setProfileName] = useState('');
  const [activeTab, setActiveTab] = useState('password');
  const [passwordHistory, setPasswordHistory] = useState<PasswordHistory[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('openpass-profiles');
    const savedHistory = localStorage.getItem('openpass-history');

    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles);
        setProfiles(
          parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            lastUsed: p.lastUsed ? new Date(p.lastUsed) : undefined,
          })),
        );
      } catch (error) {
        console.error('Failed to parse saved profiles:', error);
      }
    }

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setPasswordHistory(
          parsed.map((h: any) => ({
            ...h,
            createdAt: new Date(h.createdAt),
          })),
        );
      } catch (error) {
        console.error('Failed to parse password history:', error);
      }
    }
  }, []);

  // Save profiles to localStorage
  const saveProfilesToStorage = (newProfiles: PasswordProfile[]) => {
    localStorage.setItem('openpass-profiles', JSON.stringify(newProfiles));
    setProfiles(newProfiles);
  };

  // Save history to localStorage
  const saveHistoryToStorage = (newHistory: PasswordHistory[]) => {
    localStorage.setItem('openpass-history', JSON.stringify(newHistory));
    setPasswordHistory(newHistory);
  };

  // Enhanced character sets with better exclusions
  const getCharacterSet = useCallback((settings: PasswordSettings): string => {
    let charset = '';

    if (settings.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (settings.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (settings.includeNumbers) charset += '0123456789';
    if (settings.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (settings.customCharacters) charset += settings.customCharacters;

    if (settings.excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }

    if (settings.excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()/\\'"~,;.<>]/g, '');
    }

    return charset;
  }, []);

  // Enhanced entropy calculation
  const calculateEntropy = useCallback(
    (password: string, charset: string): number => {
      if (!charset || !password) return 0;
      return Math.log2(charset.length ** password.length);
    },
    [],
  );

  // Time to crack estimation
  const estimateTimeToCrack = useCallback((entropy: number): string => {
    const guessesPerSecond = 1e12; // Assuming 1 trillion guesses per second
    const secondsToCrack = 2 ** (entropy - 1) / guessesPerSecond;

    if (secondsToCrack < 60) return 'Instantly';
    if (secondsToCrack < 3600)
      return `${Math.round(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400)
      return `${Math.round(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 31536000)
      return `${Math.round(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000000)
      return `${Math.round(secondsToCrack / 31536000)} years`;
    return 'Centuries';
  }, []);

  // Secure random number generation
  const getSecureRandom = (max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };

  // Enhanced password generation with strength validation
  const generatePassword = () => {
    setIsGenerating(true);

    try {
      const charset = getCharacterSet(passwordSettings);
      if (!charset) {
        toast.error('Please select at least one character type');
        return;
      }

      let password = '';
      let attempts = 0;
      const maxAttempts = 100;

      // Generate password with minimum requirements
      do {
        password = '';
        for (let i = 0; i < passwordSettings.length; i++) {
          password += charset[getSecureRandom(charset.length)];
        }
        attempts++;
      } while (
        attempts < maxAttempts &&
        ((passwordSettings.minNumbers &&
          (password.match(/\d/g) || []).length < passwordSettings.minNumbers) ||
          (passwordSettings.minSymbols &&
            (password.match(/[^a-zA-Z0-9]/g) || []).length <
              passwordSettings.minSymbols))
      );

      const entropy = calculateEntropy(password, charset);
      const strength = calculateStrength(password);
      // const _timeToCrack = estimateTimeToCrack(entropy);

      setGeneratedPassword(password);

      // Add to history
      const historyEntry: PasswordHistory = {
        id: Date.now().toString(),
        password,
        type: 'password',
        createdAt: new Date(),
        strength: { score: strength.score, label: strength.label },
      };

      const newHistory = [historyEntry, ...passwordHistory].slice(0, 50); // Keep last 50
      saveHistoryToStorage(newHistory);

      toast.success(
        `${strength.label} password generated! (${Math.round(entropy)} bits entropy)`,
      );
    } catch (_error) {
      toast.error('Failed to generate password');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate passphrase
  const generatePassphrase = () => {
    const wordSource =
      passphraseSettings.customWords &&
      passphraseSettings.customWords.length > 0
        ? passphraseSettings.customWords
        : COMMON_WORDS;

    const words = [];
    for (let i = 0; i < passphraseSettings.wordCount; i++) {
      let word = wordSource[getSecureRandom(wordSource.length)];

      switch (passphraseSettings.wordCase) {
        case 'uppercase':
          word = word.toUpperCase();
          break;
        case 'capitalize':
          word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          break;
        case 'mixed':
          word = Math.random() > 0.5 ? word.toUpperCase() : word.toLowerCase();
          break;
        default:
          word = word.toLowerCase();
      }

      words.push(word);
    }

    let passphrase = words.join(
      passphraseSettings.separator === 'none'
        ? ''
        : passphraseSettings.separator,
    );

    if (passphraseSettings.includeNumbers) {
      const numberCount = 2 + getSecureRandom(3); // 2-4 numbers
      for (let i = 0; i < numberCount; i++) {
        passphrase += getSecureRandom(10);
      }
    }

    const entropy = Math.log2(
      wordSource.length ** passphraseSettings.wordCount,
    );
    const strength = calculateStrength(passphrase);

    setGeneratedPassphrase(passphrase);

    // Add to history
    const historyEntry: PasswordHistory = {
      id: Date.now().toString(),
      password: passphrase,
      type: 'passphrase',
      createdAt: new Date(),
      strength: { score: strength.score, label: strength.label },
    };

    const newHistory = [historyEntry, ...passwordHistory].slice(0, 50);
    saveHistoryToStorage(newHistory);

    toast.success(
      `${strength.label} passphrase generated! (${Math.round(entropy)} bits entropy)`,
    );
  };

  // Parse and generate format-based password
  const generateFormatPassword = () => {
    const format = formatSettings.format;
    let result = '';
    let i = 0;

    try {
      while (i < format.length) {
        if (/\d/.test(format[i])) {
          // Parse number
          let numStr = '';
          while (i < format.length && /\d/.test(format[i])) {
            numStr += format[i];
            i++;
          }
          const count = Number.parseInt(numStr);

          if (i >= format.length) break;

          const type = format[i];
          let charset = '';

          switch (type) {
            case 'u':
              charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              break;
            case 'l':
              charset = 'abcdefghijklmnopqrstuvwxyz';
              break;
            case 'd':
              charset = '0123456789';
              break;
            case '{': {
              // Parse custom character set
              i++; // skip '{'
              let customSet = '';
              while (i < format.length && format[i] !== '}') {
                customSet += format[i];
                i++;
              }
              charset = customSet;
              break;
            }
            default:
              throw new Error(`Unknown format type: ${type}`);
          }

          // Generate characters
          for (let j = 0; j < count; j++) {
            if (charset) {
              result += charset[getSecureRandom(charset.length)];
            }
          }
        }
        i++;
      }

      const strength = calculateStrength(result);
      setGeneratedFormat(result);

      // Add to history
      const historyEntry: PasswordHistory = {
        id: Date.now().toString(),
        password: result,
        type: 'format',
        createdAt: new Date(),
        strength: { score: strength.score, label: strength.label },
      };

      const newHistory = [historyEntry, ...passwordHistory].slice(0, 50);
      saveHistoryToStorage(newHistory);

      toast.success(`${strength.label} format password generated!`);
    } catch {
      toast.error(
        'Invalid format. Use: Nu (uppercase), Nl (lowercase), Nd (digits), N{chars} (custom)',
      );
    }
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

                  {/* Password Tab */}
                  <TabsContent value="password" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Length: {passwordSettings.length}</Label>
                        <Slider
                          value={[passwordSettings.length]}
                          onValueChange={(value) =>
                            setPasswordSettings({
                              ...passwordSettings,
                              length: value[0],
                            })
                          }
                          max={128}
                          min={4}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="uppercase"
                            checked={passwordSettings.includeUppercase}
                            onCheckedChange={(checked) =>
                              setPasswordSettings({
                                ...passwordSettings,
                                includeUppercase: !!checked,
                              })
                            }
                          />
                          <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="lowercase"
                            checked={passwordSettings.includeLowercase}
                            onCheckedChange={(checked) =>
                              setPasswordSettings({
                                ...passwordSettings,
                                includeLowercase: !!checked,
                              })
                            }
                          />
                          <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="numbers"
                            checked={passwordSettings.includeNumbers}
                            onCheckedChange={(checked) =>
                              setPasswordSettings({
                                ...passwordSettings,
                                includeNumbers: !!checked,
                              })
                            }
                          />
                          <Label htmlFor="numbers">Numbers (0-9)</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="symbols"
                            checked={passwordSettings.includeSymbols}
                            onCheckedChange={(checked) =>
                              setPasswordSettings({
                                ...passwordSettings,
                                includeSymbols: !!checked,
                              })
                            }
                          />
                          <Label htmlFor="symbols">Symbols (!@#$...)</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="custom">Custom Characters</Label>
                          <Input
                            id="custom"
                            value={passwordSettings.customCharacters}
                            onChange={(e) =>
                              setPasswordSettings({
                                ...passwordSettings,
                                customCharacters: e.target.value,
                              })
                            }
                            placeholder="Add custom characters..."
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="exclude-similar"
                              checked={passwordSettings.excludeSimilar}
                              onCheckedChange={(checked) =>
                                setPasswordSettings({
                                  ...passwordSettings,
                                  excludeSimilar: !!checked,
                                })
                              }
                            />
                            <Label
                              htmlFor="exclude-similar"
                              className="text-sm"
                            >
                              Exclude similar (0,O,1,l,I)
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="exclude-ambiguous"
                              checked={passwordSettings.excludeAmbiguous}
                              onCheckedChange={(checked) =>
                                setPasswordSettings({
                                  ...passwordSettings,
                                  excludeAmbiguous: !!checked,
                                })
                              }
                            />
                            <Label
                              htmlFor="exclude-ambiguous"
                              className="text-sm"
                            >
                              Exclude ambiguous symbols
                            </Label>
                          </div>
                        </div>
                      </div>

                      {(passwordSettings.includeNumbers ||
                        passwordSettings.includeSymbols) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-2 sm:col-span-2">
                            Minimum Requirements:
                          </div>

                          {passwordSettings.includeNumbers && (
                            <div>
                              <Label>
                                Min Numbers: {passwordSettings.minNumbers}
                              </Label>
                              <Slider
                                value={[passwordSettings.minNumbers || 1]}
                                onValueChange={(value) =>
                                  setPasswordSettings({
                                    ...passwordSettings,
                                    minNumbers: value[0],
                                  })
                                }
                                max={Math.min(
                                  5,
                                  Math.floor(passwordSettings.length / 2),
                                )}
                                min={0}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          )}

                          {passwordSettings.includeSymbols && (
                            <div>
                              <Label>
                                Min Symbols: {passwordSettings.minSymbols}
                              </Label>
                              <Slider
                                value={[passwordSettings.minSymbols || 1]}
                                onValueChange={(value) =>
                                  setPasswordSettings({
                                    ...passwordSettings,
                                    minSymbols: value[0],
                                  })
                                }
                                max={Math.min(
                                  5,
                                  Math.floor(passwordSettings.length / 2),
                                )}
                                min={0}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={generatePassword}
                      className="w-full"
                      size="lg"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Password
                        </>
                      )}
                    </Button>

                    {generatedPassword && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Generated Password
                          </Label>
                          <div className="flex items-center gap-2">
                            <Shield
                              className={`h-4 w-4 ${calculateStrength(generatedPassword).color}`}
                            />
                            <span
                              className={`text-sm font-medium ${calculateStrength(generatedPassword).color}`}
                            >
                              {calculateStrength(generatedPassword).label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={generatedPassword}
                            readOnly
                            type={showPassword ? 'text' : 'password'}
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(generatedPassword)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Entropy:{' '}
                          {Math.round(
                            calculateEntropy(
                              generatedPassword,
                              getCharacterSet(passwordSettings),
                            ),
                          )}{' '}
                          bits • Time to crack:{' '}
                          {estimateTimeToCrack(
                            calculateEntropy(
                              generatedPassword,
                              getCharacterSet(passwordSettings),
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Passphrase Tab */}
                  <TabsContent value="passphrase" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>
                          Word Count: {passphraseSettings.wordCount}
                        </Label>
                        <Slider
                          value={[passphraseSettings.wordCount]}
                          onValueChange={(value) =>
                            setPassphraseSettings({
                              ...passphraseSettings,
                              wordCount: value[0],
                            })
                          }
                          max={8}
                          min={2}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="separator">Separator</Label>
                        <Select
                          value={passphraseSettings.separator}
                          onValueChange={(value) =>
                            setPassphraseSettings({
                              ...passphraseSettings,
                              separator: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="-">Hyphen (-)</SelectItem>
                            <SelectItem value="_">Underscore (_)</SelectItem>
                            <SelectItem value=" ">Space ( )</SelectItem>
                            <SelectItem value=".">Period (.)</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="word-case">Word Case</Label>
                        <Select
                          value={passphraseSettings.wordCase}
                          onValueChange={(value: any) =>
                            setPassphraseSettings({
                              ...passphraseSettings,
                              wordCase: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lowercase">lowercase</SelectItem>
                            <SelectItem value="UPPERCASE">UPPERCASE</SelectItem>
                            <SelectItem value="Capitalize">
                              Capitalize
                            </SelectItem>
                            <SelectItem value="MiXeD">MiXeD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-numbers"
                            checked={passphraseSettings.includeNumbers}
                            onCheckedChange={(checked) =>
                              setPassphraseSettings({
                                ...passphraseSettings,
                                includeNumbers: !!checked,
                              })
                            }
                          />
                          <Label htmlFor="include-numbers">
                            Add numbers at the end
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={generatePassphrase}
                      className="w-full"
                      size="lg"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Passphrase
                    </Button>

                    {generatedPassphrase && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Generated Passphrase
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={generatedPassphrase}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(generatedPassphrase)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Format Tab */}
                  <TabsContent value="format" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template">Quick Templates</Label>
                        <Select
                          value=""
                          onValueChange={(value) =>
                            setFormatSettings({
                              ...formatSettings,
                              format: value,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a template..." />
                          </SelectTrigger>
                          <SelectContent>
                            {formatSettings.templates.map((template, index) => (
                              <SelectItem key={index} value={template.pattern}>
                                {template.name} ({template.pattern})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="format">Format Pattern</Label>
                        <Input
                          id="format"
                          value={formatSettings.format}
                          onChange={(e) =>
                            setFormatSettings({
                              ...formatSettings,
                              format: e.target.value,
                            })
                          }
                          placeholder="e.g., 2u4l2d2{#$%}"
                        />
                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                          <p className="font-medium mb-2">Format Guide:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              <code className="bg-muted px-1 rounded">Nu</code>{' '}
                              - N uppercase letters
                            </li>
                            <li>
                              <code className="bg-muted px-1 rounded">Nl</code>{' '}
                              - N lowercase letters
                            </li>
                            <li>
                              <code className="bg-muted px-1 rounded">Nd</code>{' '}
                              - N digits
                            </li>
                            <li>
                              <code className="bg-muted px-1 rounded">
                                N{String.fromCharCode(123)}chars
                                {String.fromCharCode(125)}
                              </code>{' '}
                              - N characters from custom set
                            </li>
                          </ul>
                          <p className="mt-2">
                            <span className="font-medium">Example:</span>{' '}
                            <code className="bg-muted px-1 rounded">
                              2u4l2d2{String.fromCharCode(123)}#$%
                              {String.fromCharCode(125)}
                            </code>{' '}
                            →{' '}
                            <code className="bg-muted px-1 rounded">
                              ABcd12#$
                            </code>
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={generateFormatPassword}
                      className="w-full"
                      size="lg"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Format Password
                    </Button>

                    {generatedFormat && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Generated Format Password
                          </Label>
                          <div className="flex items-center gap-2">
                            <Shield
                              className={`h-4 w-4 ${calculateStrength(generatedFormat).color}`}
                            />
                            <span
                              className={`text-sm font-medium ${calculateStrength(generatedFormat).color}`}
                            >
                              {calculateStrength(generatedFormat).label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={generatedFormat}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(generatedFormat)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Profile Management */}
          <div className="space-y-6">
            {/* Save Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Profile
                </CardTitle>
                <CardDescription>
                  Save current settings as a profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Profile name..."
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
                />
                <Button onClick={saveProfile} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            {/* Saved Profiles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Saved Profiles
                </CardTitle>
                <CardDescription>Load or delete saved profiles</CardDescription>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No saved profiles
                  </p>
                ) : (
                  <div className="space-y-3">
                    {profiles
                      .sort((a, b) => {
                        if (a.isFavorite && !b.isFavorite) return -1;
                        if (!a.isFavorite && b.isFavorite) return 1;
                        return (
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                        );
                      })
                      .map((profile) => (
                        <div
                          key={profile.id}
                          className="flex items-center justify-between p-3 border rounded-lg bg-card"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {profile.name}
                              </span>
                              <Badge variant="secondary">{profile.type}</Badge>
                              {profile.isFavorite && (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            {profile.lastUsed && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last used:{' '}
                                {profile.lastUsed.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleFavorite(profile.id)}
                            >
                              <Star
                                className={`h-4 w-4 ${profile.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
                              />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => loadProfile(profile)}
                            >
                              Load
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteProfile(profile.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Passwords
                </CardTitle>
                <CardDescription>Recently generated passwords</CardDescription>
              </CardHeader>
              <CardContent>
                {passwordHistory.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No recent passwords
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {passwordHistory.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 border rounded bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {entry.type}
                            </Badge>
                            <span
                              className={`text-xs ${calculateStrength(entry.password).color}`}
                            >
                              {entry.strength.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.createdAt.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(entry.password)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export/Import */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Backup & Restore
                </CardTitle>
                <CardDescription>Export or import your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={exportProfiles}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importProfiles}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
