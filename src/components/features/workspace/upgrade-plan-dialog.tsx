'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { billingService } from '@/services/billing.service';
import { SubscriptionPlanDetail } from '@/types/domain/billing';
import { SubscriptionPlan } from '@/types/domain/workspace';
import { CreditCard, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface UpgradePlanDialogProps {
  plan: SubscriptionPlanDetail | null;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UpgradePlanDialog({
  plan,
  workspaceId,
  open,
  onOpenChange,
  onSuccess,
}: UpgradePlanDialogProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('annually');
  const [paidSeats, setPaidSeats] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!plan) return null;

  const basePrice = billingInterval === 'annually' ? plan.annualPriceMonthly : plan.monthlyPrice;
  const seatsPrice = paidSeats * plan.pricePerPaidSeat;
  const totalMonthlyCost = basePrice + seatsPrice;
  const totalChargeNow = billingInterval === 'annually' ? totalMonthlyCost * 12 : totalMonthlyCost;

  const handleCheckout = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await billingService.checkoutPlanUpgrade(workspaceId, {
        plan: plan.id as SubscriptionPlan,
        additionalPaidSeats: paidSeats,
        billingInterval,
      });

      if (res.success) {
        setMessage('Pembayaran berhasil diproses via Midtrans Snap! Paket Anda telah diperbarui.');
        setTimeout(() => {
          onOpenChange(false);
          onSuccess?.();
        }, 1500);
      }
    } catch {
      setMessage('Terjadi kesalahan saat memproses checkout. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Upgrade ke {plan.name}
          </DialogTitle>
          <DialogDescription>
            Tingkatkan kapasitas ruang kerja Anda untuk kolaborasi proyek tanpa batas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {message && (
            <Alert variant="default" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Billing Interval Toggle */}
          <div className="flex rounded-lg border border-border p-1 bg-muted/50">
            <button
              className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                billingInterval === 'annually'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setBillingInterval('annually')}
            >
              Tahunan (Hemat 17%)
            </button>
            <button
              className={`flex-1 py-1.5 rounded-md font-medium transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setBillingInterval('monthly')}
            >
              Bulanan
            </button>
          </div>

          {/* Paid Seats Selector */}
          <div className="space-y-1.5 rounded-lg border border-border bg-card p-3">
            <Label className="text-xs font-semibold">Jumlah Paid Seats Tambahan</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                max={100}
                value={paidSeats}
                onChange={(e) => setPaidSeats(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 text-center font-bold text-sm"
              />
              <span className="text-muted-foreground">
                × Rp {plan.pricePerPaidSeat.toLocaleString('id-ID')} / kursi / bulan
              </span>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-lg bg-muted/40 p-3 space-y-2 border border-border/80">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biaya Dasar Paket ({plan.name}):</span>
              <span className="font-semibold text-foreground">
                Rp {basePrice.toLocaleString('id-ID')} / bln
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tambahan {paidSeats} Paid Seats:</span>
              <span className="font-semibold text-foreground">
                Rp {seatsPrice.toLocaleString('id-ID')} / bln
              </span>
            </div>

            <div className="border-t border-border pt-2 flex justify-between items-baseline">
              <span className="font-bold text-foreground">Total Ditagihkan Sekarang:</span>
              <span className="text-lg font-extrabold text-primary">
                Rp {totalChargeNow.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleCheckout} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {isSubmitting ? 'Memproses...' : 'Bayar via Midtrans'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
