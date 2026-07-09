import { UF_LIST } from './ufs'

const UF_NOME_TO_SIGLA = Object.fromEntries(UF_LIST.map((uf) => [uf.nome, uf.sigla]))

export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar endereço')
  }

  const data = await response.json()
  return data.display_name ?? null
}

// Como reverseGeocode, mas devolve os campos já separados (rua, bairro,
// município, UF, CEP) prontos para preencher o formulário do Pedido de Voto.
export async function reverseGeocodeStructured(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar endereço')
  }

  const data = await response.json()
  const address = data.address ?? {}

  return {
    logradouro: address.road ?? address.pedestrian ?? '',
    bairro: address.suburb ?? address.neighbourhood ?? address.city_district ?? '',
    municipio: address.city ?? address.town ?? address.village ?? address.municipality ?? '',
    uf: UF_NOME_TO_SIGLA[address.state] ?? '',
    cep: address.postcode ? address.postcode.replace(/\D/g, '') : '',
  }
}

export async function forwardGeocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=br`

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Falha ao buscar coordenadas')
  }

  const [result] = await response.json()
  if (!result) return null

  return { lat: Number(result.lat), lng: Number(result.lon) }
}
