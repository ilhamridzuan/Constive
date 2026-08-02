'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User, Provider } from '@supabase/supabase-js'

export type ActionResponse<T = any> = {
  error?: string | null
  data?: T | null
}

export async function signUpAction({
  email,
  password,
  fullName,
}: {
  email: string
  password?: string
  fullName: string
}): Promise<ActionResponse> {
  const supabase = await createClient()

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password: password || '',
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function signInAction({
  email,
  password,
}: {
  email: string
  password?: string
}): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || '',
  })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function signOutAction(): Promise<ActionResponse> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  redirect('/login')
}

export async function resetPasswordAction(email: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`, 
  })

  if (error) {
    return { error: error.message }
  }

  return { data: { success: true } }
}

export async function magicLinkAction(email: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { data: { success: true } }
}

export async function getCurrentUserAction(): Promise<ActionResponse<User>> {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: error?.message || 'User not found' }
  }

  return { data: user }
}

export async function signInWithOAuthAction(provider: Provider): Promise<ActionResponse> {
  const supabase = await createClient()

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Supabase auth with OAuth on server-side returns a URL to redirect to.
  if (data.url) {
    redirect(data.url)
  }

  return { data }
}
