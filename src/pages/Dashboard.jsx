import { MapPin, ListChecks, IdCard, Newspaper, FileText, Users, Trophy, Medal } from 'lucide-react'
import { Header } from '../components/Header'
import { AppTile } from '../components/AppTile'
import { NoticiasCarousel } from '../components/NoticiasCarousel'
import { useAuth } from '../context/AuthContext'
import { canAccessModule } from '../utils/roles'

const MODULES = [
  { key: 'localizacao', to: '/localizacao', label: 'Check-in', icon: MapPin, color: 'blue' },
  { key: 'atividades', to: '/atividades', label: 'Atividades', icon: ListChecks, color: 'purple' },
  { key: 'votos', to: '/votos', label: 'Pedido de Voto', icon: IdCard, color: 'green' },
  { key: 'noticias', to: '/noticias', label: 'Notícias', icon: Newspaper, color: 'orange' },
  { key: 'emendas', to: '/emendas', label: 'Emendas', icon: FileText, color: 'teal' },
  { key: 'ranking', to: '/ranking', label: 'Ranking', icon: Trophy, color: 'amber' },
  { key: 'medalhas', to: '/medalhas', label: 'Medalhas', icon: Medal, color: 'pink' },
  { key: 'equipe', to: '/equipe', label: 'Minha Equipe', icon: Users, color: 'indigo' },
]

export function Dashboard() {
  const { profile } = useAuth()
  const visibleModules = MODULES.filter((module) => canAccessModule(profile?.role, module.key))

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f2f4e6]">
      <Header appName="HUB AlexBrasil" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <NoticiasCarousel />

          <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-6">
            {visibleModules.map((module) => (
              <AppTile key={module.to} {...module} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
