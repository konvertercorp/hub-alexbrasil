import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Search, ThumbsUp, ThumbsDown, Users } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a]">
      <Header appName="HUB AlexBrasil" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-bold text-white">Eleitores registrados</h1>
          <p className="mt-1 text-sm text-blue-200">
            {stats.total} pedidos · {stats.sim} sim · {stats.nao} não
          </p>

          <div className="relative mt-4">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-blue-300"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome..."
              className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-9 pr-4 text-sm text-white placeholder-blue-200/40 outline-none transition focus:ring-2 focus:ring-blue-400"
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
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
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

          <Link
            to="/votos"
            className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-blue-200 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Voltar para Pedido de Voto
          </Link>
        </div>
      </main>
    </div>
  )
}

function VoterCard({ pedido }) {
  const isSim = pedido.voto === 'sim'
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{pedido.nome}</p>
          <p className="mt-0.5 text-xs text-blue-200">{pedido.telefone}</p>
          <p className="text-xs text-blue-200">{pedido.cpf}</p>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
            isSim
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-red-500/20 text-red-300'
          }`}
        >
          {isSim ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
          {isSim ? 'SIM' : 'NÃO'}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-blue-300/70">
        {formatDate(pedido.createdAt)}
      </p>
    </div>
  )
}

function EmptyState({ hasPedidos }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-10 text-center">
      <Users className="h-8 w-8 text-blue-300" />
      <p className="text-sm text-blue-200">
        {hasPedidos
          ? 'Nenhum eleitor encontrado para essa busca.'
          : 'Nenhum pedido de voto registrado ainda.'}
      </p>
    </div>
  )
}
