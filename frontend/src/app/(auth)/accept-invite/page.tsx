import * as React from "react"
import type { Metadata } from "next"
import { Loader2 } from "lucide-react"
import { InviteGateCard } from "@/components/features/auth/invite-gate-card"

export const metadata: Metadata = {
  title: "Undangan Workspace - Constive",
  description: "Terima undangan untuk bergabung ke workspace proyek di Constive.",
}

export default function AcceptInvitePage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
      <React.Suspense
        fallback={
          <div className="flex h-32 w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
          </div>
        }
      >
        <InviteGateCard />
      </React.Suspense>
    </main>
  )
}
