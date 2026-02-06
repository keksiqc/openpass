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
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FormatSettings,
  PassphraseSettings,
  PasswordHistory,
  PasswordSettings,
  PinSettings,
  Profile,
  ProfileType,
} from "../../types";

interface ProfileManagerProps {
  profiles: Profile[];
  profileName: string;
  onProfileNameChange: (name: string) => void;
  activeTab: ProfileType;
  passwordSettings: PasswordSettings;
  passphraseSettings: PassphraseSettings;
  formatSettings: FormatSettings;
  pinSettings?: PinSettings;
  passwordHistory: PasswordHistory[];
  onSaveProfile: () => void;
  onLoadProfile: (profile: Profile) => void;
  onToggleFavorite: (profileId: string) => void;
  onDeleteProfile: (profileId: string) => void;
  onEditProfile: (profile: Profile) => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ProfileType | "all">(
    "all"
  );

  const getTypeIcon = (type: ProfileType) => {
    switch (type) {
      case "password":
        return <Zap className="h-4 w-4" />;
      case "passphrase":
        return <BookOpen className="h-4 w-4" />;
      case "format":
        return <FileText className="h-4 w-4" />;
      case "pin":
        return <Shield className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const filteredProfiles = profiles
    .filter((profile) => {
      const matchesSearch = profile.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" || profile.type === selectedFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
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
        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <Users className="h-4 w-4 text-accent-foreground" />
          </div>
          Profiles
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          Save and manage your generator profiles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-8">
        {/* Save Profile Section */}
        <div className="space-y-4">
          <Label
            className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
            htmlFor="profile-name"
          >
            <User className="h-3.5 w-3.5" />
            Profile Name
          </Label>
          <Input
            className="h-11 border-2 text-sm"
            id="profile-name"
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="e.g., Work Passwords, Personal..."
            value={profileName}
          />
          <div className="flex gap-2">
            <Button
              className="h-11 w-full gap-2 text-sm"
              disabled={!profileName.trim()}
              onClick={onSaveProfile}
            >
              <Save className="h-4 w-4" />
              {editingProfileId ? "Update Profile" : "Save Settings"}
            </Button>
            {editingProfileId && (
              <Button
                className="h-11 gap-2 text-sm"
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
              <Badge variant="secondary">{profiles.length} profiles</Badge>
              <Select
                onValueChange={(value: ProfileType | "all") =>
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
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                className="h-10 pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search profiles..."
                value={searchQuery}
              />
            </div>
            <ScrollArea className="h-72 sm:h-96">
              {filteredProfiles.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {filteredProfiles.map((profile) => (
                    <div
                      className={`group flex flex-col gap-2 border-2 border-foreground p-3 transition-colors hover:bg-secondary sm:gap-3 sm:p-4 ${
                        profile.isFavorite ? "border-accent bg-accent/5" : ""
                      }`}
                      key={profile.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div className="border-2 border-foreground p-1.5 sm:p-2">
                            {getTypeIcon(profile.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-bold text-xs uppercase tracking-wider sm:text-sm">
                              {profile.name}
                            </h3>
                            <Badge
                              className="text-[10px] sm:text-xs"
                              variant="outline"
                            >
                              {profile.type.toString().charAt(0).toUpperCase() +
                                profile.type.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            className="h-7 w-7 p-0 sm:h-9 sm:w-9"
                            onClick={() => onToggleFavorite(profile.id)}
                            size="sm"
                            title={
                              profile.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                            variant="outline"
                          >
                            <Star
                              className={`h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4 ${
                                profile.isFavorite
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground hover:text-accent"
                              }`}
                            />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="h-7 w-7 p-0 sm:h-9 sm:w-9"
                                size="sm"
                                variant="outline"
                              >
                                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                                  ? "Remove from Favorites"
                                  : "Add to Favorites"}
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
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground sm:flex-col sm:items-start sm:gap-2 sm:text-xs">
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
                      <Button
                        className="h-8 w-full sm:h-9"
                        onClick={() => onLoadProfile(profile)}
                        size="sm"
                        variant="default"
                      >
                        Load Profile
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center sm:px-6 sm:py-8">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border-2 border-foreground p-2 sm:h-12 sm:w-12 sm:p-3">
                    <Search className="h-4 w-4 text-muted-foreground/50 sm:h-5 sm:w-5" />
                  </div>
                  <p className="mb-1 font-bold text-xs uppercase tracking-wider sm:text-sm">
                    No profiles found
                  </p>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">
                    Try adjusting your search or filter
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="px-2 py-8 text-center sm:px-6 sm:py-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-foreground bg-secondary p-3 sm:mb-6 sm:h-20 sm:w-20 sm:p-4">
              <Users className="h-6 w-6 text-muted-foreground/50 sm:h-8 sm:w-8" />
            </div>
            <h3 className="mb-2 font-bold text-xs uppercase tracking-wider sm:text-sm">
              No saved profiles yet
            </h3>
            <p className="mx-auto mb-4 max-w-sm text-muted-foreground text-xs leading-relaxed sm:mb-6 sm:text-sm">
              Save your current generator settings for quick access later
            </p>
            <div className="mx-auto max-w-md border-2 border-foreground bg-secondary p-3 text-[10px] sm:p-4 sm:text-xs">
              <strong className="font-bold uppercase tracking-wider">
                Tip:
              </strong>{" "}
              Profiles let you quickly switch between different password
              configurations
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
