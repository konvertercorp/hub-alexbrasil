import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { logActivity } from '../../utils/activityLog'

const BLANK_FORM = { titulo: '', texto: '', imagem_url: '', link_url: '', ativo: true }

export function GestaoNoticias() {
  const { profile } = useAuth()
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })
    setNoticias(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const startCreate = () => {
    setEditingId(null)
    setForm(BLANK_FORM)
    setError('')
    setShowForm(true)
  }

  const startEdit = (noticia) => {
    setEditingId(noticia.id)
    setForm({
      titulo: noticia.titulo,
      texto: noticia.texto ?? '',
      imagem_url: noticia.imagem_url ?? '',
      link_url: noticia.link_url ?? '',
      ativo: noticia.ativo,
    })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => setShowForm(false)

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      setError('O título é obrigatório.')
      return
    }
    setSaving(true)
    setError('')
    const row = {
      titulo: form.titulo.trim(),
      texto: form.texto.trim() || null,
      imagem_url: form.imagem_url.trim() || null,
      link_url: form.link_url.trim() || null,
      ativo: form.ativo,
    }
    const query = editingId
      ? supabase.from('noticias').update(row).eq('id', editingId).select().single()
      : supabase.from('noticias').insert(row).select().single()
    const { data, error: saveError } = await query
    setSaving(false)
    if (saveError) {
      setError('Não foi possível salvar. Tente novamente.')
      return
    }
    logActivity(
      profile.id,
      editingId ? 'noticia_editada' : 'noticia_criada',
      'noticia',
      data.id,
      { titulo: data.titulo },
    )
    setShowForm(false)
    fetchAll()
  }

  const toggleAtivo = async (noticia) => {
    await supabase.from('noticias').update({ ativo: !noticia.ativo }).eq('id', noticia.id)
    logActivity(profile.id, 'noticia_status_alterado', 'noticia', noticia.id, {
      titulo: noticia.titulo,
      ativo: !noticia.ativo,
    })
    fetchAll()
  }

  const handleDelete = async (noticia) => {
    if (!window.confirm(`Excluir a notícia "${noticia.titulo}"?`)) return
    await supabase.from('noticias').delete().eq('id', noticia.id)
    logActivity(profile.id, 'noticia_excluida', 'noticia', noticia.id, { titulo: noticia.titulo })
    fetchAll()
  }

  return (
    <div>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie o carrossel exibido no Dashboard.</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-2 rounded-xl bg-[#b8e000] px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00]"
        >
          <Plus size={16} />
          Nova notícia
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-2xl border-2 border-[#b8e000] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              {editingId ? 'Editar notícia' : 'Nova notícia'}
            </h2>
            <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-900">
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <Field label="Título *">
              <input
                type="text"
                value={form.titulo}
                onChange={(e) => setField('titulo', e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b8e000]"
              />
            </Field>
            <Field label="URL do link (opcional)">
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => setField('link_url', e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b8e000]"
              />
            </Field>
            <Field label="URL da imagem (opcional)" className="lg:col-span-2">
              <input
                type="text"
                value={form.imagem_url}
                onChange={(e) => setField('imagem_url', e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b8e000]"
              />
            </Field>
            <Field label="Texto" className="lg:col-span-2">
              <textarea
                value={form.texto}
                onChange={(e) => setField('texto', e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#b8e000]"
              />
            </Field>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setField('ativo', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#7a9c00] focus:ring-[#b8e000]"
            />
            Ativa (visível no carrossel)
          </label>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#b8e000] px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : noticias.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma notícia cadastrada ainda.</p>
        ) : (
          noticias.map((noticia) => (
            <div
              key={noticia.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3">
                {noticia.imagem_url ? (
                  <img
                    src={noticia.imagem_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-100 sm:h-14 sm:w-14" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{noticia.titulo}</p>
                  {noticia.texto && (
                    <p className="truncate text-xs text-gray-500">{noticia.texto}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:shrink-0">
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    noticia.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {noticia.ativo ? 'Ativa' : 'Inativa'}
                </span>
                <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
                  <button
                    type="button"
                    onClick={() => toggleAtivo(noticia)}
                    aria-label={noticia.ativo ? 'Desativar' : 'Ativar'}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    {noticia.ativo ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(noticia)}
                    aria-label="Editar"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(noticia)}
                    aria-label="Excluir"
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}
