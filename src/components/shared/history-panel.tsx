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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PasswordHistory } from '../../types';

interface HistoryPanelProps {
  history: PasswordHistory[];
  onCopyToClipboard: (text: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryEntry: (id: string) => void; // New prop for deleting individual entries
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

  // Helper functions to avoid nested ternaries
  const getTypeBackgroundClass = (type: string): string => {
    if (type === 'password') {
      return 'bg-blue-100 dark:bg-blue-900/30';
    }
    if (type === 'passphrase') {
      return 'bg-green-100 dark:bg-green-900/30';
    }
    return 'bg-purple-100 dark:bg-purple-900/30';
  };

  const getTypeTextClass = (type: string): string => {
    if (type === 'password') {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (type === 'passphrase') {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-purple-600 dark:text-purple-400';
  };

  const getTypeBadgeClass = (type: string): string => {
    if (type === 'password') {
      return 'border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400';
    }
    if (type === 'passphrase') {
      return 'border-green-200 text-green-600 dark:border-green-800 dark:text-green-400';
    }
    return 'border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400';
  };

  const togglePasswordVisibility = (entryId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'password':
        return <Zap className="h-3 w-3" />;
      case 'passphrase':
        return <BookOpen className="h-3 w-3" />;
      case 'format':
        return <Settings className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'weak':
        return 'text-red-600 border-red-200 dark:text-red-400 dark:border-red-800';
      case 'fair':
        return 'text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800';
      case 'good':
        return 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800';
      case 'strong':
      case 'excellent':
        return 'text-green-600 border-green-200 dark:text-green-400 dark:border-green-800';
      default:
        return 'text-muted-foreground border-border';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="rounded-lg border border-primary/10 bg-gradient-to-br from-primary/10 to-primary/5 p-2">
            <History className="h-4 w-4 text-primary" />
          </div>
          Password History
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm leading-relaxed">
          Your recently generated passwords and passphrases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {history.length === 0 ? (
          <div className="px-6 py-10 text-center text-muted-foreground">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30 p-4">
              <Shield className="h-7 w-7 opacity-50" />
            </div>
            <p className="mb-2 font-medium text-base">
              No passwords generated yet
            </p>
            <p className="text-muted-foreground/80 text-sm leading-relaxed">
              Your generation history will appear here for easy access
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between">
              <Badge
                className="px-2.5 py-1 font-medium text-xs"
                variant="secondary"
              >
                {history.length} entries
              </Badge>
              <Button
                className="text-xs hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                onClick={onClearHistory}
                size="sm"
                variant="outline"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Clear All
              </Button>
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    className="group flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                    key={entry.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-md p-1.5 ${getTypeBackgroundClass(entry.type)}`}
                        >
                          <div className={getTypeTextClass(entry.type)}>
                            {getTypeIcon(entry.type)}
                          </div>
                        </div>
                        <Badge
                          className={`font-medium text-xs ${getTypeBadgeClass(entry.type)}`}
                          variant="outline"
                        >
                          {entry.type.toString().charAt(0).toUpperCase() +
                            entry.type.slice(1)}
                        </Badge>
                        <Badge
                          className={`font-medium text-xs ${getStrengthColor(entry.strength.label)}`}
                          variant="outline"
                        >
                          {entry.strength.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          className="h-8 w-8 p-0"
                          onClick={() => togglePasswordVisibility(entry.id)}
                          size="sm"
                          title={
                            showPasswords[entry.id]
                              ? 'Hide password'
                              : 'Show password'
                          }
                          variant="outline"
                        >
                          {showPasswords[entry.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          className="h-8 w-8 p-0"
                          onClick={() => onCopyToClipboard(entry.password)}
                          size="sm"
                          title="Copy to clipboard"
                          variant="outline"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          className="h-8 w-8 p-0 text-destructive hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => onDeleteHistoryEntry(entry.id)}
                          size="sm"
                          title="Delete entry"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      className="bg-muted/30 font-mono text-xs"
                      readOnly
                      value={
                        showPasswords[entry.id]
                          ? entry.password
                          : '•'.repeat(Math.min(entry.password.length, 20))
                      }
                    />
                    <div className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="h-3 w-3" />
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(entry.createdAt)}
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
