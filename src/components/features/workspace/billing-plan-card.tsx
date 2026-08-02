'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionPlanDetail } from '@/types/domain/billing';
import { SubscriptionPlan } from '@/types/domain/workspace';
import { Check, Sparkles, X } from 'lucide-react';

interface BillingPlanCardProps {
  plan: SubscriptionPlanDetail;
  currentPlan?: SubscriptionPlan;
  onSelectPlan?: (plan: SubscriptionPlanDetail) => void;
  isBillingAnnual?: boolean;
}

export function BillingPlanCard({
  plan,
  currentPlan = 'FREE',
  onSelectPlan,
  isBillingAnnual = false,
}: BillingPlanCardProps) {
  const isCurrent = plan.id === currentPlan;
  const displayPrice = isBillingAnnual ? plan.annualPriceMonthly : plan.monthlyPrice;

  return (
    <Card
      className={`relative flex flex-col justify-between border transition-all duration-200 ${
        plan.isPopular
          ? 'border-primary shadow-md ring-1 ring-primary/30 bg-card'
          : 'border-border bg-card'
      }`}
    >
      {plan.badgeText && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground text-[11px] font-semibold gap-1 shadow-sm px-3">
            <Sparkles className="h-3 w-3" /> {plan.badgeText}
          </Badge>
        </div>
      )}

      <CardHeader className="pt-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
          {isCurrent && <Badge variant="success">Aktif Sekarang</Badge>}
        </div>
        <CardDescription className="text-xs min-h-[36px] mt-1 text-muted-foreground">
          {plan.description}
        </CardDescription>

        <div className="pt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">
              {displayPrice === 0
                ? 'Rp 0'
                : `Rp ${displayPrice.toLocaleString('id-ID')}`}
            </span>
            {displayPrice > 0 && (
              <span className="text-xs text-muted-foreground">/ bulan</span>
            )}
          </div>
          {isBillingAnnual && displayPrice > 0 && (
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">
              Hemat 17% dengan penagihan tahunan
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 py-2 flex-1">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Fitur Termasuk:
        </p>
        <ul className="space-y-2 text-xs">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2">
              {feat.included ? (
                <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <X className="h-4 w-4 shrink-0 text-muted-foreground/40 mt-0.5" />
              )}
              <span
                className={
                  feat.included
                    ? feat.highlight
                      ? 'font-semibold text-foreground'
                      : 'text-foreground'
                    : 'text-muted-foreground line-through opacity-70'
                }
              >
                {feat.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6 border-t border-border/50">
        <Button
          variant={isCurrent ? 'outline' : plan.isPopular ? 'default' : 'secondary'}
          className="w-full"
          disabled={isCurrent}
          onClick={() => onSelectPlan?.(plan)}
        >
          {isCurrent ? 'Paket Aktif Saat Ini' : `Pilih ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
