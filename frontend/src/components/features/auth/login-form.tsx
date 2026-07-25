"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2, Mail, AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm() {
  const {
    isLoading,
    error,
    unverifiedEmail,
    isDowntime,
    login,
    resendVerification,
    loginWithOAuth,
    clearErrors,
  } = useAuth()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [resendSuccess, setResendSuccess] = React.useState(false)
  const [isMagicLinkMode, setIsMagicLinkMode] = React.useState(false)
  const [magicLinkSent, setMagicLinkSent] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    if (isMagicLinkMode) {
      // Handle magic link submission
      setMagicLinkSent(true)
      return
    }

    await login({ email, password })
  }

  const handleResendEmail = async () => {
    if (!unverifiedEmail && !email) return
    const targetEmail = unverifiedEmail || email
    const res = await resendVerification(targetEmail)
    if (res.success) {
      setResendSuccess(true)
    }
  }

  return (
    <div className="space-y-5">
      {/* Downtime Alert Banner */}
      {isDowntime && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Layanan Tidak Tersedia</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-2 mt-1">
            <span>Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.</span>
            <Button
              variant="outline"
              size="xs"
              onClick={clearErrors}
              className="shrink-0 gap-1 bg-background text-foreground"
            >
              <RefreshCw className="h-3 w-3" />
              Coba Lagi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Unverified Email Warning Banner */}
      {unverifiedEmail && !isDowntime && (
        <Alert variant="warning" className="animate-in fade-in slide-in-from-top-2">
          <Mail className="h-4 w-4" />
          <AlertTitle>Email Belum Diverifikasi</AlertTitle>
          <AlertDescription className="space-y-2 mt-1">
            <p>Email <strong>{unverifiedEmail}</strong> belum diverifikasi. Silakan periksa inbox email Anda.</p>
            {resendSuccess ? (
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                ✓ Email verifikasi baru telah dikirim!
              </p>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendEmail}
                disabled={isLoading}
                className="mt-1"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Kirim Ulang Email Verifikasi"}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* General Error Banner */}
      {error && !unverifiedEmail && !isDowntime && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {magicLinkSent ? (
        <Alert variant="success" className="animate-in fade-in">
          <Mail className="h-4 w-4" />
          <AlertTitle>Magic Link Terkirim</AlertTitle>
          <AlertDescription>
            Instruksi login tanpa kata sandi telah dikirim ke <strong>{email}</strong>. Silakan periksa email Anda.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="login-email">Alamat Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password Field (Only in password mode) */}
          {!isMagicLinkMode && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Kata Sandi</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Main Submit CTA */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isMagicLinkMode ? "Mengirim Magic Link…" : "Masuk…"}
              </>
            ) : isMagicLinkMode ? (
              "Kirim Magic Link"
            ) : (
              "Masuk"
            )}
          </Button>

          {/* Magic Link Mode Toggle */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setIsMagicLinkMode(!isMagicLinkMode)
                clearErrors()
              }}
              className="text-xs text-muted-foreground hover:text-amber-600 transition-colors"
            >
              {isMagicLinkMode
                ? "← Kembali ke login dengan kata sandi"
                : "Atau login via Magic Link (tanpa kata sandi)"}
            </button>
          </div>
        </form>
      )}

      {/* OAuth Section Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <span className="relative bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
          atau lanjutkan dengan
        </span>
      </div>

      {/* OAuth Provider Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => loginWithOAuth("google")}
          className="h-10 gap-2 border-border hover:bg-muted font-medium text-xs"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => loginWithOAuth("microsoft")}
          className="h-10 gap-2 border-border hover:bg-muted font-medium text-xs"
        >
          <svg className="h-4 w-4" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
          Microsoft
        </Button>
      </div>

      {/* Footer Navigation */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Belum punya akun?{" "}
        <Link
          href="/signup"
          className="font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 hover:underline"
        >
          Daftar akun baru
        </Link>
      </p>
    </div>
  )
}
