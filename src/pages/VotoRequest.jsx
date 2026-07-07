import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ThumbsUp, ThumbsDown, Users } from 'lucide-react'
import { Header } from '../components/Header'
import { PedidoVotoFields } from '../components/PedidoVotoFields'
import { usePedidosVoto } from '../hooks/usePedidosVoto'
import { useMunicipios } from '../hooks/useMunicipios'
import { useAddressLookup } from '../hooks/useAddressLookup'
import { validatePedidoVoto } from '../utils/pedidoVotoValidation'

const initialForm = {
  nome: '',
  apelido: '',
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

export function VotoRequest() {
  const { stats, addPedido } = usePedidosVoto()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [lastSubmitted, setLastSubmitted] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const { municipios, loading: municipiosLoading } = useMunicipios(form.uf)

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const { cepLoading, coordLoading, coordError, handleCepBlur, handleBuscarCoordenadas } =
    useAddressLookup(form, setField)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validatePedidoVoto(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setSubmitError('')
    try {
      await addPedido(form)
      setLastSubmitted(form)
    } catch {
      setSubmitError('Não foi possível registrar o pedido. Tente novamente.')
    }
  }

  const handleReset = () => {
    setForm(initialForm)
    setErrors({})
    setSubmitError('')
    setLastSubmitted(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f2f4e6]">
      <Header appName="HUB AlexBrasil" backTo="/" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pedido de Voto</h1>
              <p className="mt-1 text-sm text-gray-500">
                Cadastre o eleitor ou liderança e registre o pedido de voto.
              </p>
            </div>
            <Link
              to="/votos/lista"
              className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              <Users size={14} />
              Ver lista
            </Link>
          </div>

          <StatsBar stats={stats} />

          {lastSubmitted ? (
            <ConfirmationCard form={lastSubmitted} onReset={handleReset} />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
              <PedidoVotoFields
                form={form}
                errors={errors}
                setField={setField}
                municipios={municipios}
                municipiosLoading={municipiosLoading}
                cepLoading={cepLoading}
                coordLoading={coordLoading}
                coordError={coordError}
                onCepBlur={handleCepBlur}
                onBuscarCoordenadas={handleBuscarCoordenadas}
              />

              {submitError && <p className="text-sm text-red-600">{submitError}</p>}

              <button
                type="submit"
                className="w-full rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00]"
              >
                Registrar pedido
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

function StatsBar({ stats }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      <StatCard label="Total" value={stats.total} icon={Users} tone="blue" />
      <StatCard label="Sim" value={stats.sim} icon={ThumbsUp} tone="green" />
      <StatCard label="Não" value={stats.nao} icon={ThumbsDown} tone="red" />
    </div>
  )
}

const STAT_TONES = {
  blue: 'bg-lime-50 text-lime-800 border-lime-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl border py-3 ${STAT_TONES[tone]}`}
    >
      <Icon size={16} />
      <span className="text-lg font-bold text-gray-900">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  )
}

function votoLabel(voto) {
  if (voto === 'sim') return 'SIM'
  if (voto === 'nao') return 'NÃO'
  return 'Não informado'
}

function ConfirmationCard({ form, onReset }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">Pedido registrado!</h2>
      <p className="text-sm text-gray-500">
        {form.nome.split(' ')[0]} —{' '}
        <span className="font-semibold text-gray-900">{votoLabel(form.voto)}</span>
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 w-full rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00]"
      >
        Registrar próximo eleitor
      </button>
    </div>
  )
}
