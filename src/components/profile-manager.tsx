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
import {
  Clock,
  Save,
  Settings,
  Sparkles,
  Star,
  Trash2,
  User,
} from 'lucide-react';
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
}

export function ProfileManager({
  profiles,
  profileName,
  onProfileNameChange,
  onSaveProfile,
  onLoadProfile,
  onToggleFavorite,
  onDeleteProfile,
}: ProfileManagerProps) {
  return (
    <div className="space-y-6">
      {/* Save Profile Section */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/30 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Save className="h-4 w-4 text-primary" />
            </div>
            Save Profile
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            Save your current settings as a reusable profile for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label
              htmlFor="profile-name"
              className="text-sm font-medium flex items-center gap-2"
            >
              <User className="h-3.5 w-3.5" />
              Profile Name
            </Label>
            <Input
              id="profile-name"
              value={profileName}
              onChange={(e) => onProfileNameChange(e.target.value)}
              placeholder="e.g., Work Passwords, Personal Settings..."
              className="h-10 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button
            onClick={onSaveProfile}
            className="w-full h-10 font-medium text-sm"
            disabled={!profileName.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Current Settings
          </Button>
        </CardContent>
      </Card>

      {/* Saved Profiles List or Empty State */}
      {profiles.length > 0 ? (
        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              Saved Profiles
              <Badge variant="secondary" className="ml-auto px-2.5 py-1 text-xs font-medium">
                {profiles.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
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
                      index === profiles.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
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
                                className={`h-3.5 w-3.5 ${
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
                              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium px-2 py-0.5 ${
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

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {profile.createdAt.toLocaleDateString()}
                          </div>
                          {profile.lastUsed && (
                            <div className="flex items-center gap-1.5">
                              <span>•</span>
                              <span>
                                Used {profile.lastUsed.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-4">
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
                            className={`h-3.5 w-3.5 transition-colors ${
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
                          <Trash2 className="h-3.5 w-3.5" />
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
          <CardContent className="text-center py-10 px-6">
            <div className="p-4 rounded-full bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-base mb-2">No saved profiles yet</h3>
            <p className="text-sm text-muted-foreground/80 mb-6 leading-relaxed">
              Save your current settings as a profile for quick access later
            </p>
            <div className="text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg border border-muted-foreground/10">
              <strong className="font-medium">Tip:</strong> Profiles help you quickly switch between
              different password configurations
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
