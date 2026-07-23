'use client';

import { WorkspaceSwitcher } from '@/components/features/workspace/workspace-switcher';
import { Button } from '@/components/ui/button';
import { Bell, HardHat, LogOut, Menu, Search, User } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border bg-card px-4">
      {/* Left Section: Logo & Workspace Switcher */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 text-muted-foreground"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/workspace" className="flex items-center gap-2 font-bold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <HardHat className="h-5 w-5" />
          </div>
          <span className="hidden font-extrabold tracking-tight md:inline-block text-base">
            Constive
          </span>
        </Link>

        <div className="h-5 w-[1px] bg-border mx-1 hidden sm:block" />

        <WorkspaceSwitcher />
      </div>

      {/* Right Section: Actions & User Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Cari (Ctrl+K)">
          <Search className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" title="Notifikasi">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>
        </div>

        <div className="flex items-center gap-2 border-l border-border pl-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold text-xs text-foreground">
            <User className="h-4 w-4" />
          </div>
          <Link href="/login" title="Keluar">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
