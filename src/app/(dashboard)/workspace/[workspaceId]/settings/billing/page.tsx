'use client';

import { BillingPlanCard } from '@/components/features/workspace/billing-plan-card';
import { BillingUsageMeter } from '@/components/features/workspace/billing-usage-meter';
import { UpgradePlanDialog } from '@/components/features/workspace/upgrade-plan-dialog';
import { SUBSCRIPTION_PLANS } from '@/services/billing.service';
import { useWorkspaceStore } from '@/store/use-workspace-store';
import { SubscriptionPlanDetail } from '@/types/domain/billing';
import { CreditCard, Settings, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function WorkspaceBillingPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const pathname = usePathname();
  const {
    activeWorkspace,
    setActiveWorkspace,
    workspaces,
    fetchWorkspaces,
    subscription,
    quota,
    fetchSubscription,
  } = useWorkspaceStore();

  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] =
    useState<SubscriptionPlanDetail | null>(null);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const found = workspaces.find((w) => w.id === workspaceId);
      if (found) {
        setActiveWorkspace(found);
        fetchSubscription(workspaceId);
      }
    }
  }, [workspaceId, workspaces, setActiveWorkspace, fetchSubscription]);

  const currentPlanId = subscription?.plan || activeWorkspace?.subscriptionPlan || 'FREE';

  const handleSelectPlan = (plan: SubscriptionPlanDetail) => {
    setSelectedPlanForUpgrade(plan);
    setUpgradeDialogOpen(true);
  };

  const tabs = [
    { name: 'Pengaturan Umum', href: `/workspace/${workspaceId}/settings`, icon: Settings },
    { name: 'Anggota Tim', href: `/workspace/${workspaceId}/settings/members`, icon: Users },
    { name: 'Billing & Paket', href: `/workspace/${workspaceId}/settings/billing`, icon: CreditCard },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" /> Billing & Langganan Workspace
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Kelola paket langganan, kuota pengguna (Hybrid Seats), dan riwayat penagihan.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border text-xs font-medium gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 pb-3 border-b-2 font-medium transition-colors ${
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.name}
            </Link>
          );
        })}
      </div>

      {/* Seat Usage Meter Component */}
      {quota && (
        <BillingUsageMeter
          quota={quota}
          planName={
            SUBSCRIPTION_PLANS.find((p) => p.id === currentPlanId)?.name || 'Free Starter'
          }
        />
      )}

      {/* Annual / Monthly Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Pilih Paket Langganan Workspace
          </h3>
          <p className="text-xs text-muted-foreground">
            Dapatkan fleksibilitas tambahan untuk tim proyek Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1 text-xs">
          <button
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              !isAnnual ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
            }`}
            onClick={() => setIsAnnual(false)}
          >
            Bulanan
          </button>
          <button
            className={`rounded-full px-3 py-1 font-medium transition-all ${
              isAnnual ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
            }`}
            onClick={() => setIsAnnual(true)}
          >
            Tahunan (Hemat 17%)
          </button>
        </div>
      </div>

      {/* Subscription Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <BillingPlanCard
            key={plan.id}
            plan={plan}
            currentPlan={currentPlanId}
            onSelectPlan={handleSelectPlan}
            isBillingAnnual={isAnnual}
          />
        ))}
      </div>

      <UpgradePlanDialog
        plan={selectedPlanForUpgrade}
        workspaceId={workspaceId}
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        onSuccess={() => fetchSubscription(workspaceId)}
      />
    </div>
  );
}
