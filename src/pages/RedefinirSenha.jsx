import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export function RedefinirSenha() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
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
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (updateError) {
      setError('Não foi possível redefinir a senha. Peça um novo link e tente de novo.')
      return
    }

    setDone(true)
    setTimeout(() => navigate('/', { replace: true }), 2000)
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Senha redefinida!</h1>
          <p className="text-sm text-gray-500">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-100">
            <KeyRound className="h-7 w-7 text-lime-700" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Defina sua nova senha</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
        >
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
        </form>
      </div>
    </div>
  )
}
