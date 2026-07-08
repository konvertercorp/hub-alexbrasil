import { useEffect, useState } from 'react'
import { UserPlus, ThumbsUp, Award, Trophy, Sun, CalendarCheck, Loader2, Lock } from 'lucide-react'
import { Header } from '../components/Header'
import { supabase } from '../lib/supabaseClient'

const BADGES = [
  {
    key: 'conta',
    label: 'Conta criada',
    description: 'Você entrou para a rede.',
    icon: UserPlus,
    check: () => true,
  },
  {
    key: 'primeiro-voto',
    label: 'Primeiro voto',
    description: 'Registrou seu primeiro pedido de voto.',
    icon: ThumbsUp,
    check: (stats) => stats.total_votos >= 1,
  },
  {
    key: '10-votos',
    label: '10 votos',
    description: 'Registrou 10 votos "sim".',
    icon: Award,
    check: (stats) => stats.total_votos >= 10,
  },
  {
    key: '100-votos',
    label: '100 votos',
    description: 'Registrou 100 votos "sim".',
    icon: Trophy,
    check: (stats) => stats.total_votos >= 100,
  },
  {
    key: 'recorde-dia',
    label: 'Recorde do dia',
    description: 'Foi quem mais registrou votos em um dia.',
    icon: Sun,
    check: (stats) => stats.dias_recorde >= 1,
  },
  {
    key: 'recorde-semana',
    label: 'Recorde da semana',
    description: 'Foi quem mais registrou votos em uma semana.',
    icon: CalendarCheck,
    check: (stats) => stats.semanas_recorde >= 1,
  },
]

export function Medalhas() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_my_stats').then(({ data }) => {
      setStats(data?.[0] ?? { total_votos: 0, dias_recorde: 0, semanas_recorde: 0 })
      setLoading(false)
    })
  }, [])

  const earnedCount = stats ? BADGES.filter((b) => b.check(stats)).length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f2f4e6]">
      <Header appName="HUB AlexBrasil" backTo="/" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100">
              <Award className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Medalhas</h1>
              <p className="text-xs text-gray-500">
                {loading ? 'Carregando...' : `${earnedCount} de ${BADGES.length} conquistadas`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {BADGES.map((badge) => (
                <BadgeCard key={badge.key} badge={badge} earned={badge.check(stats)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function BadgeCard({ badge, earned }) {
  const Icon = badge.icon
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center shadow-sm ${
        earned ? 'border-[#b8e000] bg-lime-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          earned ? 'bg-[#b8e000] text-gray-900' : 'bg-gray-100 text-gray-300'
        }`}
      >
        {earned ? <Icon size={22} /> : <Lock size={18} />}
      </div>
      <p className={`text-sm font-semibold ${earned ? 'text-gray-900' : 'text-gray-400'}`}>
        {badge.label}
      </p>
      <p className="text-[11px] text-gray-400">{badge.description}</p>
    </div>
  )
}
