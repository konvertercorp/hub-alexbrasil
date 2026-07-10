import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react'
import { supabase, phoneToEmail } from '../lib/supabaseClient'
import { isValidEmail } from '../utils/formatters'

export function EsqueciSenha() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleRequestCode = async (event) => {
    event.preventDefault()
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('forgot-password', {
        body: { email: email.trim() },
      })
      if (fnError || data?.success === false) throw new Error()
      // Se o e-mail não tiver conta associada, o backend não devolve o
      // telefone — mantemos o fluxo seguindo normalmente (sem revelar
      // isso na tela) e o código digitado depois simplesmente não bate.
      setTelefone(data?.telefone ?? '')
      setStep('codigo')
    } catch {
      setError('Não foi possível processar o pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    if (code.trim().length < 6) {
      setError('Digite o código que enviamos por e-mail')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não são iguais')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: telefone ? phoneToEmail(telefone) : 'invalido@example.com',
        token: code.trim(),
        type: 'recovery',
      })
      if (verifyError) throw new Error('codigo')

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw new Error('senha')

      navigate('/', { replace: true })
    } catch (err) {
      setError(
        err.message === 'codigo'
          ? 'Código inválido ou expirado. Peça um novo.'
          : 'Não foi possível redefinir a senha. Tente novamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100">
            {step === 'email' ? (
              <Mail className="h-7 w-7 text-lime-700" />
            ) : (
              <KeyRound className="h-7 w-7 text-lime-700" />
            )}
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {step === 'email' ? 'Esqueci minha senha' : 'Digite o código'}
          </h1>
          <p className="text-center text-sm text-gray-500">
            {step === 'email'
              ? 'Digite o e-mail cadastrado na sua conta. Mandamos um código para redefinir a senha.'
              : 'Enviamos um código para esse e-mail. Digite-o abaixo com sua nova senha.'}
          </p>
        </div>

        {step === 'email' ? (
          <form
            onSubmit={handleRequestCode}
            noValidate
            className="mt-6 space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Enviar código
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={14} />
              Voltar para o login
            </Link>
          </form>
        ) : (
          <form
            onSubmit={handleResetPassword}
            noValidate
            className="mt-6 space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Código recebido por e-mail
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setError('')
                }}
                placeholder="Digite o código"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-lg tracking-[0.3em] text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Nova senha (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirmar nova senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:opacity-60"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Salvar nova senha
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email')
                setError('')
              }}
              className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft size={14} />
              Usar outro e-mail
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
