import * as React from "react"
import type { Metadata } from "next"
import { Loader2 } from "lucide-react"
import { AuthSplitLayout } from "@/components/features/auth/auth-split-layout"
import { SignUpForm } from "@/components/features/auth/signup-form"

export const metadata: Metadata = {
  title: "Daftar Akun Baru - Constive",
  description: "Buat akun Constive baru untuk mulai mengelola proyek konstruksi Anda.",
}

export default function SignUpPage() {
  return (
    <AuthSplitLayout
      title="Buat Akun Constive"
      subtitle="Daftar mandiri atau gunakan undangan workspace untuk memulai."
    >
      <React.Suspense
        fallback={
          <div className="flex h-32 w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
          </div>
        }
      >
        <SignUpForm />
      </React.Suspense>
    </AuthSplitLayout>
  )
}
