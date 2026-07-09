import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, X, Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { supabase, phoneToEmail, createEphemeralClient } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS, generateInviteCode } from '../../utils/roles'
import { formatPhone, isValidPhone } from '../../utils/formatters'
import { logActivity } from '../../utils/activityLog'

const ROLE_OPTIONS = ['lider', 'deputado', 'admin']

const BLANK_FORM = { nome: '', telefone: '', password: '', role: 'lider' }

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('pt-BR')
}

export function GestaoEquipe() {
  const { profile } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const fetchProfiles = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, nome, telefone, role, created_at, parent:parent_id(nome)')
      .order('created_at', { ascending: false })
    setProfiles(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const filtered = useMemo(
    () => profiles.filter((p) => p.nome.toLowerCase().includes(search.trim().toLowerCase())),
    [profiles, search],
  )

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const startCreate = () => {
    setForm(BLANK_FORM)
    setCreateError('')
    setShowForm(true)
  }

  const handleCreateUser = async () => {
    if (form.nome.trim().length < 3 || !isValidPhone(form.telefone) || form.password.length < 6) {
      setCreateError('Preencha nome, um telefone válido e uma senha com pelo menos 6 caracteres.')
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      // Client descartável: cria a conta de autenticação sem substituir a
      // sessão do admin logado no client principal.
      const ephemeral = createEphemeralClient()
      const { data: signUpData, error: signUpError } = await ephemeral.auth.signUp({
        email: phoneToEmail(form.telefone),
        password: form.password,
      })
      if (signUpError) throw signUpError
      const userId = signUpData.user?.id
      if (!userId) throw new Error('Não foi possível criar a conta.')

      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        username: form.telefone.replace(/\D/g, ''),
        nome: form.nome,
        telefone: form.telefone,
        role: form.role,
        parent_id: null,
        invite_code: generateInviteCode(),
      })
      if (profileError) throw profileError

      const { data: matchData } = await supabase.rpc('find_pedido_by_telefone', {
        phone: form.telefone,
      })
      if (matchData?.[0]) {
        await supabase.rpc('mark_pedido_as_lider', { phone: form.telefone })
      } else {
        await supabase.from('pedidos_voto').insert({
          created_by: userId,
          nome: form.nome,
          telefone: form.telefone,
          voto: 'sim',
          tipo_contato: 'Liderança',
        })
      }

      logActivity(profile.id, 'usuario_criado', 'profile', userId, {
        nome: form.nome,
        role: form.role,
      })

      setShowForm(false)
      setForm(BLANK_FORM)
      fetchProfiles()
    } catch (err) {
      setCreateError(
        err.message?.includes('registered')
          ? 'Já existe uma conta com esse telefone.'
          : 'Não foi possível criar a conta. Tente novamente.',
      )
    } finally {
      setCreating(false)
    }
  }

  const toggleAdmin = async (p) => {
    const makeAdmin = p.role !== 'admin'
    const nextRole = makeAdmin ? 'admin' : 'lider'
    const confirmMsg = makeAdmin
      ? `Tornar ${p.nome} admin? Vai ter acesso total à gestão.`
      : `Remover admin de ${p.nome}? O papel volta para Líder.`
    if (!window.confirm(confirmMsg)) return
    const { error } = await supabase.from('profiles').update({ role: nextRole }).eq('id', p.id)
    if (!error) {
      logActivity(profile.id, 'papel_alterado', 'profile', p.id, {
        nome: p.nome,
        de: p.role,
        para: nextRole,
      })
      fetchProfiles()
    }
  }

  return (
    <div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="mt-1 text-sm text-gray-500">{profiles.length} conta(s) na rede.</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-2 rounded-xl bg-[#b8e000] px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00]"
        >
          <Plus size={16} />
          Novo usuário
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border-2 border-[#b8e000] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Novo usuário</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-900"
            >
              <X size={18} />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Cria uma conta direto, sem precisar de link de convite. Não entra na rede de ninguém.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Nome completo *">
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setField('nome', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b8e000]"
              />
            </Field>
            <Field label="Telefone (será o login) *">
              <input
                type="tel"
                inputMode="numeric"
                value={form.telefone}
                onChange={(e) => setField('telefone', formatPhone(e.target.value))}
                placeholder="(11) 91234-5678"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b8e000]"
              />
            </Field>
            <Field label="Senha (mínimo 6 caracteres) *">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b8e000]"
              />
            </Field>
            <Field label="Papel">
              <select
                value={form.role}
                onChange={(e) => setField('role', e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b8e000]"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {createError && <p className="mt-3 text-sm text-red-600">{createError}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateUser}
              disabled={creating}
              className="flex items-center gap-2 rounded-xl bg-[#b8e000] px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:opacity-60"
            >
              {creating && <Loader2 size={16} className="animate-spin" />}
              Criar usuário
            </button>
          </div>
        </div>
      )}

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
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="rounded-full bg-lime-100 px-2.5 py-1 text-xs font-medium text-lime-800">
                  {ROLE_LABELS[p.role] ?? p.role}
                </span>
                {p.id !== profile?.id && (
                  <button
                    type="button"
                    onClick={() => toggleAdmin(p)}
                    className="text-[11px] font-medium text-gray-400 hover:text-gray-900"
                  >
                    {p.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop/tablet: tabela */}
      <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm sm:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Papel</th>
              <th className="px-4 py-3 font-medium">Convidado por</th>
              <th className="px-4 py-3 font-medium">Entrou em</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
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
                  <td className="px-4 py-3">
                    {p.id !== profile?.id && (
                      <button
                        type="button"
                        onClick={() => toggleAdmin(p)}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                      >
                        {p.role === 'admin' ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        {p.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}
