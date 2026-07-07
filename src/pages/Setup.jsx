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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (alreadyConfigured) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-white to-[#f2f4e6] px-6 text-center">
        <ShieldCheck className="h-10 w-10 text-gray-400" />
        <p className="text-gray-900">O sistema já foi configurado.</p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-2 rounded-xl bg-[#b8e000] px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-[#a3cc00]"
        >
          Ir para o login
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10">
        <div className="w-full max-w-sm space-y-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Conta criada!</h1>
            <p className="text-sm text-gray-500">Tudo pronto! Você já pode continuar.</p>
          </div>

          <InstallHint />

          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="w-full rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00]"
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <img src="/alex-brasil.png" alt="HUB AlexBrasil" className="h-14 w-14 rounded-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">Configuração inicial</h1>
          <p className="text-center text-sm text-gray-500">
            Crie a primeira conta do sistema — o Deputado, no topo da hierarquia.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
        >
          <FormField label="Nome completo">
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#b8e000]"
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#b8e000]"
            />
          </FormField>

          <FormField label="Senha (mínimo 6 caracteres)">
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#b8e000]"
            />
          </FormField>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:opacity-60"
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
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}
