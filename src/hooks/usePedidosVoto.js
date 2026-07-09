import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { logActivity } from '../utils/activityLog'

function toRow(form, userId) {
  return {
    created_by: userId,
    nome: form.nome,
    apelido: form.apelido || null,
    telefone: form.telefone,
    cpf: form.cpf,
    data_nascimento: form.dataNascimento,
    voto: form.voto,
    tipo_contato: form.tipoContato,
    status: form.status,
    tags: form.tags,
    genero: form.genero,
    ocupacao: form.ocupacao || null,
    observacoes: form.observacoes || null,
    cep: form.cep || null,
    logradouro: form.logradouro || null,
    numero: form.numero || null,
    bairro: form.bairro || null,
    municipio: form.municipio || null,
    uf: form.uf || null,
    lat: form.coordenadas?.lat ?? null,
    lng: form.coordenadas?.lng ?? null,
    origem: form.origem,
  }
}

function fromRow(row) {
  return {
    id: row.id,
    nome: row.nome,
    apelido: row.apelido ?? '',
    telefone: row.telefone,
    cpf: row.cpf,
    dataNascimento: row.data_nascimento,
    voto: row.voto,
    tipoContato: row.tipo_contato,
    status: row.status,
    tags: row.tags ?? [],
    genero: row.genero,
    ocupacao: row.ocupacao ?? '',
    observacoes: row.observacoes ?? '',
    cep: row.cep ?? '',
    logradouro: row.logradouro ?? '',
    numero: row.numero ?? '',
    bairro: row.bairro ?? '',
    municipio: row.municipio ?? '',
    uf: row.uf ?? '',
    coordenadas: row.lat != null ? { lat: row.lat, lng: row.lng } : null,
    origem: row.origem,
    createdAt: row.created_at,
    createdBy: row.created_by,
  }
}

function computeStats(pedidos) {
  const total = pedidos.length
  const sim = pedidos.filter((p) => p.voto === 'sim').length
  const nao = total - sim
  return { total, sim, nao }
}

export function usePedidosVoto() {
  const { profile } = useAuth()
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const { data } = await supabase
      .from('pedidos_voto')
      .select('*')
      .order('created_at', { ascending: false })
    setPedidos((data ?? []).map(fromRow))
    setLoading(false)
  }, [])

  useEffect(() => {
    if (profile) fetchAll()
  }, [profile, fetchAll])

  const addPedido = useCallback(
    async (form) => {
      const { data, error } = await supabase
        .from('pedidos_voto')
        .insert(toRow(form, profile.id))
        .select()
        .single()
      if (error) throw error
      const entry = fromRow(data)
      setPedidos((prev) => [entry, ...prev])
      logActivity(profile.id, 'pedido_criado', 'pedido_voto', entry.id, { nome: entry.nome })
      return entry
    },
    [profile],
  )

  const updatePedido = useCallback(
    async (id, form) => {
      const { created_by, ...row } = toRow(form, null)
      const { data, error } = await supabase
        .from('pedidos_voto')
        .update(row)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      const entry = fromRow(data)
      setPedidos((prev) => prev.map((p) => (p.id === id ? entry : p)))
      logActivity(profile.id, 'pedido_editado', 'pedido_voto', entry.id, { nome: entry.nome })
      return entry
    },
    [profile],
  )

  return { pedidos, stats: computeStats(pedidos), addPedido, updatePedido, loading }
}
