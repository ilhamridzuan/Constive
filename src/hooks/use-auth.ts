"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/services/auth.service"
import {
  AuthSession,
  ForgotPasswordPayload,
  LoginCredentials,
  MagicLinkPayload,
  ResetPasswordPayload,
  SignUpCredentials,
  UserProfile,
} from "@/types/auth"

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [isDowntime, setIsDowntime] = useState<boolean>(false)

  const clearErrors = useCallback(() => {
    setError(null)
    setUnverifiedEmail(null)
    setIsDowntime(false)
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      clearErrors()
      setIsLoading(true)

      const result = await authService.login(credentials)
      setIsLoading(false)

      if (result.isDowntime) {
        setIsDowntime(true)
        setError(result.message || null)
        return false
      }

      if (result.isUnverifiedEmail) {
        setUnverifiedEmail(credentials.email)
        setError(result.message || null)
        return false
      }

      if (!result.success || !result.data) {
        setError(result.message || "Gagal masuk ke akun.")
        return false
      }

      const session: AuthSession = result.data
      setUser(session.user)
      authService.clearStoredInviteToken()

      // Redirect to workspace switcher or dashboard
      router.push("/workspace")
      return true
    },
    [clearErrors, router]
  )

  const register = useCallback(
    async (credentials: SignUpCredentials) => {
      clearErrors()
      setIsLoading(true)

      const result = await authService.register(credentials)
      setIsLoading(false)

      if (result.isDowntime) {
        setIsDowntime(true)
        setError(result.message || null)
        return { success: false }
      }

      if (!result.success) {
        setError(result.message || "Gagal membuat akun.")
        return { success: false }
      }

      return {
        success: true,
        message: result.message,
        verificationSent: result.data?.verificationSent,
      }
    },
    [clearErrors]
  )

  const requestPasswordReset = useCallback(
    async (payload: ForgotPasswordPayload) => {
      clearErrors()
      setIsLoading(true)

      const result = await authService.requestPasswordReset(payload)
      setIsLoading(false)

      if (result.isDowntime) {
        setIsDowntime(true)
        setError(result.message || null)
        return false
      }

      return true
    },
    [clearErrors]
  )

  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload) => {
      clearErrors()
      setIsLoading(true)

      const result = await authService.resetPassword(payload)
      setIsLoading(false)

      if (result.isDowntime) {
        setIsDowntime(true)
        setError(result.message || null)
        return { success: false, errorCode: undefined }
      }

      if (!result.success) {
        setError(result.message || "Gagal mengosongkan kata sandi.")
        return { success: false, errorCode: result.errorCode }
      }

      return { success: true, message: result.message }
    },
    [clearErrors]
  )

  const requestMagicLink = useCallback(
    async (payload: MagicLinkPayload) => {
      clearErrors()
      setIsLoading(true)

      const result = await authService.requestMagicLink(payload)
      setIsLoading(false)

      if (result.isDowntime) {
        setIsDowntime(true)
        setError(result.message || null)
        return false
      }

      return true
    },
    [clearErrors]
  )

  const resendVerification = useCallback(
    async (email: string) => {
      setIsLoading(true)
      const result = await authService.resendVerificationEmail(email)
      setIsLoading(false)
      if (result.success) {
        setUnverifiedEmail(null)
      }
      return result
    },
    []
  )

  const loginWithOAuth = useCallback((provider: "google" | "microsoft") => {
    authService.loginWithOAuth(provider)
  }, [])

  return {
    user,
    isLoading,
    error,
    unverifiedEmail,
    isDowntime,
    clearErrors,
    login,
    register,
    requestPasswordReset,
    resetPassword,
    requestMagicLink,
    resendVerification,
    loginWithOAuth,
  }
}
