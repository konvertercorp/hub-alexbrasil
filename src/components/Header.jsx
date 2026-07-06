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
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur-md">
      {backTo ? (
        <Link
          to={backTo}
          aria-label="Voltar"
          className="flex items-center gap-2 text-gray-900 transition hover:text-[#7a9c00]"
        >
          <ArrowLeft size={20} />
          <span className="font-bold">{appName}</span>
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <img src="/alex-brasil.png" alt={appName} className="h-8 w-8 rounded-full" />
          <span className="font-bold text-gray-900">{appName}</span>
        </div>
      )}

      <button
        type="button"
        aria-label="Sair"
        onClick={handleLogout}
        className="text-gray-500 transition hover:text-gray-900"
      >
        <LogOut size={20} />
      </button>
    </header>
  )
}
