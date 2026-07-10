import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { formatPhone, isValidPhone } from '../utils/formatters'

export function EsqueciSenha() {
  const [telefone, setTelefone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isValidPhone(telefone)) {
      setError('Informe um telefone válido')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('forgot-password', {
        body: { telefone },
      })
      if (fnError || data?.success === false) throw new Error()
      setDone(true)
    } catch {
      setError('Não foi possível processar o pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verifique seu e-mail</h1>
          <p className="text-sm text-gray-500">
            Se esse telefone tiver um e-mail cadastrado, enviamos um link para redefinir a senha.
            Confira também a caixa de spam.
          </p>
          <Link
            to="/login"
            className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft size={14} />
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100">
            <Mail className="h-7 w-7 text-lime-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Esqueci minha senha</h1>
          <p className="text-center text-sm text-gray-500">
            Digite o telefone da sua conta. Se você tiver um e-mail cadastrado, mandamos um link
            para redefinir a senha.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Telefone</label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={telefone}
              onChange={(e) => {
                setTelefone(formatPhone(e.target.value))
                setError('')
              }}
              placeholder="(11) 91234-5678"
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
            Enviar link de redefinição
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={14} />
            Voltar para o login
          </Link>
        </form>
      </div>
    </div>
  )
}
