import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../store'
import { syncDown } from '../lib/sync'

export function useAuth() {
  const { session, setSession, setLoadingAuth, loadAll, fullSync } = useStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fullSync()
      } else {
        loadAll() // load local only
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fullSync()
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export async function signOut() {
  await supabase.auth.signOut()
}
