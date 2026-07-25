'use client';

import { Lock, Users } from 'lucide-react';

export interface ActiveUser {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string; // HEX or CSS color
  editingTaskId?: string | null;
  role: string;
}

interface PresenceAvatarsProps {
  users?: ActiveUser[];
  activeEditingUser?: ActiveUser | null;
  editingTaskName?: string | null;
}

const mockDefaultUsers: ActiveUser[] = [
  {
    id: 'usr-1',
    name: 'Ahmad Dahlan (PM)',
    color: '#D97706', // Construction Amber
    role: 'PROJECT_MANAGER',
  },
  {
    id: 'usr-2',
    name: 'Budi Santoso (Pengawas)',
    color: '#22C55E', // Green
    role: 'SUPERVISOR',
  },
  {
    id: 'usr-3',
    name: 'Siti Rahma (Quantity Surveyor)',
    color: '#3B82F6', // Blue
    role: 'MEMBER',
  },
];

export function PresenceAvatars({
  users = mockDefaultUsers,
  activeEditingUser,
  editingTaskName,
}: PresenceAvatarsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 px-4 bg-card rounded-lg border border-border text-xs">
      {/* Active Users Stack */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-primary" /> Tim Kolaborasi Aktif:
        </span>
        <div className="flex -space-x-2 overflow-hidden">
          {users.map((u) => {
            const initials = u.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            return (
              <div
                key={u.id}
                title={`${u.name} (${u.role}) — Sedang Aktif`}
                className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white shadow-xs transition-transform hover:z-10 hover:scale-110 cursor-pointer"
                style={{ border: `2px solid ${u.color}` }}
              >
                {initials}
                <span
                  className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background bg-emerald-500"
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Editing Lock Indicator Banner */}
      {activeEditingUser && editingTaskName ? (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-medium animate-pulse">
          <Lock className="h-3.5 w-3.5" />
          <span>
            <strong className="font-semibold">{activeEditingUser.name}</strong> sedang mengedit tugas:{' '}
            <em className="not-italic underline">{editingTaskName}</em>
          </span>
        </div>
      ) : (
        <span className="text-[11px] text-muted-foreground italic">
          Supabase Realtime WebSockets aktif & tersinkronisasi.
        </span>
      )}
    </div>
  );
}
