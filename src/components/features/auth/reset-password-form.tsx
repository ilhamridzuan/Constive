"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, Lock, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordStrengthMeter } from "./password-strength-meter"
import { useAuth } from "@/hooks/use-auth"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tokenParam = searchParams.get("token") || ""

  const { isLoading, error, isDowntime, resetPassword } = useAuth()

  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [isExpired, setIsExpired] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!tokenParam) {
      setIsExpired(true)
      return
    }

    if (newPassword.length < 8) {
      setValidationError("Kata sandi baru minimal 8 karakter.")
      return
    }

    if (newPassword !== confirmPassword) {
      setValidationError("Konfirmasi kata sandi tidak cocok dengan kata sandi baru.")
      return
    }

    const res = await resetPassword({
      token: tokenParam,
      newPassword,
      confirmPassword,
    })

    if (res.errorCode === "TOKEN_EXPIRED") {
      setIsExpired(true)
    } else if (res.success) {
      setIsSuccess(true)
    }
  }

  // Handle Missing or Expired Token State
  if (isExpired || !tokenParam) {
    return (
      <Card className="w-full max-w-[420px] border-destructive/40 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-destructive">Tautan Kedaluwarsa</CardTitle>
          <CardDescription>
            Tautan reset password telah kedaluwarsa atau tidak berlaku lagi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-xs text-muted-foreground">
            Demi keamanan akun Anda, tautan reset password hanya berlaku selama 1 jam dari saat permintaan dibuat.
          </p>
          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
            <Link href="/forgot-password">
              Minta Tautan Baru
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Handle Success State
  if (isSuccess) {
    return (
      <Card className="w-full max-w-[420px] border-emerald-300 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-emerald-900">Password Diperbarui</CardTitle>
          <CardDescription>
            Password Anda berhasil diperbarui. Seluruh sesi aktif sebelumnya telah di-logout demi keamanan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
            <Link href="/login">Silakan Login Kembali →</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[420px] border-border shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <Lock className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Atur Ulang Kata Sandi</CardTitle>
        <CardDescription>
          Masukkan kata sandi baru untuk akun Anda.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isDowntime && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Layanan Tidak Tersedia</AlertTitle>
            <AlertDescription>
              Layanan autentikasi sedang tidak tersedia. Silakan coba beberapa saat lagi.
            </AlertDescription>
          </Alert>
        )}

        {validationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {error && !validationError && !isDowntime && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-new-password">Kata Sandi Baru</Label>
            <div className="relative">
              <Input
                id="reset-new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            <PasswordStrengthMeter password={newPassword} />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reset-confirm-password">Konfirmasi Kata Sandi Baru</Label>
            <Input
              id="reset-confirm-password"
              type="password"
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Menyimpan…
              </>
            ) : (
              "Simpan Password Baru"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
