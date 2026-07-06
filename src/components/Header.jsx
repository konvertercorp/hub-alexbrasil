import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Header({ appName = 'HUB AlexBrasil', backTo }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0a1a4a]/80 px-4 py-3 backdrop-blur-md">
      {backTo ? (
        <Link
          to={backTo}
          aria-label="Voltar"
          className="flex items-center gap-2 text-white transition hover:text-blue-200"
        >
          <ArrowLeft size={20} />
          <span className="font-bold">{appName}</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <img src="/alex-brasil.png" alt={appName} className="h-8 w-8 rounded-full" />
          <span className="font-bold text-white">{appName}</span>
        </div>
      )}

      <button
        type="button"
        aria-label="Sair"
        onClick={handleLogout}
        className="text-blue-100 transition hover:text-white"
      >
        <LogOut size={20} />
      </button>
    </header>
  )
}
