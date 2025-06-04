
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Copy, History, Shield, Trash2 } from 'lucide-react';
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
  const getStrengthColor = (label: string) => {
    switch (label) {
      case 'Weak':
        return 'text-red-600';
      case 'Fair':
        return 'text-yellow-600';
      case 'Good':
        return 'text-blue-600';
      case 'Strong':
        return 'text-green-600';
      case 'Excellent':
        return 'text-green-700';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Password History
            </CardTitle>
            <CardDescription>
              Your recently generated passwords
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearHistory}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No passwords generated yet</p>
            <p className="text-sm">Your password history will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {entry.type}
                    </Badge>
                    <span
                      className={`text-xs font-medium ${getStrengthColor(
                        entry.strength.label,
                      )}`}
                    >
                      {entry.strength.label}
                    </span>
                  </div>
                  <div className="font-mono text-sm text-muted-foreground truncate">
                    {entry.password.length > 30
                      ? `${entry.password.substring(0, 30)}...`
                      : entry.password}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.createdAt.toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyToClipboard(entry.password)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
