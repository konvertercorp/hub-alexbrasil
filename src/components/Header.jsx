import { useNavigate } from 'react-router-dom'
import { Settings, HelpCircle, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function Header({ appName = 'HUB AlexBrasil' }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0a1a4a]/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <img
          src="/logo.svg"
          alt={appName}
          className="h-8 w-8 rounded-full"
        />
        <span className="font-bold text-white">{appName}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Configurações"
          className="text-blue-100 transition hover:text-white"
        >
          <Settings size={20} />
        </button>
        <button
          type="button"
          aria-label="Ajuda"
          className="text-blue-100 transition hover:text-white"
        >
          <HelpCircle size={20} />
        </button>
        <button
          type="button"
          aria-label="Sair"
          onClick={handleLogout}
          className="text-blue-100 transition hover:text-white"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}
