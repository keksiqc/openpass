import {
  BookOpen,
  Clock,
  FileText,
  MoreVertical,
  Plus,
  Save,
  Search,
  Settings,
  Shield, // Added Shield
  Sparkles,
  Star,
  User,
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
import type {
  FormatSettings,
  PassphraseSettings,
  PasswordHistory,
  // PasswordProfile, // Replaced by Profile
  PasswordSettings,
  PinSettings, // Added
  Profile, // Added
  ProfileType, // Added
} from '../types';

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
  onEditProfile, // Destructure new prop
  editingProfileId, // Destructure new prop
  onCancelEdit, // Destructure new prop
}: ProfileManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ProfileType | 'all'>('all'); // Changed

  // Get type icon with enhanced styling
  const getTypeIcon = (type: ProfileType) => { // Changed
    switch (type) {
      case 'password':
        return <Zap className="h-4 w-4" />;
      case 'passphrase':
        return <BookOpen className="h-4 w-4" />;
      case 'custom': // Changed from 'format'
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
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      if (a.lastUsed && b.lastUsed) {
        return b.lastUsed.getTime() - a.lastUsed.getTime();
      }
      if (a.lastUsed && !b.lastUsed) return -1;
      if (!a.lastUsed && b.lastUsed) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  return (
    <div className="space-y-6">
      {/* Save Profile Section */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/30 transition-all duration-300 hover:shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            Create New Profile
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            Save your current generator settings as a reusable profile for quick
            access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
              className="h-11 text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 border-2"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onSaveProfile}
              className="w-full h-11 font-medium text-sm gap-2 transition-all duration-200 hover:shadow-md"
              disabled={!profileName.trim()}
            >
              <Save className="h-4 w-4" />
              {editingProfileId ? 'Update Profile' : 'Save Current Settings'}
            </Button>
            {editingProfileId && (
              <Button
                onClick={onCancelEdit}
                variant="outline"
                className="h-11 font-medium text-sm gap-2 transition-all duration-200"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Saved Profiles Section */}
      {profiles.length > 0 ? (
        <Card className="border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Saved Profiles</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {filteredProfiles.length} of {profiles.length} profiles
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-xs font-medium"
              >
                {profiles.length}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles..."
                className="pl-10 h-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'password', 'passphrase', 'custom', 'pin'] as const).map( // Added 'custom', 'pin'
                (filter) => (
                  <Button
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter)}
                    className="capitalize text-xs"
                  >
                    {filter === 'all' ? 'All' : filter}
                  </Button>
                ),
              )}
            </div>

            {/* Profiles List */}
            {filteredProfiles.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="group relative p-4 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200 hover:shadow-sm"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`p-2 rounded-md transition-colors ${
                              profile.type === 'password'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                : profile.type === 'passphrase'
                                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                                  : profile.type === 'custom' // Changed from 'format'
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' // For PIN
                            }`}
                          >
                            <div
                              className={`${
                                profile.type === 'password'
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : profile.type === 'passphrase'
                                    ? 'text-green-600 dark:text-green-400'
                                    : profile.type === 'custom' // Changed from 'format'
                                      ? 'text-purple-600 dark:text-purple-400'
                                      : 'text-red-600 dark:text-red-400' // For PIN
                              }`}
                            >
                              {getTypeIcon(profile.type)}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base truncate">
                              {profile.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${
                                profile.type === 'password'
                                  ? 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800'
                                  : profile.type === 'passphrase'
                                    ? 'text-green-600 border-green-200 dark:text-green-400 dark:border-green-800'
                                    : profile.type === 'custom' // Changed from 'format'
                                      ? 'text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800'
                                      : 'text-red-600 border-red-200 dark:text-red-400 dark:border-red-800' // For PIN
                              }`}
                            >
                              {profile.type.toString().charAt(0).toUpperCase() +
                                profile.type.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Date metadata in top right with icons only */}
                        <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground">
                          <div
                            className="flex items-center gap-1"
                            title={`Created ${profile.createdAt.toLocaleDateString()}`}
                          >
                            <Plus className="h-3 w-3" />
                            <span>
                              {profile.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          {profile.lastUsed && (
                            <div
                              className="flex items-center gap-1"
                              title={`Last used ${profile.lastUsed.toLocaleDateString()}`}
                            >
                              <Clock className="h-3 w-3" />
                              <span>
                                {profile.lastUsed.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onLoadProfile(profile)}
                          className="flex-1 mr-2 h-9 font-medium"
                        >
                          Load Profile
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onToggleFavorite(profile.id)}
                            className="h-9 w-9 p-0"
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 w-9 p-0"
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
                                onClick={() => onEditProfile(profile)} // New Edit option
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* No results found */
              <div className="text-center py-8 px-6">
                <div className="p-3 rounded-full bg-muted/30 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Search className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium mb-1">No profiles found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/30 transition-colors">
          <CardContent className="text-center py-12 px-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-muted/40 to-muted/20 w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-muted-foreground/10">
              <Sparkles className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-lg mb-2">
              No saved profiles yet
            </h3>
            <p className="text-sm text-muted-foreground/80 mb-6 leading-relaxed max-w-sm mx-auto">
              Create your first profile to save your current generator settings
              for quick access later
            </p>
            <div className="text-xs text-muted-foreground bg-muted/30 p-4 rounded-lg border border-muted-foreground/10 max-w-md mx-auto">
              <strong className="font-medium">Tip:</strong> Profiles let
              you quickly switch between different password configurations for
              work, personal use, or specific requirements
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
