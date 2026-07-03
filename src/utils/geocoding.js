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
