import { useEffect, useMemo, useState } from 'react'
import { Search, MapPin, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function GestaoCheckins() {
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('checkins')
      .select('id, nome, endereco, lat, lng, created_at, autor:created_by(nome)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCheckins(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(
    () =>
      checkins.filter(
        (c) =>
          c.nome.toLowerCase().includes(search.trim().toLowerCase()) ||
          c.autor?.nome?.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [checkins, search],
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Check-ins</h1>
      <p className="mt-1 text-sm text-gray-500">{checkins.length} check-in(s) registrado(s).</p>

      <div className="relative mt-4 w-full max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por evento ou responsável..."
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
        />
      </div>

      <div className="mt-5 space-y-2">
        {loading ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum check-in encontrado.</p>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <MapPin size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{c.nome}</p>
                <p className="truncate text-xs text-gray-500">
                  {c.endereco ?? 'Endereço não disponível'}
                </p>
              </div>
              <span className="shrink-0 text-xs text-gray-500">{c.autor?.nome ?? '—'}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatDate(c.created_at)}</span>
              <a
                href={`https://www.google.com/maps?q=${c.lat},${c.lng}`}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Mapa
                <ExternalLink size={12} />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
