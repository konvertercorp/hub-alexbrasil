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

const METRICS = [
  {
    key: 'pontos',
    label: 'Pontos',
    unit: 'pts',
    decimals: 1,
    caption: '1 pt por voto que você registrar de outra pessoa · 0,5 pt por voto de qualquer pessoa da sua equipe (seu próprio cadastro não vale ponto)',
  },
  {
    key: 'lideres',
    label: 'Líderes',
    unit: 'líderes',
    decimals: 0,
    caption: 'Pessoas que entraram com seu link direto',
  },
  {
    key: 'votos_diretos',
    label: 'Votos diretos',
    unit: 'votos',
    decimals: 0,
    caption: 'Votos "sim" que você mesmo registrou',
  },
  {
    key: 'votos_equipe',
    label: 'Votos da equipe',
    unit: 'votos',
    decimals: 0,
    caption: 'Votos "sim" de você e de toda sua rede abaixo',
  },
]

function formatValor(valor, decimals) {
  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function Ranking() {
  const { profile } = useAuth()
  const [metric, setMetric] = useState('pontos')
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase.rpc('get_ranking', { metric }).then(({ data }) => {
      setRanking(data ?? [])
      setLoading(false)
    })
  }, [metric])

  const activeMetric = METRICS.find((m) => m.key === metric)

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
              <p className="text-xs text-gray-500">{activeMetric.caption}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetric(m.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  metric === m.key
                    ? 'bg-[#b8e000] text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
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
                  unit={activeMetric.unit}
                  decimals={activeMetric.decimals}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function RankingRow({ position, entry, isMe, unit, decimals }) {
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

      <span className="shrink-0 text-sm font-bold text-gray-900">
        {formatValor(entry.valor, decimals)} {unit}
      </span>
    </div>
  )
}
