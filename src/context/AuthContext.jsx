import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, usernameToEmail } from '../lib/supabaseClient'
import { generateInviteCode } from '../utils/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) await fetchProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession)
        if (newSession) {
          await fetchProfile(newSession.user.id)
        } else {
          setProfile(null)
        }
      },
    )

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [fetchProfile])

  const login = async (username, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    })
    return { success: !error, error: error?.message }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // Cria a conta de autenticação + linha de perfil (usado no bootstrap
  // do primeiro Deputado e na tela de resgate de convite).
  const register = async ({ username, password, nome, telefone, role, parentId }) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: usernameToEmail(username),
      password,
    })
    if (signUpError) return { success: false, error: signUpError.message }

    const userId = signUpData.user?.id
    if (!userId) {
      return { success: false, error: 'Não foi possível criar a conta.' }
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      username: username.trim().toLowerCase(),
      nome,
      telefone,
      role,
      parent_id: parentId ?? null,
      invite_code: generateInviteCode(),
    })

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    // signUp já autentica a sessão automaticamente quando a confirmação
    // de e-mail está desativada no projeto Supabase.
    const { data: sessionData } = await supabase.auth.getSession()
    setSession(sessionData.session)
    await fetchProfile(userId)

    return { success: true }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        isAuthenticated: Boolean(session),
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return context
}
