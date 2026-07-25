import * as React from "react"
import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Lupa Kata Sandi - Constive",
  description: "Pulihkan akses kata sandi akun Constive Anda via email.",
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
      <ForgotPasswordForm />
    </main>
  )
}
