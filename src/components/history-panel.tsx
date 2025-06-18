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
import type { PasswordHistory } from '../types';

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
    {},
  );

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
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
            <History className="h-4 w-4 text-primary" />
          </div>
          Password History
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          Your recently generated passwords and passphrases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {history.length === 0 ? (
          <div className="text-center py-10 px-6 text-muted-foreground">
            <div className="p-4 rounded-full bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-7 w-7 opacity-50" />
            </div>
            <p className="text-base font-medium mb-2">
              No passwords generated yet
            </p>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">
              Your generation history will appear here for easy access
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <Badge
                variant="secondary"
                className="px-2.5 py-1 text-xs font-medium"
              >
                {history.length} entries
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearHistory}
                className="text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clear All
              </Button>
            </div>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors group flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-md ${
                            entry.type === 'password'
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : entry.type === 'passphrase'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-purple-100 dark:bg-purple-900/30'
                          }`}
                        >
                          <div
                            className={`$\{entry.type === 'password' ? 'text-blue-600 dark:text-blue-400' : entry.type === 'passphrase' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}`}
                          >
                            {getTypeIcon(entry.type)}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${
                            entry.type === 'password'
                              ? 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800'
                              : entry.type === 'passphrase'
                                ? 'text-green-600 border-green-200 dark:text-green-400 dark:border-green-800'
                                : 'text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800'
                          }`}
                        >
                          {entry.type.toString().charAt(0).toUpperCase() +
                            entry.type.slice(1)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${getStrengthColor(entry.strength.label)}`}
                        >
                          {entry.strength.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePasswordVisibility(entry.id)}
                          className="h-8 w-8 p-0"
                          title={
                            showPasswords[entry.id]
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPasswords[entry.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopyToClipboard(entry.password)}
                          className="h-8 w-8 p-0"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteHistoryEntry(entry.id)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                          title="Delete entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      value={
                        showPasswords[entry.id]
                          ? entry.password
                          : '•'.repeat(Math.min(entry.password.length, 20))
                      }
                      readOnly
                      className="font-mono text-xs bg-muted/30"
                    />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
