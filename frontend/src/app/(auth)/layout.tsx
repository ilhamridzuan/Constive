import * as React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Autentikasi - Constive Platform Governance",
  description: "Masuk atau daftar ke platform governance & produktivitas proyek konstruksi Constive.",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>
}
