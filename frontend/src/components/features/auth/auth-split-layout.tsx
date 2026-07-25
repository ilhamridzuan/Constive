"use client"

import * as React from "react"
import Link from "next/link"
import { Building2, ShieldCheck, BarChart3, Clock, HardHat } from "lucide-react"

interface AuthSplitLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthSplitLayout({ children, title, subtitle }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Left Branding Panel (Desktop >= 1024px) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        {/* Background Decorative Gradients & Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#d97706_0%,transparent_40%),radial-gradient(circle_at_80%_80%,#ea580c_0%,transparent_45%)] opacity-25" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-600 text-white shadow-lg shadow-amber-600/30">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white">Constive</span>
            <span className="ml-2 rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/30">
              Enterprise
            </span>
          </div>
        </div>

        {/* Hero Copy & Feature Pillars */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 backdrop-blur-md">
              <HardHat className="h-3.5 w-3.5" />
              <span>Governance & Produktivitas Konstruksi</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-slate-50">
              Kelola Proyek Konstruksi dengan Presisi & Transparansi
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Platform all-in-one untuk penjadwalan Gantt Chart interaktif, laporan harian proyek, dan pengawasan progres secara real-time.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-md">
              <div className="rounded-md bg-amber-500/20 p-2 text-amber-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Gantt Chart Realtime</h4>
                <p className="text-xs text-slate-400">Sinkronisasi tugas & dependensi otomatis</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-md">
              <div className="rounded-md bg-amber-500/20 p-2 text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Laporan Lapangan</h4>
                <p className="text-xs text-slate-400">Dokumentasi cuaca & tenaga kerja harian</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Supabase Auth & Enterprise RBAC Encryption</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Constive Platform</span>
        </div>
      </div>

      {/* Right Auth Form Container */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2 lg:p-12">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Mobile Top Brand Header */}
          <div className="flex flex-col items-center text-center lg:hidden">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Constive</span>
            </Link>
          </div>

          {/* Form Header Title */}
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  )
}
