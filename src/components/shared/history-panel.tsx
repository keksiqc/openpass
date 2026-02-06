import {
  BookOpen,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Settings,
  Shield,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

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
    <div className="border-2 border-foreground bg-card shadow-brutal">
      {/* Header */}
      <div className="flex items-center justify-between border-foreground border-b-2 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
            History
          </span>
          {history.length > 0 ? (
            <Badge variant="secondary" className="text-[10px]">{history.length}</Badge>
          ) : null}
        </div>
        {history.length > 0 ? (
          <Button
            className="text-[10px] hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onClearHistory}
            size="sm"
            variant="outline"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Clear
          </Button>
        ) : null}
      </div>

      {/* Content */}
      {history.length === 0 ? (
        <div className="px-4 py-10 text-center sm:px-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-foreground bg-secondary">
            <Shield className="h-5 w-5 opacity-30" />
          </div>
          <p className="mb-1 font-bold text-[10px] uppercase tracking-wider">
            No history yet
          </p>
          <p className="text-[10px] text-muted-foreground">
            Generated passwords will appear here
          </p>
        </div>
      ) : (
        <ScrollArea className="h-72 sm:h-80">
          <div className="divide-y divide-foreground/10">
            {history.map((entry) => (
              <div
                className="group flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-secondary/50 sm:px-5"
                key={entry.id}
              >
                {/* Top row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <div className="border border-foreground/30 p-1">
                      {getTypeIcon(entry.type)}
                    </div>
                    <Badge className="text-[9px]" variant="outline">
                      {entry.type.toString().charAt(0).toUpperCase() + entry.type.slice(1)}
                    </Badge>
                    <span
                      className={`font-bold text-[9px] uppercase ${getStrengthTextColor(entry.strength.label)}`}
                    >
                      {entry.strength.label}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      className="h-6 w-6 p-0"
                      onClick={() => togglePasswordVisibility(entry.id)}
                      size="sm"
                      title={showPasswords[entry.id] ? "Hide" : "Show"}
                      variant="ghost"
                    >
                      {showPasswords[entry.id] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      className="h-6 w-6 p-0"
                      onClick={() => onCopyToClipboard(entry.password)}
                      size="sm"
                      title="Copy"
                      variant="ghost"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteHistoryEntry(entry.id)}
                      size="sm"
                      title="Delete"
                      variant="ghost"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {/* Password */}
                <Input
                  className="bg-background font-mono text-[11px]"
                  readOnly
                  value={
                    showPasswords[entry.id]
                      ? entry.password
                      : "\u2022".repeat(Math.min(entry.password.length, 20))
                  }
                />
                {/* Timestamp */}
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
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
      )}
    </div>
  );
}
