import * as React from "react"
import type { Metadata } from "next"
import { AuthSplitLayout } from "@/components/features/auth/auth-split-layout"
import { LoginForm } from "@/components/features/auth/login-form"

export const metadata: Metadata = {
  title: "Masuk - Constive",
  description: "Masuk ke akun Constive Anda untuk mengakses workspace dan proyek konstruksi.",
}

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Selamat Datang Kembali"
      subtitle="Masukkan akun Anda untuk melanjutkan ke dashboard proyek."
    >
      <LoginForm />
    </AuthSplitLayout>
  )
}
