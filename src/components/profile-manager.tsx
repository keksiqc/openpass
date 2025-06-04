
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
import { Download, Save, Star, Trash2, Upload } from 'lucide-react';
import type { FormatSettings, PassphraseSettings, PasswordHistory, PasswordProfile, PasswordSettings } from '../types';

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
    <div className="space-y-6">
      {/* Save Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Profile
          </CardTitle>
          <CardDescription>
            Save current settings as a reusable profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="profile-name">Profile Name</Label>
            <Input
              id="profile-name"
              value={profileName}
              onChange={(e) => onProfileNameChange(e.target.value)}
              placeholder="Enter profile name..."
            />
          </div>
          <Button onClick={onSaveProfile} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Current Settings
          </Button>
        </CardContent>
      </Card>

      {/* Profiles List */}
      {profiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Profiles</CardTitle>
            <CardDescription>
              Load and manage your saved profiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profiles
                .sort((a, b) => {
                  if (a.isFavorite && !b.isFavorite) return -1;
                  if (!a.isFavorite && b.isFavorite) return 1;
                  return b.createdAt.getTime() - a.createdAt.getTime();
                })
                .map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{profile.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {profile.type}
                        </Badge>
                        {profile.isFavorite && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {profile.createdAt.toLocaleDateString()}
                        {profile.lastUsed && (
                          <span> • Last used: {profile.lastUsed.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleFavorite(profile.id)}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            profile.isFavorite
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onLoadProfile(profile)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteProfile(profile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>
            Export your profiles and history or import from backup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={onExportData} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <div>
            <Label htmlFor="import-file">Import Data</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={onImportData}
                className="cursor-pointer"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
