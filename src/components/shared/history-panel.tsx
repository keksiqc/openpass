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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PasswordHistory } from "../../types";
import { getStrengthTextColor } from "../../utils/strength-helpers";

interface HistoryPanelProps {
  history: PasswordHistory[];
  onClearHistory: () => void;
  onCopyToClipboard: (text: string) => void;
  onDeleteHistoryEntry: (id: string) => void;
}

export function HistoryPanel({
  history,
  onCopyToClipboard,
  onClearHistory,
  onDeleteHistoryEntry,
}: HistoryPanelProps) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (entryId: string) => {
    setShowPasswords((prev) => ({ ...prev, [entryId]: !prev[entryId] }));
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
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4 text-accent" />
          History
          {history.length > 0 ? (
            <Badge className="ml-auto" variant="secondary">
              {history.length}
            </Badge>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">No history yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Generated passwords will appear here
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end">
              <Button
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={onClearHistory}
                size="sm"
                variant="ghost"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Clear All
              </Button>
            </div>
            <ScrollArea className="h-80 sm:h-96">
              <div className="space-y-2 pr-2">
                {history.map((entry) => (
                  <div
                    className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                    key={entry.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          {getTypeIcon(entry.type)}
                        </div>
                        <Badge className="text-[10px]" variant="secondary">
                          {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                        </Badge>
                        <span
                          className={`text-[10px] font-semibold sm:text-xs ${getStrengthTextColor(entry.strength.label)}`}
                        >
                          {entry.strength.label}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          className="h-7 w-7 p-0"
                          onClick={() => togglePasswordVisibility(entry.id)}
                          size="sm"
                          title={showPasswords[entry.id] ? "Hide" : "Show"}
                          variant="ghost"
                        >
                          {showPasswords[entry.id] ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          className="h-7 w-7 p-0"
                          onClick={() => onCopyToClipboard(entry.password)}
                          size="sm"
                          title="Copy"
                          variant="ghost"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => onDeleteHistoryEntry(entry.id)}
                          size="sm"
                          title="Delete"
                          variant="ghost"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      className="bg-background/60 font-mono text-xs"
                      readOnly
                      value={
                        showPasswords[entry.id]
                          ? entry.password
                          : "•".repeat(Math.min(entry.password.length, 20))
                      }
                    />
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(
                        entry.createdAt instanceof Date
                          ? entry.createdAt
                          : new Date(entry.createdAt),
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
