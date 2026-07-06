import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Loader2, UserPlus, TriangleAlert, CheckCircle2, BadgeCheck } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { InstallHint } from '../components/InstallHint'
import { ROLE_LABELS, INVITEE_ROLE } from '../utils/roles'
import { formatPhone, isValidPhone } from '../utils/formatters'

export function ConviteCadastro() {
  const { code } = useParams()
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [checking, setChecking] = useState(true)
  const [inviter, setInviter] = useState(null)
  const [inviteError, setInviteError] = useState('')

  const [form, setForm] = useState({ nome: '', telefone: '', password: '' })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [existingMatch, setExistingMatch] = useState(false)
  const [checkingPhone, setCheckingPhone] = useState(false)

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

  const handlePhoneBlur = async () => {
    if (!isValidPhone(form.telefone)) return
    setCheckingPhone(true)
    const { data } = await supabase.rpc('find_pedido_by_telefone', { phone: form.telefone })
    const match = data?.[0]
    if (match) {
      setForm((prev) => ({ ...prev, nome: match.nome }))
      setExistingMatch(true)
    } else {
      setExistingMatch(false)
    }
    setCheckingPhone(false)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (form.nome.trim().length < 3 || !isValidPhone(form.telefone) || form.password.length < 6) {
      setFormError('Preencha nome, um telefone válido e uma senha com pelo menos 6 caracteres')
      return
    }

    setSubmitting(true)
    const result = await register({
      telefone: form.telefone,
      password: form.password,
      nome: form.nome,
      role: INVITEE_ROLE,
      parentId: inviter.id,
    })

    if (result.success) {
      if (existingMatch) {
        await supabase.rpc('mark_pedido_as_lider', { phone: form.telefone })
      } else {
        await supabase.from('pedidos_voto').insert({
          created_by: result.userId,
          nome: form.nome,
          telefone: form.telefone,
          voto: 'sim',
          tipo_contato: 'Liderança',
        })
      }
    }

    setSubmitting(false)

    if (result.success) {
      setDone(true)
    } else {
      setFormError(result.error ?? 'Não foi possível criar a conta')
    }
  }

  const redirectTo = location.state?.from?.pathname ?? '/'

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
            onClick={() => navigate(redirectTo, { replace: true })}
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
          <FormField label="Telefone (vai ser seu login)">
            <div className="relative">
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={form.telefone}
                onChange={(e) => setField('telefone', formatPhone(e.target.value))}
                onBlur={handlePhoneBlur}
                placeholder="(11) 91234-5678"
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 pr-9 text-sm text-white placeholder-blue-200/40 outline-none focus:ring-2 focus:ring-blue-400"
              />
              {checkingPhone && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-300"
                />
              )}
            </div>
            {existingMatch && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-300">
                <BadgeCheck size={14} />
                Encontramos seu cadastro — nome preenchido automaticamente
              </p>
            )}
          </FormField>

          <FormField label="Nome completo">
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setField('nome', e.target.value)}
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
