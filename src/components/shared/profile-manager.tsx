import {
  BookOpen,
  Clock,
  FileText,
  MoreVertical,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  Star,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  FormatSettings,
  PassphraseSettings,
  PasswordHistory,
  // PasswordProfile, // Replaced by Profile
  PasswordSettings,
  PinSettings, // Added
  Profile, // Added
  ProfileType, // Added
} from '../../types';

interface ProfileManagerProps {
  profiles: Profile[]; // Changed
  profileName: string;
  onProfileNameChange: (name: string) => void;
  activeTab: ProfileType; // Changed
  passwordSettings: PasswordSettings;
  passphraseSettings: PassphraseSettings;
  formatSettings: FormatSettings; // This is for the "Custom" generator
  pinSettings?: PinSettings; // Added
  passwordHistory: PasswordHistory[];
  onSaveProfile: () => void;
  onLoadProfile: (profile: Profile) => void; // Changed
  onToggleFavorite: (profileId: string) => void;
  onDeleteProfile: (profileId: string) => void;
  onEditProfile: (profile: Profile) => void; // Changed
  editingProfileId: string | null;
  onCancelEdit: () => void;
}

export function ProfileManager({
  profiles,
  profileName,
  onProfileNameChange,
  onSaveProfile,
  onLoadProfile,
  onToggleFavorite,
  onDeleteProfile,
  onEditProfile,
  editingProfileId,
  onCancelEdit,
}: ProfileManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ProfileType | 'all'>(
    'all'
  ); // Changed

  // Get type icon with enhanced styling
  const getTypeIcon = (type: ProfileType) => {
    // Changed
    switch (type) {
      case 'password':
        return <Zap className="h-4 w-4" />;
      case 'passphrase':
        return <BookOpen className="h-4 w-4" />;
      case 'format': // Changed from 'custom'
        return <FileText className="h-4 w-4" />;
      case 'pin':
        return <Shield className="h-4 w-4" />; // Added Shield icon, ensure it's imported if not already
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  // Filter and search profiles
  const filteredProfiles = profiles
    .filter((profile) => {
      const matchesSearch = profile.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === 'all' || profile.type === selectedFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Favorites first, then by last used, then by creation date
      if (a.isFavorite && !b.isFavorite) {
        return -1;
      }
      if (!a.isFavorite && b.isFavorite) {
        return 1;
      }
      if (a.lastUsed && b.lastUsed) {
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      }
      if (a.lastUsed && !b.lastUsed) {
        return -1;
      }
      if (!a.lastUsed && b.lastUsed) {
        return 1;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="rounded-lg border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 p-2">
            <Users className="h-4 w-4 text-primary" />
          </div>
          Profile Manager
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm leading-relaxed">
          Save and manage your generator profiles for quick access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Save Profile Section */}
        <div className="space-y-4">
          <Label
            className="flex items-center gap-2 font-medium text-sm"
            htmlFor="profile-name"
          >
            <User className="h-3.5 w-3.5" />
            Profile Name
          </Label>
          <Input
            className="h-11 border-2 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            id="profile-name"
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="e.g., Work Passwords, Personal Settings..."
            value={profileName}
          />
          <div className="flex gap-2">
            <Button
              className="h-11 w-full gap-2 font-medium text-sm transition-all duration-200 hover:shadow-md"
              disabled={!profileName.trim()}
              onClick={onSaveProfile}
            >
              <Save className="h-4 w-4" />
              {editingProfileId ? 'Update Profile' : 'Save Current Settings'}
            </Button>
            {editingProfileId && (
              <Button
                className="h-11 gap-2 font-medium text-sm transition-all duration-200"
                onClick={onCancelEdit}
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Saved Profiles Section */}
        {profiles.length > 0 ? (
          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between">
              <Badge
                className="px-3 py-1.5 font-medium text-xs"
                variant="secondary"
              >
                {profiles.length} profiles
              </Badge>
              <Select
                onValueChange={(value: ProfileType | 'all') =>
                  setSelectedFilter(value)
                }
                value={selectedFilter}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="passphrase">Passphrase</SelectItem>
                  <SelectItem value="format">Format</SelectItem>
                  <SelectItem value="pin">PIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative mb-2">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
              <Input
                className="h-10 pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles..."
                value={searchQuery}
              />
            </div>
            <ScrollArea className="h-96">
              {filteredProfiles.length > 0 ? (
                <div className="space-y-3">
                  {filteredProfiles.map((profile) => (
                    <div
                      className={`group flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50 ${
                        profile.isFavorite ? 'border-2 border-primary/40' : ''
                      }`}
                      key={profile.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div
                            className={`rounded-md p-2 transition-colors ${
                              profile.type === 'password'
                                ? 'border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                : profile.type === 'passphrase'
                                  ? 'border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                  : profile.type === 'format'
                                    ? 'border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20'
                                    : 'border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                            }`}
                          >
                            <div
                              className={
                                profile.type === 'password'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : profile.type === 'passphrase'
                                    ? 'text-green-600 dark:text-green-400'
                                    : profile.type === 'format'
                                      ? 'text-purple-600 dark:text-purple-400'
                                      : 'text-red-600 dark:text-red-400'
                              }
                            >
                              {getTypeIcon(profile.type)}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-base">
                              {profile.name}
                            </h3>
                            <Badge
                              className={`font-medium text-xs ${
                                profile.type === 'password'
                                  ? 'border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400'
                                  : profile.type === 'passphrase'
                                    ? 'border-green-200 text-green-600 dark:border-green-800 dark:text-green-400'
                                    : profile.type === 'format'
                                      ? 'border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400'
                                      : 'border-red-200 text-red-600 dark:border-red-800 dark:text-red-400'
                              }`}
                              variant="outline"
                            >
                              {profile.type.toString().charAt(0).toUpperCase() +
                                profile.type.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            className="h-9 w-9 p-0"
                            onClick={() => onToggleFavorite(profile.id)}
                            size="sm"
                            title={
                              profile.isFavorite
                                ? 'Remove from favorites'
                                : 'Add to favorites'
                            }
                            variant="outline"
                          >
                            <Star
                              className={`h-4 w-4 transition-colors ${
                                profile.isFavorite
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground hover:text-yellow-400'
                              }`}
                            />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="h-9 w-9 p-0"
                                size="sm"
                                variant="outline"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => onLoadProfile(profile)}
                              >
                                Load Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onEditProfile(profile)}
                              >
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onToggleFavorite(profile.id)}
                              >
                                {profile.isFavorite
                                  ? 'Remove from Favorites'
                                  : 'Add to Favorites'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDeleteProfile(profile.id)}
                                variant="destructive"
                              >
                                Delete Profile
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 text-muted-foreground text-xs">
                        <div
                          className="flex items-center gap-1"
                          title={`Created ${profile.createdAt.toLocaleDateString()}`}
                        >
                          <Plus className="h-3 w-3" />
                          <span>{profile.createdAt.toLocaleDateString()}</span>
                        </div>
                        {profile.lastUsed && (
                          <div
                            className="flex items-center gap-1"
                            title={`Last used ${profile.lastUsed.toLocaleDateString()}`}
                          >
                            <Clock className="h-3 w-3" />
                            <span>{profile.lastUsed.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          className="mr-2 h-9 flex-1 font-medium"
                          onClick={() => onLoadProfile(profile)}
                          size="sm"
                          variant="default"
                        >
                          Load Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/30 p-3">
                    <Search className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <p className="mb-1 font-medium text-sm">No profiles found</p>
                  <p className="text-muted-foreground text-xs">
                    Try adjusting your search or filter
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-muted-foreground/10 bg-gradient-to-br from-muted/40 to-muted/20 p-4">
              <Users className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="mb-2 font-semibold text-lg">
              No saved profiles yet
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-muted-foreground/80 text-sm leading-relaxed">
              Create your first profile to save your current generator settings
              for quick access later
            </p>
            <div className="mx-auto max-w-md rounded-lg border border-muted-foreground/10 bg-muted/30 p-4 text-muted-foreground text-xs">
              <strong className="font-medium">Tip:</strong> Profiles let you
              quickly switch between different password configurations for work,
              personal use, or specific requirements
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
