import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Newspaper, Users, UserCog, MapPin, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/gestao', end: true, label: 'Visão geral', icon: LayoutDashboard },
  { to: '/gestao/noticias', label: 'Notícias', icon: Newspaper },
  { to: '/gestao/eleitores', label: 'Eleitores', icon: Users },
  { to: '/gestao/equipe', label: 'Equipe', icon: UserCog },
  { to: '/gestao/checkins', label: 'Check-ins', icon: MapPin },
]

export function GestaoLayout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <img src="/alex-brasil.png" alt="" className="h-7 w-7 rounded-full" />
          <span className="text-sm font-bold text-gray-900">Gestão</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="text-gray-600"
        >
          <Menu size={22} />
        </button>
      </header>

      {menuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <img src="/alex-brasil.png" alt="" className="h-8 w-8 rounded-full" />
            <div>
              <p className="text-sm font-bold text-gray-900">Gestão</p>
              <p className="text-xs text-gray-400">HUB AlexBrasil</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
            className="text-gray-400 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#b8e000]/20 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 px-5 py-4">
          <p className="truncate text-xs font-semibold text-gray-900">{profile?.nome}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-gray-900"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:overflow-x-auto lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}
