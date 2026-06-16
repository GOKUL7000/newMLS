import { supabase } from './supabase'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', data.user.id)
    .single()
  // Update last login
  if (profile) {    
    await (supabase.from('users') as any).update({ last_login: new Date().toISOString() }).eq('id', (profile as any).id)
  }
  return { session: data.session, user: data.user, profile }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  if (!data.user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', data.user.id)
    .single()
  return profile
}