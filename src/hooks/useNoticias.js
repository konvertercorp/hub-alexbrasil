import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useNoticias() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('noticias')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNoticias(data ?? [])
        setLoading(false)
      })
  }, [])

  return { noticias, loading }
}
