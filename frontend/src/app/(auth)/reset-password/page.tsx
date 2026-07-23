import * as React from "react"
import type { Metadata } from "next"
import { Loader2 } from "lucide-react"
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form"

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi - Constive",
  description: "Atur ulang kata sandi akun Constive Anda.",
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
      <React.Suspense
        fallback={
          <div className="flex h-32 w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
          </div>
        }
      >
        <ResetPasswordForm />
      </React.Suspense>
    </main>
  )
}
