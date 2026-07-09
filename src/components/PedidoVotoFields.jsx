import {
  ThumbsUp,
  ThumbsDown,
  User,
  Tag,
  NotebookPen,
  MapPin,
  Briefcase,
  Loader2,
  CheckCircle,
  Search,
  LocateFixed,
} from 'lucide-react'
import { Section } from './Section'
import { TagInput } from './TagInput'
import { MunicipioSelect } from './MunicipioSelect'
import { UF_LIST } from '../utils/ufs'
import { formatPhone, formatCPF, formatCEP, formatDateBR } from '../utils/formatters'
import { TIPO_CONTATO_OPTIONS, STATUS_OPTIONS, ORIGEM_OPTIONS } from '../utils/pedidoVotoOptions'

export function PedidoVotoFields({
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
}) {
  const localizacaoOk = Boolean(form.bairro && form.municipio)

  return (
    <>
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

        <Field label="Nome da mãe" error={errors.nomeMae}>
          <input
            type="text"
            autoComplete="off"
            value={form.nomeMae}
            onChange={(e) => setField('nomeMae', e.target.value)}
            placeholder="Ex: Maria da Silva Santos"
            className={inputClass(errors.nomeMae)}
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

        <Field label="Data de nascimento" error={errors.dataNascimento}>
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
              onClick={() => setField('voto', 'sim')}
              icon={ThumbsUp}
              label="Sim"
              variant="green"
            />
            <VoteButton
              active={form.voto === 'nao'}
              onClick={() => setField('voto', 'nao')}
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
              <option key={option} value={option}>
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
              <option key={option} value={option}>
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
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Gênero</span>
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
        {onUseMyLocation && (
          <div className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              {locationLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Detectando sua localização...
                </>
              ) : locationError ? (
                <span className="text-amber-600">{locationError}</span>
              ) : (
                'Preenchemos o endereço com sua localização atual, se você permitir.'
              )}
            </span>
            <button
              type="button"
              onClick={onUseMyLocation}
              disabled={locationLoading}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
            >
              <LocateFixed size={13} />
              Usar minha localização
            </button>
          </div>
        )}

        <Field label="CEP">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={form.cep}
              onChange={(e) => setField('cep', formatCEP(e.target.value))}
              onBlur={onCepBlur}
              placeholder="00000-000"
              className={inputClass()}
            />
            {cepLoading && (
              <Loader2 size={16} className="shrink-0 animate-spin text-gray-400" />
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
            <option value="">Selecione</option>
            {UF_LIST.map((uf) => (
              <option key={uf.sigla} value={uf.sigla}>
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

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400">
            * Bairro e Cidade são essenciais para o mapa de calor político.
          </p>
          <div className="flex items-center justify-between gap-2">
            {localizacaoOk ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <CheckCircle size={14} />
                Localização OK
              </span>
            ) : (
              <span className="text-xs text-gray-400">Localização incompleta</span>
            )}
            <button
              type="button"
              onClick={onBuscarCoordenadas}
              disabled={coordLoading}
              className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
            >
              {coordLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              Buscar Coordenadas
            </button>
          </div>
          {coordError && <p className="text-xs text-red-600">{coordError}</p>}
          {form.coordenadas && (
            <p className="text-xs text-emerald-600">
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
            <option value="">Selecione</option>
            {ORIGEM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </Section>
    </>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputClass(error) {
  return `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000] ${
    error ? 'border-red-400' : 'border-gray-300'
  }`
}

function VoteButton({ active, onClick, icon: Icon, label, variant }) {
  const activeClasses =
    variant === 'green'
      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
      : 'border-red-400 bg-red-50 text-red-700'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-sm font-semibold transition ${
        active ? activeClasses : 'border-gray-200 bg-gray-50 text-gray-500'
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
        active ? 'bg-[#b8e000] text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )
}
