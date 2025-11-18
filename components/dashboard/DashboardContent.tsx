'use client';

import { QuickActions } from './QuickActions';
import { RecentNotes } from './RecentNotes';
import { RecentSummaries } from './RecentSummaries';
import { RecentFlashcardSets } from './RecentFlashcardSets';

interface DashboardContentProps {
  userId: string;
  userName: string;
}

export function DashboardContent({ userId, userName }: DashboardContentProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">
          Welcome back, {userName.split(' ')[0]}.
        </h1>
        <p className="text-muted-foreground mt-1">Let's find what matters most today.</p>
      </div>

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* Recent Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentNotes userId={userId} />
        <RecentSummaries userId={userId} />
      </div>

      {/* Recent Flashcard Sets */}
      <RecentFlashcardSets userId={userId} />
    </div>
  );
}
