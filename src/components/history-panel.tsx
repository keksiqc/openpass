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
import type { PasswordHistory } from '../types';

interface HistoryPanelProps {
  history: PasswordHistory[];
  onCopyToClipboard: (text: string) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({
  history,
  onCopyToClipboard,
  onClearHistory,
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
    <Card className="border overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <History className="h-4 w-4 text-primary" />
              </div>
              Password History
              {history.length > 0 && (
                <Badge variant="secondary" className="px-2 py-1">
                  {history.length}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Your recently generated passwords and passphrases
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
              className="text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {history.length === 0 ? (
          <div className="text-center py-12 px-6 text-muted-foreground">
            <div className="p-4 rounded-full bg-muted/30 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm font-medium mb-2">
              No passwords generated yet
            </p>
            <p className="text-xs text-muted-foreground/80">
              Your generation history will appear here for easy access
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className="p-4 border-b border-border/50 hover:bg-muted/20 transition-colors group"
              >
                <div className="space-y-3">
                  {/* Header with badges and timestamp */}
                  <div className="flex items-center justify-between">
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
                          className={`${
                            entry.type === 'password'
                              ? 'text-blue-600 dark:text-blue-400'
                              : entry.type === 'passphrase'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-purple-600 dark:text-purple-400'
                          }`}
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
                        {entry.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${getStrengthColor(entry.strength.label)}`}
                      >
                        {entry.strength.label}
                      </Badge>
                      {index === 0 && (
                        <Badge
                          variant="default"
                          className="text-xs font-medium"
                        >
                          Latest
                        </Badge>
                      )}
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
                    </div>
                  </div>

                  {/* Password display */}
                  <Input
                    value={
                      showPasswords[entry.id]
                        ? entry.password
                        : '•'.repeat(Math.min(entry.password.length, 20))
                    }
                    readOnly
                    className="font-mono text-xs bg-muted/30"
                  />

                  {/* Timestamp */}
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
