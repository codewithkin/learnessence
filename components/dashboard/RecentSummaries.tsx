'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Summary {
  id: string;
  content: string;
  style: 'FLASH' | 'KEYS' | 'DETAILED' | 'TEACHER' | 'EXAM';
  createdAt: Date;
}

interface RecentSummariesProps {
  userId: string;
}

export function RecentSummaries({ userId }: RecentSummariesProps) {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummaries() {
      try {
        const res = await fetch(`/api/summaries?userId=${userId}&limit=4`);
        if (res.ok) {
          const data = await res.json();
          setSummaries(data);
        }
      } catch (error) {
        console.error('Failed to fetch summaries:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummaries();
  }, [userId]);

  const getStyleBadgeColor = (style: Summary['style']) => {
    switch (style) {
      case 'FLASH':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'KEYS':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'DETAILED':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'TEACHER':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'EXAM':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  const getPreview = (content: string) => {
    return content.slice(0, 100) + (content.length > 100 ? '...' : '');
  };

  if (loading) {
    return (
      <Card className="p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Latest Summaries</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-2xl shadow-sm border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        Latest Summaries
      </h2>

      {summaries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No summaries yet. Generate your first summary.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary, index) => (
            <div
              key={summary.id}
              className={`pb-4 ${index !== summaries.length - 1 ? 'border-b border-border' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={`text-xs ${getStyleBadgeColor(summary.style)}`}
                >
                  {summary.style}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{getPreview(summary.content)}</p>
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Open Summary
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
