import {
  AuthApiResponse,
  AuthSession,
  ForgotPasswordPayload,
  InviteTokenInfo,
  LoginCredentials,
  MagicLinkPayload,
  ResetPasswordPayload,
  SignUpCredentials,
} from "@/types/auth"

const INVITE_STORAGE_KEY = "constive_invite_token"

export const authService = {
  // Store invite token in sessionStorage for invite gate persistence
  setStoredInviteToken(token: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(INVITE_STORAGE_KEY, token)
    }
  },

  getStoredInviteToken(): string | null {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(INVITE_STORAGE_KEY)
    }
    return null
  },

  clearStoredInviteToken() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(INVITE_STORAGE_KEY)
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthApiResponse<AuthSession>> {
    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (response.status === 403 && data?.isUnverifiedEmail) {
          return {
            success: false,
            message: "Email Anda belum diverifikasi. Silakan periksa kotak masuk email Anda.",
            isUnverifiedEmail: true,
          }
        }
        return {
          success: false,
          message: data?.message || "Email atau password salah. Silakan coba lagi.",
        }
      }

      return { success: true, data }
    } catch {
      // Fallback response if server or downtime occurs
      return {
        success: false,
        message: "Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        isDowntime: true,
      }
    }
  },

  async register(
    credentials: SignUpCredentials
  ): Promise<AuthApiResponse<{ verificationSent: boolean }>> {
    try {
      const storedInvite = this.getStoredInviteToken()
      const payload = {
        ...credentials,
        inviteToken: credentials.inviteToken || storedInvite || undefined,
      }

      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (response.status === 409) {
          // Generic enumeration safety message per PRD rules
          return {
            success: true,
            message: "Jika email ini terdaftar, Anda akan menerima instruksi selanjutnya.",
            data: { verificationSent: true },
          }
        }
        return {
          success: false,
          message: data?.message || "Gagal memproses pendaftaran. Silakan periksa kembali formulir Anda.",
        }
      }

      return {
        success: true,
        message: "Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi akun.",
        data: { verificationSent: true },
      }
    } catch {
      return {
        success: false,
        message: "Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        isDowntime: true,
      }
    }
  },

  async requestPasswordReset(
    payload: ForgotPasswordPayload
  ): Promise<AuthApiResponse<void>> {
    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        // Safe generic message per PRD security rule
        return {
          success: true,
          message: "Jika email terdaftar, instruksi reset password telah dikirim.",
        }
      }

      return {
        success: true,
        message: "Jika email terdaftar, instruksi reset password telah dikirim.",
      }
    } catch {
      return {
        success: false,
        message: "Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        isDowntime: true,
      }
    }
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<AuthApiResponse<void>> {
    try {
      const response = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        if (response.status === 400 || data?.errorCode === "TOKEN_EXPIRED") {
          return {
            success: false,
            message: "Tautan reset password telah kedaluwarsa. Silakan minta tautan baru.",
            errorCode: "TOKEN_EXPIRED",
          }
        }
        return {
          success: false,
          message: data?.message || "Gagal mengosongkan kata sandi.",
        }
      }

      return {
        success: true,
        message: "Password berhasil diperbarui. Silakan login kembali.",
      }
    } catch {
      return {
        success: false,
        message: "Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        isDowntime: true,
      }
    }
  },

  async requestMagicLink(payload: MagicLinkPayload): Promise<AuthApiResponse<void>> {
    try {
      const response = await fetch("/api/v1/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        return {
          success: true,
          message: "Jika email terdaftar, Magic Link telah dikirim ke email Anda.",
        }
      }

      return {
        success: true,
        message: "Magic Link telah dikirim ke email Anda.",
      }
    } catch {
      return {
        success: false,
        message: "Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        isDowntime: true,
      }
    }
  },

  async resendVerificationEmail(email: string): Promise<AuthApiResponse<void>> {
    try {
      const response = await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        return {
          success: false,
          message: "Gagal mengirim ulang email verifikasi. Silakan coba beberapa saat lagi.",
        }
      }

      return {
        success: true,
        message: "Email verifikasi baru berhasil dikirim.",
      }
    } catch {
      return {
        success: false,
        message: "Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.",
        isDowntime: true,
      }
    }
  },

  async getInviteInfo(token: string): Promise<AuthApiResponse<InviteTokenInfo>> {
    try {
      const response = await fetch(`/api/v1/workspaces/invitations/${token}`)
      const data = await response.json().catch(() => null)

      if (!response.ok || !data) {
        return {
          success: false,
          message: "Tautan undangan tidak berlaku atau telah kedaluwarsa.",
        }
      }

      return { success: true, data }
    } catch {
      return {
        success: false,
        message: "Gagal memverifikasi token undangan.",
      }
    }
  },

  loginWithOAuth(provider: "google" | "microsoft") {
    const inviteToken = this.getStoredInviteToken()
    const redirectUrl = new URL(
      `/api/v1/auth/oauth/${provider}`,
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    )
    if (inviteToken) {
      redirectUrl.searchParams.set("invite_token", inviteToken)
    }
    window.location.href = redirectUrl.toString()
  },
}
