import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Users,
  User,
  Tag,
  NotebookPen,
  MapPin,
  Briefcase,
  Loader2,
  CheckCircle,
  Search,
} from 'lucide-react'
import { Header } from '../components/Header'
import { Section } from '../components/Section'
import { TagInput } from '../components/TagInput'
import { MunicipioSelect } from '../components/MunicipioSelect'
import { usePedidosVoto } from '../hooks/usePedidosVoto'
import { useMunicipios } from '../hooks/useMunicipios'
import { UF_LIST } from '../utils/ufs'
import { fetchAddressByCep } from '../utils/viacep'
import { forwardGeocode } from '../utils/geocoding'
import {
  formatPhone,
  isValidPhone,
  formatCPF,
  isValidCPF,
  formatCEP,
  formatDateBR,
  isValidDateBR,
} from '../utils/formatters'

const TIPO_CONTATO_OPTIONS = ['Eleitor', 'Liderança', 'Apoiador', 'Voluntário', 'Doador']
const STATUS_OPTIONS = ['Registrado', 'Contatado', 'Confirmado', 'Indeciso', 'Inativo']
const ORIGEM_OPTIONS = [
  'Gabinete / Atendimento Presencial',
  'Evento',
  'Porta a Porta',
  'Indicação',
  'Redes Sociais',
  'Outro',
]

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

function validate(form) {
  const errors = {}

  if (form.nome.trim().length < 3) {
    errors.nome = 'Informe o nome completo'
  }
  if (!isValidPhone(form.telefone)) {
    errors.telefone = 'Telefone inválido'
  }
  if (form.cpf && !isValidCPF(form.cpf)) {
    errors.cpf = 'CPF inválido'
  }
  if (!isValidDateBR(form.dataNascimento)) {
    errors.dataNascimento = 'Data de nascimento inválida'
  }
  if (!form.voto) {
    errors.voto = 'Selecione uma opção'
  }

  return errors
}

export function VotoRequest() {
  const { stats, addPedido } = usePedidosVoto()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [lastSubmitted, setLastSubmitted] = useState(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [coordLoading, setCoordLoading] = useState(false)
  const [coordError, setCoordError] = useState('')
  const [submitError, setSubmitError] = useState('')

  const { municipios, loading: municipiosLoading } = useMunicipios(form.uf)

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleVoto = (voto) => setField('voto', voto)

  const handleCepBlur = async () => {
    if (form.cep.replace(/\D/g, '').length !== 8) return
    setCepLoading(true)
    try {
      const address = await fetchAddressByCep(form.cep)
      if (address) {
        setForm((prev) => ({
          ...prev,
          logradouro: address.logradouro || prev.logradouro,
          bairro: address.bairro || prev.bairro,
          uf: address.uf || prev.uf,
          municipio: address.municipio || prev.municipio,
        }))
      }
    } catch {
      // CEP não encontrado — usuário preenche manualmente
    } finally {
      setCepLoading(false)
    }
  }

  const handleBuscarCoordenadas = async () => {
    const query = [form.logradouro, form.numero, form.bairro, form.municipio, form.uf, 'Brasil']
      .filter(Boolean)
      .join(', ')
    if (!form.bairro || !form.municipio) {
      setCoordError('Preencha bairro e município para buscar')
      return
    }
    setCoordLoading(true)
    setCoordError('')
    try {
      const result = await forwardGeocode(query)
      if (result) {
        setField('coordenadas', result)
      } else {
        setCoordError('Coordenadas não encontradas')
      }
    } catch {
      setCoordError('Falha ao buscar coordenadas')
    } finally {
      setCoordLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validate(form)
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
    setCoordError('')
    setSubmitError('')
    setLastSubmitted(null)
  }

  const localizacaoOk = Boolean(form.bairro && form.municipio)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a]">
      <Header appName="HUB AlexBrasil" backTo="/" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white">Pedido de Voto</h1>
              <p className="mt-1 text-sm text-blue-200">
                Cadastre o eleitor ou liderança e registre o pedido de voto.
              </p>
            </div>
            <Link
              to="/votos/lista"
              className="mt-1 flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
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
              <Section icon={User} title="Dados Básicos (Obrigatório)" tone="blue" defaultOpen>
                <Field label="Nome completo *" error={errors.nome}>
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.nome}
                    onChange={(e) => setField('nome', e.target.value)}
                    placeholder="Ex: João da Silva Santos"
                    className={inputClass(errors.nome)}
                  />
                </Field>

                <Field label="Apelido">
                  <input
                    type="text"
                    value={form.apelido}
                    onChange={(e) => setField('apelido', e.target.value)}
                    placeholder="Como gosta de ser chamado"
                    className={inputClass()}
                  />
                </Field>

                <Field label="WhatsApp / Telefone *" error={errors.telefone}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={form.telefone}
                    onChange={(e) => setField('telefone', formatPhone(e.target.value))}
                    placeholder="(11) 91234-5678"
                    className={inputClass(errors.telefone)}
                  />
                </Field>

                <Field label="CPF" error={errors.cpf}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.cpf}
                    onChange={(e) => setField('cpf', formatCPF(e.target.value))}
                    placeholder="123.456.789-00"
                    className={inputClass(errors.cpf)}
                  />
                </Field>

                <Field label="Data de nascimento *" error={errors.dataNascimento}>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.dataNascimento}
                    onChange={(e) => setField('dataNascimento', formatDateBR(e.target.value))}
                    placeholder="DD/MM/AAAA"
                    className={inputClass(errors.dataNascimento)}
                  />
                </Field>

                <Field label="O eleitor confirmou o voto? *" error={errors.voto}>
                  <div className="grid grid-cols-2 gap-3">
                    <VoteButton
                      active={form.voto === 'sim'}
                      onClick={() => handleVoto('sim')}
                      icon={ThumbsUp}
                      label="Sim"
                      variant="green"
                    />
                    <VoteButton
                      active={form.voto === 'nao'}
                      onClick={() => handleVoto('nao')}
                      icon={ThumbsDown}
                      label="Não"
                      variant="red"
                    />
                  </div>
                </Field>
              </Section>

              <Section icon={Tag} title="Qualificação & Segmentação" tone="amber">
                <Field label="Tipo de contato">
                  <select
                    value={form.tipoContato}
                    onChange={(e) => setField('tipoContato', e.target.value)}
                    className={inputClass()}
                  >
                    {TIPO_CONTATO_OPTIONS.map((option) => (
                      <option key={option} value={option} className="text-black">
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                    className={inputClass()}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option} className="text-black">
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Tags (pressione Enter para criar)">
                  <TagInput
                    tags={form.tags}
                    onChange={(tags) => setField('tags', tags)}
                    placeholder="Ex: Saúde, Liderança, Professor..."
                  />
                </Field>
              </Section>

              <Section icon={NotebookPen} title="Informações Internas / CRM" tone="teal">
                <div>
                  <span className="mb-1.5 block text-sm font-medium text-blue-100">
                    Gênero
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <GeneroPill
                      active={form.genero === null}
                      onClick={() => setField('genero', null)}
                      label="Não informado"
                    />
                    <GeneroPill
                      active={form.genero === 'homem'}
                      onClick={() => setField('genero', 'homem')}
                      label="Homem"
                    />
                    <GeneroPill
                      active={form.genero === 'mulher'}
                      onClick={() => setField('genero', 'mulher')}
                      label="Mulher"
                    />
                  </div>
                </div>

                <Field label="Ocupação">
                  <input
                    type="text"
                    value={form.ocupacao}
                    onChange={(e) => setField('ocupacao', e.target.value)}
                    placeholder="Ex: Enfermeiro, Professor, Comerciante"
                    className={inputClass()}
                  />
                </Field>

                <Field label="Observações">
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => setField('observacoes', e.target.value)}
                    placeholder="Pedidos, histórico, problemas relatados..."
                    rows={3}
                    className={inputClass()}
                  />
                </Field>
              </Section>

              <Section icon={MapPin} title="Endereço / Geolocalização" tone="red">
                <Field label="CEP">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.cep}
                      onChange={(e) => setField('cep', formatCEP(e.target.value))}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      className={inputClass()}
                    />
                    {cepLoading && (
                      <Loader2 size={16} className="shrink-0 animate-spin text-blue-300" />
                    )}
                  </div>
                </Field>

                <Field label="Rua/Logradouro">
                  <input
                    type="text"
                    value={form.logradouro}
                    onChange={(e) => setField('logradouro', e.target.value)}
                    className={inputClass()}
                  />
                </Field>

                <Field label="Número">
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => setField('numero', e.target.value)}
                    placeholder="123"
                    className={inputClass()}
                  />
                </Field>

                <Field label="Bairro">
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => setField('bairro', e.target.value)}
                    className={inputClass()}
                  />
                </Field>

                <Field label="Estado (UF)">
                  <select
                    value={form.uf}
                    onChange={(e) => setField('uf', e.target.value)}
                    className={inputClass()}
                  >
                    <option value="" className="text-black">Selecione</option>
                    {UF_LIST.map((uf) => (
                      <option key={uf.sigla} value={uf.sigla} className="text-black">
                        {uf.nome}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Município">
                  <MunicipioSelect
                    value={form.municipio}
                    onChange={(value) => setField('municipio', value)}
                    options={municipios}
                    disabled={!form.uf}
                    loading={municipiosLoading}
                  />
                </Field>

                <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
                  <p className="text-xs text-blue-200/70">
                    * Bairro e Cidade são essenciais para o mapa de calor político.
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    {localizacaoOk ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-300">
                        <CheckCircle size={14} />
                        Localização OK
                      </span>
                    ) : (
                      <span className="text-xs text-blue-200/50">Localização incompleta</span>
                    )}
                    <button
                      type="button"
                      onClick={handleBuscarCoordenadas}
                      disabled={coordLoading}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                    >
                      {coordLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Search size={14} />
                      )}
                      Buscar Coordenadas
                    </button>
                  </div>
                  {coordError && <p className="text-xs text-red-300">{coordError}</p>}
                  {form.coordenadas && (
                    <p className="text-xs text-emerald-300">
                      {form.coordenadas.lat.toFixed(5)}, {form.coordenadas.lng.toFixed(5)}
                    </p>
                  )}
                </div>
              </Section>

              <Section icon={Briefcase} title="Origem do contato" tone="purple">
                <Field label="Origem">
                  <select
                    value={form.origem}
                    onChange={(e) => setField('origem', e.target.value)}
                    className={inputClass()}
                  >
                    <option value="" className="text-black">Selecione</option>
                    {ORIGEM_OPTIONS.map((option) => (
                      <option key={option} value={option} className="text-black">
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </Section>

              {submitError && <p className="text-sm text-red-300">{submitError}</p>}

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
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
  blue: 'bg-blue-500/20 text-blue-200',
  green: 'bg-emerald-500/20 text-emerald-300',
  red: 'bg-red-500/20 text-red-300',
}

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl border border-white/10 py-3 ${STAT_TONES[tone]}`}
    >
      <Icon size={16} />
      <span className="text-lg font-bold text-white">{value}</span>
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
    <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
      </div>
      <h2 className="text-lg font-bold text-white">Pedido registrado!</h2>
      <p className="text-sm text-blue-200">
        {form.nome.split(' ')[0]} —{' '}
        <span className="font-semibold text-white">{votoLabel(form.voto)}</span>
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
      >
        Registrar próximo eleitor
      </button>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-blue-100">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  )
}

function inputClass(error) {
  return `w-full rounded-xl border bg-white/10 px-4 py-2.5 text-sm text-white placeholder-blue-200/40 outline-none transition focus:ring-2 focus:ring-blue-400 ${
    error ? 'border-red-400/70' : 'border-white/20'
  }`
}

function VoteButton({ active, onClick, icon: Icon, label, variant }) {
  const activeClasses =
    variant === 'green'
      ? 'border-emerald-400 bg-emerald-500/30 text-emerald-300'
      : 'border-red-400 bg-red-500/30 text-red-300'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm font-semibold transition ${
        active ? activeClasses : 'border-white/20 bg-white/5 text-blue-100'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  )
}

function GeneroPill({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-emerald-500 text-white'
          : 'bg-white/10 text-blue-200 hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  )
}
