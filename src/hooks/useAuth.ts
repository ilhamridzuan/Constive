import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  signUpAction,
  signInAction,
  signOutAction,
  resetPasswordAction,
  magicLinkAction,
  getCurrentUserAction,
  signInWithOAuthAction,
} from '@/actions/auth.actions'
import { Provider } from '@supabase/supabase-js'

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await getCurrentUserAction()
      if (res.error || !res.data) throw new Error(res.error || 'No user')
      return res.data
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export const useSignUpMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signUpAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export const useSignInMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signInAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export const useSignOutMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signOutAction,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null)
      queryClient.clear()
    },
  })
}

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: resetPasswordAction,
  })
}

export const useMagicLinkMutation = () => {
  return useMutation({
    mutationFn: magicLinkAction,
  })
}

export const useSignInWithOAuthMutation = () => {
  return useMutation({
    mutationFn: (provider: Provider) => signInWithOAuthAction(provider),
  })
}
