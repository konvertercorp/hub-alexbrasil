import { useEffect, useState } from 'react'
import { Trophy, User, Loader2 } from 'lucide-react'
import { Header } from '../components/Header'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const MEDAL_STYLES = [
  'bg-amber-400 text-amber-950',
  'bg-gray-300 text-gray-800',
  'bg-orange-400 text-orange-950',
]

export function Ranking() {
  const { profile } = useAuth()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.rpc('get_ranking').then(({ data }) => {
      setRanking(data ?? [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f2f4e6]">
      <Header appName="HUB AlexBrasil" backTo="/" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ranking</h1>
              <p className="text-xs text-gray-500">
                2 pontos por pessoa convidada · 1 ponto por voto
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {ranking.map((entry, index) => (
                <RankingRow
                  key={entry.profile_id}
                  position={index + 1}
                  entry={entry}
                  isMe={entry.profile_id === profile?.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function RankingRow({ position, entry, isMe }) {
  const medalStyle = MEDAL_STYLES[position - 1]

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-3 shadow-sm ${
        isMe ? 'border-[#b8e000] bg-lime-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          medalStyle ?? 'bg-gray-100 text-gray-500'
        }`}
      >
        {position}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {!entry.is_same_team && (
          <User size={14} className="shrink-0 text-gray-300" />
        )}
        <p className="truncate text-sm font-semibold text-gray-900">
          {entry.is_same_team ? entry.nome : 'Fora da sua equipe'}
          {isMe && <span className="ml-1 text-xs font-normal text-gray-500">(você)</span>}
        </p>
      </div>

      <span className="shrink-0 text-sm font-bold text-gray-900">{entry.pontos} pts</span>
    </div>
  )
}
