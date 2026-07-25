import {
  SeatQuotaUsage,
  SubscriptionDetails,
  SubscriptionPlanDetail,
  UpgradePlanInput,
} from '@/types/domain/billing';
import { SubscriptionPlan, WorkspaceRole } from '@/types/domain/workspace';

export const SUBSCRIPTION_PLANS: SubscriptionPlanDetail[] = [
  {
    id: 'FREE',
    name: 'Free Starter',
    description: 'Untuk tim proyek kecil & uji coba awal platform tanpa risiko biaya.',
    monthlyPrice: 0,
    annualPriceMonthly: 0,
    maxFreeSeats: 10,
    pricePerPaidSeat: 0,
    features: [
      { text: 'Hingga 10 Pengguna Aktif (Grats)', included: true },
      { text: 'Akses penuh Gantt Chart & Daily Log', included: true },
      { text: 'Upload foto bukti progres (Max 5MB/foto)', included: true },
      { text: '1 Active Project', included: true },
      { text: 'Multi-Workspace Switcher', included: true },
      { text: 'Dukungan Prioritas Enterprise', included: false },
    ],
  },
  {
    id: 'STANDARD',
    name: 'Standard Pro',
    description: 'Solusi ideal untuk kontraktor menengah dengan banyak proyek berjalan.',
    monthlyPrice: 299000,
    annualPriceMonthly: 249000,
    maxFreeSeats: 10,
    pricePerPaidSeat: 49000,
    badgeText: 'Paling Populer',
    isPopular: true,
    features: [
      { text: '10 Pengguna Gratis + Hybrid Paid Seats', included: true, highlight: true },
      { text: 'Unlimited Projects & Gantt Charts', included: true },
      { text: 'Real-time Multi-User Gantt Editing', included: true },
      { text: 'Verifikasi & Revisi Laporan Harian PM', included: true },
      { text: 'Export Laporan PDF & Audit Logs', included: true },
      { text: 'Dukungan Prioritas Enterprise', included: false },
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Custom',
    description: 'Untuk korporasi besar dengan kebutuhan keamanan, SLA, dan integrasi khusus.',
    monthlyPrice: 999000,
    annualPriceMonthly: 849000,
    maxFreeSeats: 50,
    pricePerPaidSeat: 39000,
    features: [
      { text: 'Hingga 50 Free Seats + Diskon Volume Paid Seats', included: true },
      { text: 'Dedicated Account Manager & 99.9% SLA', included: true },
      { text: 'SSO (Google Workspace & Microsoft Entra ID)', included: true },
      { text: 'Custom Audit Logs & Security Retention', included: true },
      { text: 'Integrasi ERP / Accounting API', included: true },
      { text: 'Dukungan Prioritas 24/7 Phone & WhatsApp', included: true, highlight: true },
    ],
  },
];

export const billingService = {
  async getSubscriptionDetails(workspaceId: string): Promise<SubscriptionDetails> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/subscription`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }

    const quota: SeatQuotaUsage = {
      totalActiveMembers: 8,
      maxFreeSeats: 10,
      usedFreeSeats: 8,
      usedPaidSeats: 0,
      roleBreakdown: {
        OWNER: 1,
        ADMIN: 1,
        PROJECT_MANAGER: 2,
        SUPERVISOR: 4,
      },
      canInviteMoreFree: true,
      canInviteMorePaid: true,
    };

    return {
      workspaceId,
      plan: 'FREE',
      status: 'ACTIVE',
      currentPeriodEnd: '2026-12-31T23:59:59Z',
      cancelAtPeriodEnd: false,
      paidSeatsCount: 0,
      quota,
    };
  },

  async calculateQuotaUsage(
    membersCount: number,
    roleBreakdown: Record<WorkspaceRole, number>,
    plan: SubscriptionPlan = 'FREE'
  ): Promise<SeatQuotaUsage> {
    const planDetail = SUBSCRIPTION_PLANS.find((p) => p.id === plan) || SUBSCRIPTION_PLANS[0];
    const maxFree = planDetail.maxFreeSeats;

    const usedFree = Math.min(membersCount, maxFree);
    const usedPaid = Math.max(0, membersCount - maxFree);

    return {
      totalActiveMembers: membersCount,
      maxFreeSeats: maxFree,
      usedFreeSeats: usedFree,
      usedPaidSeats: usedPaid,
      roleBreakdown,
      canInviteMoreFree: membersCount < maxFree,
      canInviteMorePaid: plan !== 'FREE' || membersCount < maxFree,
    };
  },

  async checkoutPlanUpgrade(
    workspaceId: string,
    input: UpgradePlanInput
  ): Promise<{ redirectUrl?: string; success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/v1/workspaces/${workspaceId}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // API fallback
    }

    return {
      success: true,
      message: 'Simulasi upgrade berhasil! Snap Midtrans siap diproses.',
    };
  },
};
