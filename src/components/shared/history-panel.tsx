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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/95">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <History className="h-5 w-5 text-primary" />
          </div>
          Password History
        </CardTitle>
        <CardDescription className="text-base leading-relaxed text-muted-foreground">
          Your recently generated passwords and passphrases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {history.length === 0 ? (
          <div className="text-center py-16 px-6 text-muted-foreground">
            <div className="p-6 rounded-full bg-muted/40 w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-muted-foreground/20 shadow-sm">
              <Shield className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-xl font-medium mb-3">
              No passwords generated yet
            </p>
            <p className="text-base text-muted-foreground/80 leading-relaxed">
              Your generation history will appear here for easy access
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <Badge
                variant="secondary"
                className="px-3 py-2 text-sm font-medium"
              >
                {history.length} entr{history.length !== 1 ? 'ies' : 'y'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearHistory}
                className="text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5 rounded-xl border border-border/60 bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/40 transition-all duration-200 group flex flex-col gap-4 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl ${
                            entry.type === 'password'
                              ? 'bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800'
                              : entry.type === 'passphrase'
                                ? 'bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800'
                                : 'bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          <div
                            className={`${entry.type === 'password' ? 'text-blue-600 dark:text-blue-400' : entry.type === 'passphrase' ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}`}
                          >
                            {getTypeIcon(entry.type)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium w-fit ${
                              entry.type === 'password'
                                ? 'text-blue-600 border-blue-200 bg-blue-50/50 dark:text-blue-400 dark:border-blue-800 dark:bg-blue-900/20'
                                : entry.type === 'passphrase'
                                  ? 'text-green-600 border-green-200 bg-green-50/50 dark:text-green-400 dark:border-green-800 dark:bg-green-900/20'
                                  : 'text-purple-600 border-purple-200 bg-purple-50/50 dark:text-purple-400 dark:border-purple-800 dark:bg-purple-900/20'
                            }`}
                          >
                            {entry.type.toString().charAt(0).toUpperCase() +
                              entry.type.slice(1)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium w-fit ${getStrengthColor(entry.strength.label)}`}
                          >
                            {entry.strength.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePasswordVisibility(entry.id)}
                          className="h-9 w-9 p-0"
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
                          variant="default"
                          size="sm"
                          onClick={() => onCopyToClipboard(entry.password)}
                          className="h-9 w-9 p-0 shadow-sm hover:shadow-md transition-all duration-200"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteHistoryEntry(entry.id)}
                          className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
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
                      className="font-mono text-sm bg-background/60"
                    />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border/40">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(entry.createdAt)}
                      </span>
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
