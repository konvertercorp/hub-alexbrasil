import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { InstallHint } from '../components/InstallHint'
import { formatPhone, isValidPhone } from '../utils/formatters'

export function Setup() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [checking, setChecking] = useState(true)
  const [alreadyConfigured, setAlreadyConfigured] = useState(false)
  const [form, setForm] = useState({ nome: '', telefone: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    supabase.rpc('profiles_count').then(({ data }) => {
      setAlreadyConfigured((data ?? 0) > 0)
      setChecking(false)
    })
  }, [])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.nome.trim().length < 3 || !isValidPhone(form.telefone) || form.password.length < 6) {
      setError('Preencha nome, um telefone válido e uma senha com pelo menos 6 caracteres')
      return
    }

    setSubmitting(true)
    const result = await register({
      telefone: form.telefone,
      password: form.password,
      nome: form.nome,
      role: 'deputado',
      parentId: null,
    })
    setSubmitting(false)

    if (result.success) {
      setDone(true)
    } else {
      setError(result.error ?? 'Não foi possível criar a conta')
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
      </div>
    )
  }

  if (alreadyConfigured) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a] px-6 text-center">
        <ShieldCheck className="h-10 w-10 text-blue-200" />
        <p className="text-white">O sistema já foi configurado.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400"
        >
          Ir para o login
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a] px-6 py-10">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Conta criada!</h1>
            <p className="text-sm text-blue-200">Você já pode usar o app.</p>
          </div>

          <InstallHint />

          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a] px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <img src="/alex-brasil.png" alt="HUB AlexBrasil" className="h-14 w-14 rounded-2xl" />
          <h1 className="text-2xl font-bold text-white">Configuração inicial</h1>
          <p className="text-center text-sm text-blue-200">
            Crie a primeira conta do sistema — o Deputado, no topo da hierarquia.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl"
        >
          <FormField label="Nome completo">
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-blue-200/40 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </FormField>

          <FormField label="Telefone (vai ser seu login)">
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={form.telefone}
              onChange={(e) => setField('telefone', formatPhone(e.target.value))}
              placeholder="(11) 91234-5678"
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-blue-200/40 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </FormField>

          <FormField label="Senha (mínimo 6 caracteres)">
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-blue-200/40 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </FormField>

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Criar conta de Deputado
          </button>
        </form>
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-blue-100">{label}</label>
      {children}
    </div>
  )
}
