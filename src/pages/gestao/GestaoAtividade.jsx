import { useEffect, useState } from 'react'
import { History, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

const ACTION_LABELS = {
  pedido_criado: 'cadastrou o pedido de voto de',
  pedido_editado: 'editou o pedido de voto de',
  usuario_criado: 'criou a conta de',
  papel_alterado: 'alterou o papel de',
  noticia_criada: 'criou a notícia',
  noticia_editada: 'editou a notícia',
  noticia_excluida: 'excluiu a notícia',
  noticia_status_alterado: 'alterou a visibilidade da notícia',
}

const PAGE_SIZE = 50

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function describe(entry) {
  const label = ACTION_LABELS[entry.action] ?? entry.action
  const details = entry.details ?? {}
  const alvo = details.nome ?? details.titulo ?? ''

  let extra = ''
  if (entry.action === 'papel_alterado') extra = ` (${details.de} → ${details.para})`
  if (entry.action === 'usuario_criado' && details.role) extra = ` (${details.role})`
  if (entry.action === 'noticia_status_alterado') extra = details.ativo ? ' (ativada)' : ' (desativada)'

  return `${label} ${alvo}${extra}`.trim()
}

export function GestaoAtividade() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchPage = async (offset) => {
    const { data } = await supabase
      .from('activity_log')
      .select('id, action, entity_type, details, created_at, actor:actor_id(nome)')
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)
    return data ?? []
  }

  useEffect(() => {
    fetchPage(0).then((data) => {
      setLogs(data)
      setHasMore(data.length === PAGE_SIZE)
      setLoading(false)
    })
  }, [])

  const loadMore = async () => {
    setLoadingMore(true)
    const data = await fetchPage(logs.length)
    setLogs((prev) => [...prev, ...data])
    setHasMore(data.length === PAGE_SIZE)
    setLoadingMore(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Atividade</h1>
      <p className="mt-1 text-sm text-gray-500">
        Histórico de criações e edições feitas no sistema.
      </p>

      <div className="mt-6 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma atividade registrada ainda.</p>
        ) : (
          logs.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <History size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{entry.actor?.nome ?? 'Alguém'}</span>{' '}
                  {describe(entry)}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">{formatDate(entry.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && !loading && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-60"
        >
          {loadingMore && <Loader2 size={14} className="animate-spin" />}
          Carregar mais
        </button>
      )}
    </div>
  )
}
