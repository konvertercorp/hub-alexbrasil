import { useMemo, useState } from 'react'
import { Search, ThumbsUp, ThumbsDown, Users } from 'lucide-react'
import { Header } from '../components/Header'
import { usePedidosVoto } from '../hooks/usePedidosVoto'

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'sim', label: 'Sim' },
  { key: 'nao', label: 'Não' },
]

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function VotoList() {
  const { pedidos, stats } = usePedidosVoto()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')

  const filtered = useMemo(() => {
    return pedidos
      .filter((p) => (filter === 'todos' ? true : p.voto === filter))
      .filter((p) =>
        p.nome.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [pedidos, search, filter])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f2f4e6]">
      <Header appName="HUB AlexBrasil" backTo="/votos" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-bold text-gray-900">Eleitores registrados</h1>
          <p className="mt-1 text-sm text-gray-500">
            {stats.total} pedidos · {stats.sim} sim · {stats.nao} não
          </p>

          <div className="relative mt-4">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome..."
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
            />
          </div>

          <div className="mt-3 flex gap-2">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                  filter === key
                    ? 'bg-[#b8e000] text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {filtered.length === 0 ? (
              <EmptyState hasPedidos={pedidos.length > 0} />
            ) : (
              filtered.map((pedido, index) => (
                <VoterCard key={`${pedido.cpf}-${index}`} pedido={pedido} />
              ))
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

const VOTO_BADGE = {
  sim: { className: 'bg-emerald-50 text-emerald-700', icon: ThumbsUp, label: 'SIM' },
  nao: { className: 'bg-red-50 text-red-700', icon: ThumbsDown, label: 'NÃO' },
}

function VoterCard({ pedido }) {
  const badge = VOTO_BADGE[pedido.voto]
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{pedido.nome}</p>
          <p className="mt-0.5 text-xs text-gray-500">{pedido.telefone}</p>
          {pedido.cpf && <p className="text-xs text-gray-500">{pedido.cpf}</p>}
        </div>
        {badge ? (
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}
          >
            <badge.icon size={12} />
            {badge.label}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
            Não informado
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        {formatDate(pedido.createdAt)}
      </p>
    </div>
  )
}

function EmptyState({ hasPedidos }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 py-10 text-center">
      <Users className="h-8 w-8 text-gray-400" />
      <p className="text-sm text-gray-500">
        {hasPedidos
          ? 'Nenhum eleitor encontrado para essa busca.'
          : 'Nenhum pedido de voto registrado ainda.'}
      </p>
    </div>
  )
}
