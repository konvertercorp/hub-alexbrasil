import { useMemo, useState } from 'react'
import { Search, ThumbsUp, ThumbsDown, Users, Pencil, Loader2, X } from 'lucide-react'
import { Header } from '../components/Header'
import { PedidoVotoFields } from '../components/PedidoVotoFields'
import { usePedidosVoto } from '../hooks/usePedidosVoto'
import { useMunicipios } from '../hooks/useMunicipios'
import { useAddressLookup } from '../hooks/useAddressLookup'
import { validatePedidoVoto } from '../utils/pedidoVotoValidation'

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'sim', label: 'Sim' },
  { key: 'nao', label: 'Não' },
]

const BLANK_FORM = {
  nome: '',
  apelido: '',
  nomeMae: '',
  telefone: '',
  cpf: '',
  dataNascimento: '',
  voto: 'sim',
  tipoContato: 'Eleitor',
  status: 'Registrado',
  tags: [],
  genero: null,
  ocupacao: '',
  observacoes: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  municipio: '',
  uf: '',
  coordenadas: null,
  origem: '',
}

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
  const { pedidos, stats, updatePedido } = usePedidosVoto()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(BLANK_FORM)
  const [editErrors, setEditErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const { municipios, loading: municipiosLoading } = useMunicipios(editForm.uf)
  const setEditField = (field, value) => setEditForm((prev) => ({ ...prev, [field]: value }))
  const {
    cepLoading,
    coordLoading,
    coordError,
    locationLoading,
    locationError,
    handleCepBlur,
    handleBuscarCoordenadas,
    handleUseMyLocation,
  } = useAddressLookup(editForm, setEditField)

  const filtered = useMemo(() => {
    return pedidos
      .filter((p) => (filter === 'todos' ? true : p.voto === filter))
      .filter((p) =>
        p.nome.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [pedidos, search, filter])

  const startEdit = (pedido) => {
    setEditingId(pedido.id)
    setEditForm({ ...BLANK_FORM, ...pedido })
    setEditErrors({})
    setSaveError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleSaveEdit = async () => {
    const validationErrors = validatePedidoVoto(editForm)
    setEditErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSaving(true)
    setSaveError('')
    try {
      await updatePedido(editingId, editForm)
      setEditingId(null)
    } catch {
      setSaveError('Não foi possível salvar as alterações. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

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
              filtered.map((pedido) =>
                editingId === pedido.id ? (
                  <EditPedidoCard
                    key={pedido.id}
                    form={editForm}
                    errors={editErrors}
                    setField={setEditField}
                    municipios={municipios}
                    municipiosLoading={municipiosLoading}
                    cepLoading={cepLoading}
                    coordLoading={coordLoading}
                    coordError={coordError}
                    locationLoading={locationLoading}
                    locationError={locationError}
                    onCepBlur={handleCepBlur}
                    onBuscarCoordenadas={handleBuscarCoordenadas}
                    onUseMyLocation={handleUseMyLocation}
                    onCancel={cancelEdit}
                    onSave={handleSaveEdit}
                    saving={saving}
                    saveError={saveError}
                  />
                ) : (
                  <VoterCard key={pedido.id} pedido={pedido} onEdit={() => startEdit(pedido)} />
                ),
              )
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

function VoterCard({ pedido, onEdit }) {
  const badge = VOTO_BADGE[pedido.voto]
  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#b8e000]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{pedido.nome}</p>
          <p className="mt-0.5 text-xs text-gray-500">{pedido.telefone}</p>
          {pedido.cpf && <p className="text-xs text-gray-500">{pedido.cpf}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {badge ? (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}
            >
              <badge.icon size={12} />
              {badge.label}
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
              Não informado
            </span>
          )}
          <Pencil size={14} className="text-gray-300" />
        </div>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        {formatDate(pedido.createdAt)}
      </p>
    </button>
  )
}

function EditPedidoCard({
  form,
  errors,
  setField,
  municipios,
  municipiosLoading,
  cepLoading,
  coordLoading,
  coordError,
  locationLoading,
  locationError,
  onCepBlur,
  onBuscarCoordenadas,
  onUseMyLocation,
  onCancel,
  onSave,
  saving,
  saveError,
}) {
  return (
    <div className="rounded-2xl border-2 border-[#b8e000] bg-white p-4 shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Editando cadastro</h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancelar edição"
          className="text-gray-400 hover:text-gray-900"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <PedidoVotoFields
          form={form}
          errors={errors}
          setField={setField}
          municipios={municipios}
          municipiosLoading={municipiosLoading}
          cepLoading={cepLoading}
          coordLoading={coordLoading}
          coordError={coordError}
          locationLoading={locationLoading}
          locationError={locationError}
          onCepBlur={onCepBlur}
          onBuscarCoordenadas={onBuscarCoordenadas}
          onUseMyLocation={onUseMyLocation}
        />
      </div>

      {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b8e000] py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          Salvar alterações
        </button>
      </div>
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
