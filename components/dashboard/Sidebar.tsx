'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, FileText, Sparkles, Layers, Mic, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb } from 'lucide-react';

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    image?: string | null;
  } | null;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/notes', label: 'Notes', icon: FileText },
  { href: '/dashboard/summaries', label: 'Summaries', icon: Sparkles },
  { href: '/dashboard/flashcards', label: 'Flashcards', icon: Layers },
  { href: '/dashboard/voice', label: 'Voice Input', icon: Mic },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#1E293B] border-r border-border flex flex-col h-screen">
      {/* Logo Header */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-xl text-indigo-600">LearnEssence</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 rounded-xl transition-colors duration-150 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300'
                    : 'text-muted-foreground hover:bg-blue-400 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-border">
        {user ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-muted-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">
                  LE
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">Guest</p>
                <p className="text-xs text-muted-foreground">Preview only</p>
              </div>
            </div>
            <Link href="/auth">
              <Button variant="outline" size="sm" className="w-full">
                Sign in to edit
              </Button>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
