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
        <CardTitle className="flex items-center gap-3">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <Users className="h-4 w-4 text-accent-foreground" />
          </div>
          Profiles
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed sm:text-sm">
          Save and reuse your generator configurations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 sm:space-y-6">
        {/* Save Profile Section */}
        <div className="space-y-3">
          <Label
            className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
            htmlFor="profile-name"
          >
            <User className="h-3.5 w-3.5" />
            {editingProfileId ? "Update Profile" : "New Profile"}
          </Label>
          <Input
            className="h-10 border-2 text-sm"
            id="profile-name"
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="Profile name..."
            value={profileName}
          />
          <div className="flex gap-2">
            <Button
              className="h-10 w-full gap-2 text-xs"
              disabled={!profileName.trim()}
              onClick={onSaveProfile}
            >
              <Save className="h-3.5 w-3.5" />
              {editingProfileId ? "Update" : "Save Current Settings"}
            </Button>
            {editingProfileId ? (
              <Button
                className="h-10 gap-2 text-xs"
                onClick={onCancelEdit}
                variant="outline"
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </div>

        {/* Saved Profiles Section */}
        {profiles.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{profiles.length} saved</Badge>
              <Select
                onValueChange={(value: ProfileType | "all") =>
                  setSelectedFilter(value)
                }
                value={selectedFilter}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="passphrase">Passphrase</SelectItem>
                  <SelectItem value="format">Format</SelectItem>
                  <SelectItem value="pin">PIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                className="h-9 pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                value={searchQuery}
              />
            </div>
            <ScrollArea className="h-72 sm:h-96">
              {filteredProfiles.length > 0 ? (
                <div className="space-y-2">
                  {filteredProfiles.map((profile) => (
                    <div
                      className={`group flex flex-col gap-2 border-2 border-foreground p-3 transition-colors hover:bg-secondary ${
                        profile.isFavorite ? "border-accent bg-accent/5" : ""
                      }`}
                      key={profile.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div className="border border-foreground p-1.5">
                            {getTypeIcon(profile.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-bold text-xs uppercase tracking-wider">
                              {profile.name}
                            </h3>
                            <span className="text-[10px] text-muted-foreground">
                              {profile.type.toString().charAt(0).toUpperCase() +
                                profile.type.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            className="h-7 w-7 p-0"
                            onClick={() => onToggleFavorite(profile.id)}
                            size="sm"
                            title={
                              profile.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                            variant="ghost"
                          >
                            <Star
                              className={`h-3.5 w-3.5 transition-colors ${
                                profile.isFavorite
                                  ? "fill-accent text-accent"
                                  : "text-muted-foreground hover:text-accent"
                              }`}
                            />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                className="h-7 w-7 p-0"
                                size="sm"
                                variant="ghost"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
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
                      {/* Metadata + Load */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <div
                            className="flex items-center gap-1"
                            title={`Created ${profile.createdAt.toLocaleDateString()}`}
                          >
                            <Plus className="h-2.5 w-2.5" />
                            <span>
                              {profile.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          {profile.lastUsed ? (
                            <div
                              className="flex items-center gap-1"
                              title={`Last used ${profile.lastUsed.toLocaleDateString()}`}
                            >
                              <Clock className="h-2.5 w-2.5" />
                              <span>
                                {profile.lastUsed.toLocaleDateString()}
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <Button
                          className="h-7 px-3 text-[10px]"
                          onClick={() => onLoadProfile(profile)}
                          size="sm"
                          variant="default"
                        >
                          Load
                        </Button>
                      </div>
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
          <div className="px-2 py-6 text-center sm:px-6 sm:py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-foreground bg-secondary p-3 sm:mb-5 sm:h-16 sm:w-16 sm:p-4">
              <Users className="h-6 w-6 text-muted-foreground/40 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-2 font-bold text-xs uppercase tracking-wider sm:text-sm">
              No saved profiles
            </h3>
            <p className="mx-auto mb-4 max-w-sm text-muted-foreground text-xs leading-relaxed">
              Save your current settings as a profile for quick access later
            </p>
            <div className="mx-auto max-w-md border border-foreground/30 bg-secondary/50 p-3 text-[10px] sm:text-xs">
              <strong className="font-bold uppercase tracking-wider">
                Tip:
              </strong>{" "}
              Profiles let you switch between configurations instantly
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
