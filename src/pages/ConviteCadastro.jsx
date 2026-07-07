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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (inviteError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-br from-white to-[#f2f4e6] px-6 text-center">
        <TriangleAlert className="h-10 w-10 text-amber-500" />
        <p className="text-gray-900">{inviteError}</p>
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
            onClick={() => navigate(redirectTo, { replace: true })}
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100">
            <UserPlus className="h-7 w-7 text-lime-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Complete seu cadastro</h1>
          <p className="text-center text-sm text-gray-500">
            Convidado por <strong className="text-gray-900">{inviter.nome}</strong> para
            entrar como <strong className="text-gray-900">{ROLE_LABELS[INVITEE_ROLE]}</strong>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-9 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#b8e000]"
              />
              {checkingPhone && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
                />
              )}
            </div>
            {existingMatch && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-600">
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

          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:opacity-60"
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
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}
