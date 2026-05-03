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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  activeTab: ProfileType;
  editingProfileId: string | null;
  formatSettings: FormatSettings;
  onCancelEdit: () => void;
  onDeleteProfile: (profileId: string) => void;
  onEditProfile: (profile: Profile) => void;
  onLoadProfile: (profile: Profile) => void;
  onProfileNameChange: (name: string) => void;
  onSaveProfile: () => void;
  onToggleFavorite: (profileId: string) => void;
  passphraseSettings: PassphraseSettings;
  passwordHistory: PasswordHistory[];
  passwordSettings: PasswordSettings;
  pinSettings?: PinSettings;
  profileName: string;
  profiles: Profile[];
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
  const [selectedFilter, setSelectedFilter] = useState<ProfileType | "all">("all");

  const getTypeIcon = (type: ProfileType) => {
    switch (type) {
      case "password":
        return <Zap className="h-3.5 w-3.5" />;
      case "passphrase":
        return <BookOpen className="h-3.5 w-3.5" />;
      case "format":
        return <FileText className="h-3.5 w-3.5" />;
      case "pin":
        return <Shield className="h-3.5 w-3.5" />;
      default:
        return <Settings className="h-3.5 w-3.5" />;
    }
  };

  const filteredProfiles = profiles
    .filter((profile) => {
      const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === "all" || profile.type === selectedFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      if (a.lastUsed && b.lastUsed) return b.lastUsed.getTime() - a.lastUsed.getTime();
      if (a.lastUsed && !b.lastUsed) return -1;
      if (!a.lastUsed && b.lastUsed) return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          Profiles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Save Profile */}
        <div className="space-y-2.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium" htmlFor="profile-name">
            <User className="h-3.5 w-3.5" />
            {editingProfileId ? "Update Profile" : "New Profile"}
          </Label>
          <Input
            className="h-9"
            id="profile-name"
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="Profile name…"
            value={profileName}
          />
          <div className="flex gap-2">
            <Button
              className="h-9 w-full gap-1.5"
              disabled={!profileName.trim()}
              onClick={onSaveProfile}
              size="sm"
            >
              <Save className="h-3.5 w-3.5" />
              {editingProfileId ? "Update" : "Save Settings"}
            </Button>
            {editingProfileId ? (
              <Button className="h-9" onClick={onCancelEdit} size="sm" variant="outline">
                Cancel
              </Button>
            ) : null}
          </div>
        </div>

        {/* Saved Profiles */}
        {profiles.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{profiles.length} saved</Badge>
              <Select
                onValueChange={(value: ProfileType | "all") => setSelectedFilter(value)}
                value={selectedFilter}
              >
                <SelectTrigger className="h-8 w-[110px] text-xs">
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
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-8 pl-9 text-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                value={searchQuery}
              />
            </div>
            <ScrollArea className="h-72 sm:h-80">
              {filteredProfiles.length > 0 ? (
                <div className="space-y-1.5 pr-2">
                  {filteredProfiles.map((profile) => (
                    <div
                      className={`group flex flex-col gap-1.5 rounded-lg border p-3 transition-colors hover:bg-muted/40 ${
                        profile.isFavorite
                          ? "border-accent/30 bg-accent/5"
                          : "border-border bg-muted/20"
                      }`}
                      key={profile.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            {getTypeIcon(profile.type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-medium">{profile.name}</h3>
                            <span className="text-[10px] text-muted-foreground">
                              {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <Button
                            className="h-7 w-7 p-0"
                            onClick={() => onToggleFavorite(profile.id)}
                            size="sm"
                            title={profile.isFavorite ? "Remove favorite" : "Add favorite"}
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
                              <Button className="h-7 w-7 p-0" size="sm" variant="ghost">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onLoadProfile(profile)}>
                                Load Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditProfile(profile)}>
                                Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onToggleFavorite(profile.id)}>
                                {profile.isFavorite ? "Remove Favorite" : "Add Favorite"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDeleteProfile(profile.id)}
                                variant="destructive"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Plus className="h-2.5 w-2.5" />
                            <span>{profile.createdAt.toLocaleDateString()}</span>
                          </div>
                          {profile.lastUsed ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              <span>{profile.lastUsed.toLocaleDateString()}</span>
                            </div>
                          ) : null}
                        </div>
                        <Button
                          className="h-6 px-2.5 text-[10px]"
                          onClick={() => onLoadProfile(profile)}
                          size="sm"
                        >
                          Load
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center px-4 py-8 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Search className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium">No profiles found</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search or filter
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col items-center px-2 py-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Users className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-medium">No saved profiles</h3>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Save your current settings for quick access later
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
