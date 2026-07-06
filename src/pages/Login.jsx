import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Phone, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { formatPhone } from '../utils/formatters'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [telefone, setTelefone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname ?? '/'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const { success } = await login(telefone, password)
    setSubmitting(false)
    if (success) {
      navigate(redirectTo, { replace: true })
    } else {
      setError('Telefone ou senha inválidos')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f2f4e6] px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3">
          <img src="/alex-brasil.png" alt="HUB AlexBrasil" className="h-14 w-14 rounded-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">HUB AlexBrasil</h1>
          <p className="text-sm text-gray-500">Entre com sua conta para continuar</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={telefone}
                onChange={(event) => {
                  setTelefone(formatPhone(event.target.value))
                  setError('')
                }}
                placeholder="(11) 91234-5678"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setError('')
                }}
                placeholder="Digite sua senha"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-900"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
