"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Building2, UserCheck, AlertTriangle, ArrowRight, Loader2, LogIn, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { authService } from "@/services/auth.service"
import { InviteTokenInfo } from "@/types/auth"

export function InviteGateCard() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [isLoading, setIsLoading] = React.useState(true)
  const [inviteInfo, setInviteInfo] = React.useState<InviteTokenInfo | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setErrorMsg("Tautan undangan tidak berlaku atau telah kedaluwarsa.")
      return
    }

    authService.setStoredInviteToken(token)

    authService
      .getInviteInfo(token)
      .then((res) => {
        setIsLoading(false)
        if (res.success && res.data && !res.data.isExpired) {
          setInviteInfo(res.data)
        } else {
          setErrorMsg(res.message || "Tautan undangan tidak berlaku atau telah kedaluwarsa.")
        }
      })
      .catch(() => {
        setIsLoading(false)
        setErrorMsg("Gagal memverifikasi token undangan.")
      })
  }, [token])

  // Loading State
  if (isLoading) {
    return (
      <Card className="w-full max-w-[420px] border-border shadow-lg">
        <CardContent className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <p className="text-sm font-medium text-muted-foreground">Memvalidasi undangan workspace…</p>
        </CardContent>
      </Card>
    )
  }

  // Invalid / Expired State
  if (errorMsg || !inviteInfo) {
    return (
      <Card className="w-full max-w-[420px] border-destructive/40 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-destructive">Undangan Tidak Valid</CardTitle>
          <CardDescription>
            {errorMsg || "Tautan undangan tidak berlaku atau telah kedaluwarsa."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-xs text-muted-foreground">
            Silakan hubungi Administrator workspace untuk mendapatkan tautan undangan baru.
          </p>
          <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
            <Link href="/">
              Kembali ke Halaman Utama
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Valid Token State
  return (
    <Card className="w-full max-w-[420px] border-border shadow-lg">
      <CardHeader className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm">
          <Building2 className="h-8 w-8" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {inviteInfo.workspaceName}
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Undangan Bergabung ke Workspace
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Metadata Details */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Pengundang:</span>
            <span className="font-medium text-foreground">{inviteInfo.inviterName}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border pt-2">
            <span className="text-muted-foreground">Email Penerima:</span>
            <span className="font-medium text-foreground">{inviteInfo.email}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border pt-2">
            <span className="text-muted-foreground">Peran Ditetapkan:</span>
            <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 font-semibold">
              {inviteInfo.role}
            </Badge>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-3">
          <Button asChild className="w-full h-10 font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
            <Link href={`/login?invite_token=${token}`}>
              <LogIn className="h-4 w-4 mr-2" />
              Masuk untuk Bergabung
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full h-10 font-semibold border-border">
            <Link href={`/signup?invite_token=${token}`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Daftar Akun Baru untuk Bergabung
            </Link>
          </Button>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-t border-border bg-muted/30 py-3 text-[11px] text-muted-foreground">
        Dengan bergabung, Anda menyetujui kebijakan akses workspace.
      </CardFooter>
    </Card>
  )
}
