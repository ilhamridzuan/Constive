import { SubscriptionPlan, WorkspaceRole } from './workspace';

export interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface SubscriptionPlanDetail {
  id: SubscriptionPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPriceMonthly: number;
  maxFreeSeats: number;
  pricePerPaidSeat: number;
  features: PlanFeature[];
  badgeText?: string;
  isPopular?: boolean;
}

export interface SeatQuotaUsage {
  totalActiveMembers: number;
  maxFreeSeats: number;
  usedFreeSeats: number;
  usedPaidSeats: number;
  roleBreakdown: Record<WorkspaceRole, number>;
  canInviteMoreFree: boolean;
  canInviteMorePaid: boolean;
}

export interface SubscriptionDetails {
  workspaceId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paidSeatsCount: number;
  quota: SeatQuotaUsage;
}

export interface UpgradePlanInput {
  plan: SubscriptionPlan;
  additionalPaidSeats: number;
  billingInterval: 'monthly' | 'annually';
}
