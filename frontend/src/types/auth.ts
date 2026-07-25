export type UserRole = 'OWNER' | 'ADMIN' | 'PROJECT_MANAGER' | 'SUPERVISOR' | 'WORKER';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  authProvider: 'email' | 'google' | 'microsoft';
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: UserProfile;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignUpCredentials {
  fullName: string;
  email: string;
  password?: string;
  inviteToken?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MagicLinkPayload {
  email: string;
}

export interface InviteTokenInfo {
  token: string;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  role: UserRole;
  email: string;
  expiresAt: string;
  isExpired: boolean;
}

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score: PasswordStrengthScore;
  label: 'Sangat Lemah' | 'Lemah' | 'Fair' | 'Kuat';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface AuthApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  isUnverifiedEmail?: boolean;
  isDowntime?: boolean;
}
