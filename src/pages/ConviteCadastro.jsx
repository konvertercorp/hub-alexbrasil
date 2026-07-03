import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, UserPlus, TriangleAlert } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS, INVITEE_ROLE } from '../utils/roles'

export function ConviteCadastro() {
  const { code } = useParams()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [checking, setChecking] = useState(true)
  const [inviter, setInviter] = useState(null)
  const [inviteError, setInviteError] = useState('')

  const [form, setForm] = useState({ nome: '', telefone: '', username: '', password: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase
      .rpc('get_inviter_by_code', { code })
      .then(({ data, error }) => {
        const found = data?.[0]
        if (error || !found) {
          setInviteError('Convite inválido ou expirado.')
        } else {
          setInviter(found)
        }
        setChecking(false)
      })
  }, [code])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.nome.trim().length < 3 || !form.username || form.password.length < 6) {
      setFormError('Preencha nome, usuário e uma senha com pelo menos 6 caracteres')
      return
    }

    setSubmitting(true)
    const result = await register({
      username: form.username,
      password: form.password,
      nome: form.nome,
      telefone: form.telefone,
      role: INVITEE_ROLE,
      parentId: inviter.id,
    })
    setSubmitting(false)

    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setFormError(result.error ?? 'Não foi possível criar a conta')
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
      </div>
    )
  }

  if (inviteError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a] px-6 text-center">
        <TriangleAlert className="h-10 w-10 text-amber-300" />
        <p className="text-white">{inviteError}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a] px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20">
            <UserPlus className="h-7 w-7 text-blue-200" />
          </div>
          <h1 className="text-xl font-bold text-white">Complete seu cadastro</h1>
          <p className="text-center text-sm text-blue-200">
            Convidado por <strong className="text-white">{inviter.nome}</strong> para
            entrar como <strong className="text-white">{ROLE_LABELS[INVITEE_ROLE]}</strong>
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

          <FormField label="Telefone">
            <input
              type="tel"
              value={form.telefone}
              onChange={(e) => setField('telefone', e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-blue-200/40 outline-none focus:ring-2 focus:ring-blue-400"
            />
          </FormField>

          <FormField label="Usuário">
            <input
              type="text"
              value={form.username}
              onChange={(e) => setField('username', e.target.value)}
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

          {formError && <p className="text-xs text-red-300">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:opacity-60"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Criar minha conta
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
