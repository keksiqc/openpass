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
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      const matchesSearch = profile.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" || profile.type === selectedFilter;
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
    <div className="space-y-4">
      {/* Save Profile */}
      <div className="border-2 border-foreground bg-card shadow-brutal">
        <div className="border-foreground border-b-2 px-4 py-3">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            {editingProfileId ? "Update Profile" : "Save Current"}
          </span>
        </div>
        <div className="space-y-3 p-4">
          <Input
            className="h-9 text-xs"
            onChange={(e) => onProfileNameChange(e.target.value)}
            placeholder="Profile name..."
            value={profileName}
          />
          <div className="flex gap-2">
            <Button
              className="w-full gap-1.5 text-[10px]"
              disabled={!profileName.trim()}
              onClick={onSaveProfile}
              size="sm"
            >
              <Save className="h-3 w-3" />
              {editingProfileId ? "Update" : "Save"}
            </Button>
            {editingProfileId ? (
              <Button className="text-[10px]" onClick={onCancelEdit} size="sm" variant="outline">
                Cancel
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Saved Profiles */}
      {profiles.length > 0 ? (
        <div className="border-2 border-foreground bg-card shadow-brutal">
          <div className="flex items-center justify-between border-foreground border-b-2 px-4 py-3">
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
              Saved
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[9px]">{profiles.length}</Badge>
              <Select
                onValueChange={(value: ProfileType | "all") => setSelectedFilter(value)}
                value={selectedFilter}
              >
                <SelectTrigger className="h-6 w-[90px] border text-[10px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="passphrase">Phrase</SelectItem>
                  <SelectItem value="format">Format</SelectItem>
                  <SelectItem value="pin">PIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 pb-0">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-[11px]"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                value={searchQuery}
              />
            </div>
          </div>

          <ScrollArea className="h-64 p-4 sm:h-80">
            {filteredProfiles.length > 0 ? (
              <div className="space-y-2">
                {filteredProfiles.map((profile) => (
                  <div
                    className={`group flex flex-col gap-2 border-2 p-3 transition-colors hover:bg-secondary/50 ${
                      profile.isFavorite
                        ? "border-accent bg-accent/5"
                        : "border-foreground/30"
                    }`}
                    key={profile.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="border border-foreground/30 p-1">
                          {getTypeIcon(profile.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-bold text-[11px] uppercase tracking-wider">
                            {profile.name}
                          </h3>
                          <span className="text-[9px] text-muted-foreground">
                            {profile.type.toString().charAt(0).toUpperCase() +
                              profile.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          className="h-6 w-6 p-0"
                          onClick={() => onToggleFavorite(profile.id)}
                          size="sm"
                          title={profile.isFavorite ? "Unfavorite" : "Favorite"}
                          variant="ghost"
                        >
                          <Star
                            className={`h-3 w-3 transition-colors ${
                              profile.isFavorite
                                ? "fill-accent text-accent"
                                : "text-muted-foreground hover:text-accent"
                            }`}
                          />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="h-6 w-6 p-0" size="sm" variant="ghost">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onLoadProfile(profile)}>
                              Load
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditProfile(profile)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleFavorite(profile.id)}>
                              {profile.isFavorite ? "Unfavorite" : "Favorite"}
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
                    {/* Metadata + Load */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        <div className="flex items-center gap-0.5" title={`Created ${profile.createdAt.toLocaleDateString()}`}>
                          <Plus className="h-2 w-2" />
                          <span>{profile.createdAt.toLocaleDateString()}</span>
                        </div>
                        {profile.lastUsed ? (
                          <div className="flex items-center gap-0.5" title={`Last used ${profile.lastUsed.toLocaleDateString()}`}>
                            <Clock className="h-2 w-2" />
                            <span>{profile.lastUsed.toLocaleDateString()}</span>
                          </div>
                        ) : null}
                      </div>
                      <Button
                        className="h-6 px-2.5 text-[9px]"
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
              <div className="py-6 text-center">
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center border border-foreground/20">
                  <Search className="h-3.5 w-3.5 text-muted-foreground/50" />
                </div>
                <p className="mb-0.5 font-bold text-[10px] uppercase tracking-wider">
                  No results
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Try adjusting your search
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      ) : (
        <div className="border-2 border-foreground bg-card shadow-brutal">
          <div className="px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-foreground bg-secondary">
              <Users className="h-5 w-5 opacity-30" />
            </div>
            <p className="mb-1 font-bold text-[10px] uppercase tracking-wider">
              No saved profiles
            </p>
            <p className="mx-auto max-w-[200px] text-[10px] text-muted-foreground leading-relaxed">
              Save your current settings for quick reuse later
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
