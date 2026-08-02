"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Loader2, Mail, CheckCircle2, AlertTriangle, Building2, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PasswordStrengthMeter } from "./password-strength-meter"
import { useAuth } from "@/hooks/use-auth"
import { authService } from "@/services/auth.service"
import { InviteTokenInfo } from "@/types/auth"

export function SignUpForm() {
  const searchParams = useSearchParams()
  const inviteTokenParam = searchParams.get("invite_token")

  const { isLoading, error, isDowntime, register, loginWithOAuth, clearErrors } = useAuth()

  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [signupSuccess, setSignupSuccess] = React.useState(false)
  const [inviteInfo, setInviteInfo] = React.useState<InviteTokenInfo | null>(null)
  const [validationError, setValidationError] = React.useState<string | null>(null)

  // Fetch invite token metadata if present in URL parameter
  React.useEffect(() => {
    if (inviteTokenParam) {
      authService.setStoredInviteToken(inviteTokenParam)
      authService.getInviteInfo(inviteTokenParam).then((res) => {
        if (res.success && res.data) {
          setInviteInfo(res.data)
          if (res.data.email) {
            setEmail(res.data.email)
          }
        }
      })
    }
  }, [inviteTokenParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    clearErrors()

    // Form field client-side validations
    if (fullName.trim().length < 2) {
      setValidationError("Nama lengkap minimal 2 karakter.")
      return
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setValidationError("Password minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.")
      return
    }

    // Double submit protection
    if (isSubmitting || isLoading) return
    setIsSubmitting(true)

    const res = await register({
      fullName,
      email,
      password,
      inviteToken: inviteTokenParam || undefined,
    })

    setIsSubmitting(false)

    if (res.success) {
      setSignupSuccess(true)
    }
  }

  return (
    <div className="space-y-5">
      {/* Invite Flow Banner */}
      {inviteInfo && (
        <Alert variant="info" className="animate-in fade-in slide-in-from-top-2 border-amber-300 bg-amber-50 text-amber-900">
          <Building2 className="h-4 w-4 text-amber-700" />
          <AlertTitle className="text-amber-900 font-semibold">Undangan Workspace Active</AlertTitle>
          <AlertDescription className="text-xs text-amber-800 mt-0.5">
            Anda diundang bergabung ke <strong>{inviteInfo.workspaceName}</strong> sebagai <strong>{inviteInfo.role}</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Downtime Alert Banner */}
      {isDowntime && (
        <Alert variant="destructive" className="animate-in fade-in">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Layanan Tidak Tersedia</AlertTitle>
          <AlertDescription>
            Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.
          </AlertDescription>
        </Alert>
      )}

      {/* Client Validation Error Banner */}
      {validationError && (
        <Alert variant="destructive" className="animate-in fade-in">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Server Error Banner */}
      {error && !validationError && !isDowntime && (
        <Alert variant="destructive" className="animate-in fade-in">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success View */}
      {signupSuccess ? (
        <Alert variant="success" className="animate-in fade-in p-5 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <AlertTitle className="text-base font-bold text-emerald-900">Pendaftaran Berhasil!</AlertTitle>
              <AlertDescription className="text-sm text-emerald-800 mt-1">
                Silakan periksa kotak masuk email <strong>{email}</strong> untuk memverifikasi akun Anda sebelum masuk.
              </AlertDescription>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-200 flex justify-end">
            <Button asChild size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white">
              <Link href="/login">Lanjut ke Halaman Login →</Link>
            </Button>
          </div>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <Label htmlFor="signup-name">Nama Lengkap</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="Ahmad Fauzi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          {/* Email Field (ReadOnly if invite flow) */}
          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Alamat Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly={!!inviteInfo?.email}
              className={inviteInfo?.email ? "bg-muted cursor-not-allowed text-muted-foreground" : ""}
              autoComplete="email"
            />
            {inviteInfo?.email && (
              <p className="text-[11px] text-muted-foreground">
                * Alamat email dikunci sesuai dengan email penerima undangan workspace.
              </p>
            )}
          </div>

          {/* Password Field + Visibility Toggle */}
          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Kata Sandi</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter (huruf besar, kecil, angka)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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

            {/* Password Strength Bar */}
            <PasswordStrengthMeter password={password} />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || isSubmitting}
            className="w-full h-10 font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Mendaftar…
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Daftar
              </>
            )}
          </Button>
        </form>
      )}

      {/* OAuth Section */}
      {!signupSuccess && (
        <>
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <span className="relative bg-background px-3 text-xs text-muted-foreground uppercase tracking-wider">
              atau mendaftar dengan
            </span>
          </div>

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
        </>
      )}

      {/* Footer Navigation */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-500 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </div>
  )
}
