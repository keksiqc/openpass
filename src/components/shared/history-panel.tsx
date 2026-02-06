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

type HistoryPanelProps = {
  history: PasswordHistory[];
  onCopyToClipboard: (text: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryEntry: (id: string) => void;
};

export function HistoryPanel({
  history,
  onCopyToClipboard,
  onClearHistory,
  onDeleteHistoryEntry,
}: HistoryPanelProps) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const getTypeBadgeClass = (type: string): string => {
    if (type === 'password') {
      return 'border-foreground text-foreground';
    }
    if (type === 'passphrase') {
      return 'border-foreground text-foreground';
    }
    return 'border-foreground text-foreground';
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
        return 'border-destructive text-destructive';
      case 'fair':
        return 'border-foreground text-muted-foreground';
      case 'good':
        return 'border-foreground text-foreground';
      case 'strong':
      case 'excellent':
        return 'border-accent text-accent-foreground bg-accent';
      default:
        return 'border-foreground text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="border-2 border-foreground bg-accent p-1.5">
            <History className="h-4 w-4 text-accent-foreground" />
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center border-2 border-foreground bg-secondary p-4">
              <Shield className="h-7 w-7 opacity-50" />
            </div>
            <p className="mb-2 font-bold text-sm uppercase tracking-wider">
              No passwords generated yet
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your generation history will appear here for easy access
            </p>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="secondary">{history.length} entries</Badge>
              <Button
                className="text-xs hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
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
                    className="group flex flex-col gap-3 border-2 border-foreground p-4 transition-colors hover:bg-secondary"
                    key={entry.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="border-2 border-foreground p-1.5">
                          {getTypeIcon(entry.type)}
                        </div>
                        <Badge
                          className={`text-xs ${getTypeBadgeClass(entry.type)}`}
                          variant="outline"
                        >
                          {entry.type.toString().charAt(0).toUpperCase() +
                            entry.type.slice(1)}
                        </Badge>
                        <Badge
                          className={`text-xs ${getStrengthColor(entry.strength.label)}`}
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
                          className="h-8 w-8 p-0 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
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
                      className="bg-secondary font-mono text-xs"
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
