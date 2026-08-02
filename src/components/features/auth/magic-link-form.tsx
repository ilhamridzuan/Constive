"use client"

import * as React from "react"
import Link from "next/link"
import { Mail, ArrowLeft, Loader2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

export function MagicLinkForm() {
  const { isLoading, requestMagicLink, isDowntime } = useAuth()
  const [email, setEmail] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    const success = await requestMagicLink({ email })
    if (success) {
      setSubmitted(true)
    }
  }

  return (
    <Card className="w-full max-w-[420px] border-border shadow-lg">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold tracking-tight">Login via Magic Link</CardTitle>
        <CardDescription>
          {submitted
            ? "Tautan login sekali pakai telah dikirim ke email Anda."
            : "Masuk tanpa kata sandi dengan tautan autentikasi langsung ke email Anda."}
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

        {submitted ? (
          <Alert variant="success" className="p-4 space-y-2">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <AlertTitle className="font-semibold text-emerald-900">Magic Link Terkirim!</AlertTitle>
                <AlertDescription className="text-xs text-emerald-800 leading-relaxed">
                  Tautan login otomatis telah dikirim ke <strong>{email}</strong>. Klik tautan tersebut dari email Anda untuk langsung masuk tanpa memasukkan kata sandi.
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="magic-email">Alamat Email Terdaftar</Label>
              <Input
                id="magic-email"
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
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
                  Mengirim Magic Link…
                </>
              ) : (
                "Kirim Magic Link"
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-border bg-muted/30 py-3">
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Halaman Login
        </Link>
      </CardFooter>
    </Card>
  )
}
