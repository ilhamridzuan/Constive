'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeatQuotaUsage } from '@/types/domain/billing';
import { Shield, ShieldCheck, UserCheck, Users } from 'lucide-react';

interface BillingUsageMeterProps {
  quota: SeatQuotaUsage;
  planName?: string;
}

export function BillingUsageMeter({ quota, planName = 'Free Starter' }: BillingUsageMeterProps) {
  const { totalActiveMembers, maxFreeSeats, usedFreeSeats, usedPaidSeats, roleBreakdown } = quota;
  const percentUsed = Math.min(100, Math.round((usedFreeSeats / maxFreeSeats) * 100));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Penggunaan Kuota Pengguna (Hybrid Seats)
          </CardTitle>
          <Badge variant="outline">{planName}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-foreground">
              {totalActiveMembers} Pengguna Aktif di Workspace
            </span>
            <span className="text-muted-foreground">
              {usedFreeSeats} / {maxFreeSeats} Free Seats Terpakai ({percentUsed}%)
            </span>
          </div>

          <div className="h-3.5 w-full rounded-full bg-muted overflow-hidden flex">
            {/* Free seats portion */}
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentUsed}%` }}
            />
            {/* Paid seats portion if any */}
            {usedPaidSeats > 0 && (
              <div
                className="h-full bg-amber-600 transition-all duration-500"
                style={{ width: `${Math.min(100, (usedPaidSeats / maxFreeSeats) * 100)}%` }}
              />
            )}
          </div>
        </div>

        {/* Status indicator badges */}
        <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Free Seats
            </p>
            <p className="text-base font-bold text-foreground mt-0.5">
              {usedFreeSeats} <span className="text-xs font-normal text-muted-foreground">/ {maxFreeSeats}</span>
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-amber-500" /> Paid Seats
            </p>
            <p className="text-base font-bold text-foreground mt-0.5">
              {usedPaidSeats} <span className="text-xs font-normal text-muted-foreground">kursi</span>
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-blue-500" /> Admin & PM
            </p>
            <p className="text-base font-bold text-foreground mt-0.5">
              {(roleBreakdown.ADMIN || 0) + (roleBreakdown.PROJECT_MANAGER || 0) + (roleBreakdown.OWNER || 0)}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-2.5">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-muted-foreground" /> Pengawas Lapangan
            </p>
            <p className="text-base font-bold text-foreground mt-0.5">
              {roleBreakdown.SUPERVISOR || 0}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-md border border-border/50">
          💡 <span className="font-semibold text-foreground">Model Hybrid Seats PLG:</span> Setiap workspace mendapatkan hingga 10 pengguna gratis. Akses mandor & pengawas tidak membatasi kuota berbayar selama batas free seats belum terlampaui.
        </p>
      </CardContent>
    </Card>
  );
}
