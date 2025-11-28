'use client';

import { UserStats } from './QuickActions';
import { RecentNotes } from './RecentNotes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Mic, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardContentProps {
  userId: string;
  userName: string;
}

export function DashboardContent({ userId, userName }: DashboardContentProps) {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome back, {userName.split(' ')[0]}.
          </h1>
          <p className="text-muted-foreground mt-1">Here's your learning progress.</p>
        </div>

        {/* Create New Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              Create New
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/notes/new')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <FileText className="h-4 w-4 mr-2" />
              Note
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/voice')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <Mic className="h-4 w-4 mr-2" />
              Voice Capture
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Stats Grid */}
      <UserStats userId={userId} />

      {/* Recent Content */}
      <RecentNotes userId={userId} />
    </div>
  );
}
