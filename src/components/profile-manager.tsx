import {
  Clock,
  Download,
  Lightbulb,
  Save,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  FormatSettings,
  PassphraseSettings,
  PasswordHistory,
  PasswordProfile,
  PasswordSettings,
} from '../types';

interface ProfileManagerProps {
  profiles: PasswordProfile[];
  profileName: string;
  onProfileNameChange: (name: string) => void;
  activeTab: string;
  passwordSettings: PasswordSettings;
  passphraseSettings: PassphraseSettings;
  formatSettings: FormatSettings;
  passwordHistory: PasswordHistory[];
  onSaveProfile: () => void;
  onLoadProfile: (profile: PasswordProfile) => void;
  onToggleFavorite: (profileId: string) => void;
  onDeleteProfile: (profileId: string) => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileManager({
  profiles,
  profileName,
  onProfileNameChange,
  onSaveProfile,
  onLoadProfile,
  onToggleFavorite,
  onDeleteProfile,
  onExportData,
  onImportData,
}: ProfileManagerProps) {
  return (
    <div className="space-y-4">
      {/* Save Profile Section */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Save className="h-4 w-4 text-primary" />
            </div>
            Save Profile
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Save your current settings as a reusable profile for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="profile-name"
              className="text-sm font-medium flex items-center gap-2"
            >
              <User className="h-3 w-3" />
              Profile Name
            </Label>
            <Input
              id="profile-name"
              value={profileName}
              onChange={(e) => onProfileNameChange(e.target.value)}
              placeholder="e.g., Work Passwords, Personal Settings..."
              className="text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            onClick={onSaveProfile}
            className="w-full h-11 font-medium"
            disabled={!profileName.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Current Settings
          </Button>
        </CardContent>
      </Card>

      {/* Saved Profiles List or Empty State */}
      {profiles.length > 0 ? (
        <Card className="border overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              Saved Profiles
              <Badge variant="secondary" className="ml-auto px-2 py-1">
                {profiles.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Quick access to your frequently used settings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-80 overflow-y-auto">
              {profiles
                .sort((a, b) => {
                  if (a.isFavorite && !b.isFavorite) return -1;
                  if (!a.isFavorite && b.isFavorite) return 1;
                  return b.createdAt.getTime() - a.createdAt.getTime();
                })
                .map((profile, index) => (
                  <div
                    key={profile.id}
                    className={`p-4 border-b border-border/50 hover:bg-muted/30 transition-all duration-200 group ${
                      index === 0 ? '' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className={`p-1.5 rounded-md transition-colors ${
                                profile.type === 'password'
                                  ? 'bg-blue-100 dark:bg-blue-900/30'
                                  : profile.type === 'passphrase'
                                    ? 'bg-green-100 dark:bg-green-900/30'
                                    : 'bg-purple-100 dark:bg-purple-900/30'
                              }`}
                            >
                              <Settings
                                className={`h-3 w-3 ${
                                  profile.type === 'password'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : profile.type === 'passphrase'
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-purple-600 dark:text-purple-400'
                                }`}
                              />
                            </div>
                            <span className="font-medium text-sm truncate">
                              {profile.name}
                            </span>
                            {profile.isFavorite && (
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${
                              profile.type === 'password'
                                ? 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800'
                                : profile.type === 'passphrase'
                                  ? 'text-green-600 border-green-200 dark:text-green-400 dark:border-green-800'
                                  : 'text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800'
                            }`}
                          >
                            {profile.type}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {profile.createdAt.toLocaleDateString()}
                          </div>
                          {profile.lastUsed && (
                            <div className="flex items-center gap-1">
                              <span>•</span>
                              <span>
                                Used {profile.lastUsed.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleFavorite(profile.id)}
                          className="h-8 w-8 p-0"
                          title={
                            profile.isFavorite
                              ? 'Remove from favorites'
                              : 'Add to favorites'
                          }
                        >
                          <Star
                            className={`h-4 w-4 transition-colors ${
                              profile.isFavorite
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground hover:text-yellow-400'
                            }`}
                          />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLoadProfile(profile)}
                          className="h-8 px-3 text-xs font-medium"
                        >
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteProfile(profile.id)}
                          className="h-8 w-8 p-0 hover:border-destructive hover:text-destructive"
                          title="Delete profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-muted-foreground/20">
          <CardContent className="text-center py-12 px-6">
            <div className="p-4 rounded-full bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-medium text-sm mb-2">No saved profiles yet</h3>
            <p className="text-xs text-muted-foreground/80 mb-4">
              Save your current settings as a profile for quick access later
            </p>
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              <strong>Tip:</strong> Profiles help you quickly switch between
              different password configurations
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup & Restore */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Download className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            Backup & Restore
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Keep your profiles and history safe with backup and restore
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onExportData}
            variant="outline"
            className="w-full h-10 font-medium hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-900/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              className="w-full h-10 font-medium hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import From Backup
            </Button>
            <Input
              type="file"
              accept=".json"
              onChange={onImportData}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Tip:</strong> Regular backups help keep your profiles safe
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
