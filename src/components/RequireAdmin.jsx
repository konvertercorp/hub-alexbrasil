import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function RequireAdmin({ children }) {
  const { profile } = useAuth()

  if (profile?.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50 px-6 text-center">
        <ShieldAlert className="h-10 w-10 text-amber-500" />
        <p className="text-gray-900">Acesso restrito à gestão do gabinete.</p>
        <Link to="/" className="text-sm font-semibold text-[#7a9c00] hover:underline">
          Voltar ao início
        </Link>
      </div>
    )
  }

  return children
}
