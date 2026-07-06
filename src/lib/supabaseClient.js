import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local (veja .env.local.example)',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// O login é feito pelo telefone em vez de e-mail, então sintetizamos um
// e-mail interno para o Supabase Auth (que exige e-mail ou telefone).
export function phoneToEmail(telefone) {
  const digits = telefone.replace(/\D/g, '')
  return `${digits}@example.com`
}
