import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { ROLE_LABELS } from '../../utils/roles'

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('pt-BR')
}

export function GestaoEquipe() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, nome, telefone, role, created_at, parent:parent_id(nome)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProfiles(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(
    () => profiles.filter((p) => p.nome.toLowerCase().includes(search.trim().toLowerCase())),
    [profiles, search],
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
      <p className="mt-1 text-sm text-gray-500">{profiles.length} conta(s) na rede.</p>

      <div className="relative mt-4 w-full max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
        />
      </div>

      {/* Mobile: lista de cards */}
      <div className="mt-5 space-y-2 sm:hidden">
        {loading ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma pessoa encontrada.</p>
        ) : (
          filtered.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{p.nome}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {p.telefone} · convidado por {p.parent?.nome ?? '—'}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">entrou em {formatDate(p.created_at)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-medium text-lime-800">
                {ROLE_LABELS[p.role] ?? p.role}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Desktop/tablet: tabela */}
      <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Papel</th>
              <th className="px-4 py-3 font-medium">Convidado por</th>
              <th className="px-4 py-3 font-medium">Entrou em</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Nenhuma pessoa encontrada.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{p.telefone}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-medium text-lime-800">
                      {ROLE_LABELS[p.role] ?? p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.parent?.nome ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
