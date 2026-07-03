import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

function fromRow(row) {
  return {
    id: row.id,
    nome: row.nome,
    endereco: row.endereco,
    lat: row.lat,
    lng: row.lng,
    createdAt: row.created_at,
    createdBy: row.created_by,
  }
}

export function useCheckins() {
  const { profile } = useAuth()
  const [checkins, setCheckins] = useState([])

  useEffect(() => {
    if (!profile) return
    supabase
      .from('checkins')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setCheckins((data ?? []).map(fromRow)))
  }, [profile])

  const addCheckin = useCallback(
    async (checkin) => {
      const { data, error } = await supabase
        .from('checkins')
        .insert({
          created_by: profile.id,
          nome: checkin.nome,
          endereco: checkin.endereco,
          lat: checkin.lat,
          lng: checkin.lng,
        })
        .select()
        .single()
      if (error) throw error
      const entry = fromRow(data)
      setCheckins((prev) => [entry, ...prev])
      return entry
    },
    [profile],
  )

  return { checkins, addCheckin }
}
