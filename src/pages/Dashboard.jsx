import { MapPin, ListChecks, IdCard, Newspaper, FileText, Users } from 'lucide-react'
import { Header } from '../components/Header'
import { AppTile } from '../components/AppTile'
import { useAuth } from '../context/AuthContext'
import { canAccessModule } from '../utils/roles'

const MODULES = [
  { key: 'localizacao', to: '/localizacao', label: 'Check-in', icon: MapPin, color: 'blue' },
  { key: 'atividades', to: '/atividades', label: 'Atividades', icon: ListChecks, color: 'purple' },
  { key: 'votos', to: '/votos', label: 'Pedido de Voto', icon: IdCard, color: 'green' },
  { key: 'noticias', to: '/noticias', label: 'Notícias', icon: Newspaper, color: 'orange' },
  { key: 'emendas', to: '/emendas', label: 'Emendas', icon: FileText, color: 'teal' },
  { key: 'equipe', to: '/equipe', label: 'Minha Equipe', icon: Users, color: 'indigo' },
]

export function Dashboard() {
  const { profile } = useAuth()
  const visibleModules = MODULES.filter((module) => canAccessModule(profile?.role, module.key))

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f2f4e6]">
      <Header appName="HUB AlexBrasil" />

      <main className="px-5 py-8">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-x-4 gap-y-8">
          {visibleModules.map((module) => (
            <AppTile key={module.to} {...module} />
          ))}
        </div>
      </main>
    </div>
  )
}
