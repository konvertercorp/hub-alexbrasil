import { useEffect, useState } from 'react'

const cache = new Map()

export function useMunicipios(uf) {
  const [municipios, setMunicipios] = useState(() => cache.get(uf) ?? [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!uf) {
      setMunicipios([])
      return
    }

    if (cache.has(uf)) {
      setMunicipios(cache.get(uf))
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then((response) => response.json())
      .then((data) => {
        const names = data.map((m) => m.nome).sort((a, b) => a.localeCompare(b, 'pt-BR'))
        cache.set(uf, names)
        if (!cancelled) setMunicipios(names)
      })
      .catch(() => {
        if (!cancelled) setMunicipios([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [uf])

  return { municipios, loading }
}
