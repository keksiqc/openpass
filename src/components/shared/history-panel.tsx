import {
  BookOpen,
  Clock,
  Copy,
  Eye,
  EyeOff,
  History,
  Settings,
  Shield,
  Trash2,
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PasswordHistory } from "../../types";
import { getStrengthTextColor } from "../../utils/strength-helpers";

interface HistoryPanelProps {
  history: PasswordHistory[];
  onCopyToClipboard: (text: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryEntry: (id: string) => void;
}

export function HistoryPanel({
  history,
  onCopyToClipboard,
  onClearHistory,
  onDeleteHistoryEntry,
}: HistoryPanelProps) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const togglePasswordVisibility = (entryId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "password":
        return <Zap className="h-3 w-3" />;
      case "passphrase":
        return <BookOpen className="h-3 w-3" />;
      case "format":
        return <Settings className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <History className="h-4 w-4 text-accent-foreground" />
          </div>
          History
          {history.length > 0 ? (
            <Badge className="ml-auto" variant="secondary">
              {history.length}
            </Badge>
          ) : null}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed sm:text-sm">
          Recently generated passwords for quick access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground sm:px-6 sm:py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-foreground bg-secondary p-3 sm:h-16 sm:w-16 sm:p-4">
              <Shield className="h-6 w-6 opacity-40 sm:h-7 sm:w-7" />
            </div>
            <p className="mb-2 font-bold text-xs uppercase tracking-wider sm:text-sm">
              No history yet
            </p>
            <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
              Generated passwords will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end">
              <Button
                className="text-xs hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onClearHistory}
                size="sm"
                variant="outline"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
            <ScrollArea className="h-80 sm:h-96">
              <div className="space-y-2">
                {history.map((entry) => (
                  <div
                    className="group flex flex-col gap-2 border-2 border-foreground p-3 transition-colors hover:bg-secondary sm:p-4"
                    key={entry.id}
                  >
                    {/* Top row: type info + actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <div className="border border-foreground p-1">
                          {getTypeIcon(entry.type)}
                        </div>
                        <Badge
                          className="text-[10px] sm:text-xs"
                          variant="outline"
                        >
                          {entry.type.toString().charAt(0).toUpperCase() +
                            entry.type.slice(1)}
                        </Badge>
                        <span
                          className={`font-bold text-[10px] uppercase sm:text-xs ${getStrengthTextColor(entry.strength.label)}`}
                        >
                          {entry.strength.label}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                          onClick={() => togglePasswordVisibility(entry.id)}
                          size="sm"
                          title={
                            showPasswords[entry.id]
                              ? "Hide password"
                              : "Show password"
                          }
                          variant="outline"
                        >
                          {showPasswords[entry.id] ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                          onClick={() => onCopyToClipboard(entry.password)}
                          size="sm"
                          title="Copy to clipboard"
                          variant="outline"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          className="h-7 w-7 p-0 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive sm:h-8 sm:w-8"
                          onClick={() => onDeleteHistoryEntry(entry.id)}
                          size="sm"
                          title="Delete entry"
                          variant="outline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Password display */}
                    <Input
                      className="bg-secondary font-mono text-xs"
                      readOnly
                      value={
                        showPasswords[entry.id]
                          ? entry.password
                          : "•".repeat(Math.min(entry.password.length, 20))
                      }
                    />
                    {/* Timestamp */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                      <Clock className="h-3 w-3" />
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(
                        entry.createdAt instanceof Date
                          ? entry.createdAt
                          : new Date(entry.createdAt)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
