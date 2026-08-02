"use client"

import * as React from "react"
import { PasswordStrengthResult, PasswordStrengthScore } from "@/types/auth"
import { cn } from "@/lib/utils"

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password)

  if (!password) {
    return {
      score: 0,
      label: "Sangat Lemah",
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    }
  }

  let calculatedScore = 0

  if (hasMinLength) calculatedScore++
  if (hasUppercase && hasLowercase) calculatedScore++
  if (hasNumber) calculatedScore++
  if (hasSpecialChar || password.length >= 12) calculatedScore++

  if (calculatedScore > 4) calculatedScore = 4
  const score = calculatedScore as PasswordStrengthScore

  let label: PasswordStrengthResult["label"] = "Sangat Lemah"
  if (score === 2) label = "Lemah"
  if (score === 3) label = "Fair"
  if (score === 4) label = "Kuat"

  return {
    score,
    label,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  }
}

interface PasswordStrengthMeterProps {
  password?: string
  className?: string
}

export function PasswordStrengthMeter({ password = "", className }: PasswordStrengthMeterProps) {
  const result = evaluatePasswordStrength(password)
  const { score, label } = result

  if (!password) {
    return null
  }

  const getSegmentColor = (index: number) => {
    if (index >= score) return "bg-muted"

    switch (score) {
      case 1:
        return "bg-rose-500" // Weak (danger)
      case 2:
        return "bg-amber-500" // Fair (warning)
      case 3:
        return "bg-sky-500" // Good (info)
      case 4:
        return "bg-emerald-500" // Strong (success)
      default:
        return "bg-muted"
    }
  }

  const getLabelColor = () => {
    switch (score) {
      case 1:
        return "text-rose-600 dark:text-rose-400"
      case 2:
        return "text-amber-600 dark:text-amber-400"
      case 3:
        return "text-sky-600 dark:text-sky-400"
      case 4:
        return "text-emerald-600 dark:text-emerald-400"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className={cn("space-y-1.5 pt-1", className)}>
      <div className="flex h-1.5 w-full gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              getSegmentColor(index)
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Kekuatan kata sandi:</span>
        <span className={cn("font-medium", getLabelColor())}>{label}</span>
      </div>
    </div>
  )
}
