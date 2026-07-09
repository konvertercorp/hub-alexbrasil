import { useEffect, useState } from 'react'
import { Users, ThumbsUp, UserCog, MapPin, Newspaper } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const CARDS = [
  { key: 'totalEleitores', label: 'Pedidos de voto', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { key: 'votosSim', label: 'Votos "sim"', icon: ThumbsUp, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'totalLideres', label: 'Líderes na rede', icon: UserCog, color: 'text-indigo-600 bg-indigo-50' },
  { key: 'totalCheckins', label: 'Check-ins', icon: MapPin, color: 'text-orange-600 bg-orange-50' },
  { key: 'noticiasAtivas', label: 'Notícias ativas', icon: Newspaper, color: 'text-pink-600 bg-pink-50' },
]

export function GestaoDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function load() {
      const [pedidos, votosSim, lideres, checkins, noticias] = await Promise.all([
        supabase.from('pedidos_voto').select('*', { count: 'exact', head: true }),
        supabase.from('pedidos_voto').select('*', { count: 'exact', head: true }).eq('voto', 'sim'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('checkins').select('*', { count: 'exact', head: true }),
        supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('ativo', true),
      ])
      setStats({
        totalEleitores: pedidos.count ?? 0,
        votosSim: votosSim.count ?? 0,
        totalLideres: lideres.count ?? 0,
        totalCheckins: checkins.count ?? 0,
        noticiasAtivas: noticias.count ?? 0,
      })
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Visão geral</h1>
      <p className="mt-1 text-sm text-gray-500">Números consolidados de toda a rede.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {CARDS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
              <Icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">
              {stats ? stats[key] : '—'}
            </p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
