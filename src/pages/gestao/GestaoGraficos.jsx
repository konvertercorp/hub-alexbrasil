import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { Map as MapIcon, Loader2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { supabase } from '../../lib/supabaseClient'

const SC_UF_CODE = 42
const MALHA_URL = `https://servicodados.ibge.gov.br/api/v2/malhas/${SC_UF_CODE}?formato=application/vnd.geo+json&resolucao=5&qualidade=minima&intrarregiao=municipio`
const MUNICIPIOS_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/SC/municipios'

const HEAT_STOPS = [
  { t: 0, c: [254, 240, 138] },
  { t: 0.5, c: [251, 146, 60] },
  { t: 1, c: [220, 38, 38] },
]

function heatColor(count, max) {
  if (!count) return '#e5e7eb'
  const t = Math.min(count / (max || 1), 1)
  let a = HEAT_STOPS[0]
  let b = HEAT_STOPS[HEAT_STOPS.length - 1]
  for (let i = 0; i < HEAT_STOPS.length - 1; i++) {
    if (t >= HEAT_STOPS[i].t && t <= HEAT_STOPS[i + 1].t) {
      a = HEAT_STOPS[i]
      b = HEAT_STOPS[i + 1]
      break
    }
  }
  const span = b.t - a.t || 1
  const localT = (t - a.t) / span
  const rgb = a.c.map((v, i) => Math.round(v + (b.c[i] - v) * localT))
  return `rgb(${rgb.join(',')})`
}

export function GestaoGraficos() {
  const [geoJson, setGeoJson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [malha, municipios, pedidos] = await Promise.all([
          fetch(MALHA_URL).then((r) => r.json()),
          fetch(MUNICIPIOS_URL).then((r) => r.json()),
          supabase.from('pedidos_voto').select('municipio, uf'),
        ])

        const codeToNome = new Map(municipios.map((m) => [String(m.id), m.nome]))
        const nomeCounts = new Map()
        for (const pedido of pedidos.data ?? []) {
          if (!pedido.municipio) continue
          if (pedido.uf && pedido.uf !== 'SC') continue
          const key = pedido.municipio.trim().toLowerCase()
          nomeCounts.set(key, (nomeCounts.get(key) ?? 0) + 1)
        }

        for (const feature of malha.features) {
          const nome = codeToNome.get(String(feature.properties.codarea)) ?? ''
          feature.properties.nome = nome
          feature.properties.count = nomeCounts.get(nome.trim().toLowerCase()) ?? 0
        }

        if (!cancelled) setGeoJson(malha)
      } catch {
        if (!cancelled) setError('Não foi possível carregar o mapa. Tente novamente.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const maxCount = useMemo(() => {
    if (!geoJson) return 0
    return geoJson.features.reduce((max, f) => Math.max(max, f.properties.count), 0)
  }, [geoJson])

  const topMunicipios = useMemo(() => {
    if (!geoJson) return []
    return [...geoJson.features]
      .filter((f) => f.properties.count > 0)
      .sort((a, b) => b.properties.count - a.properties.count)
      .slice(0, 10)
  }, [geoJson])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Gráficos</h1>
      <p className="mt-1 text-sm text-gray-500">Visualizações da distribuição de eleitores.</p>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <MapIcon size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Mapa de calor — Santa Catarina</h2>
            <p className="text-xs text-gray-500">Pedidos de voto por município</p>
          </div>
        </div>

        {error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : loading ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="mt-4 h-[420px] overflow-hidden rounded-xl border border-gray-200">
              <MapContainer
                center={[-27.4, -50.3]}
                zoom={7}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeoJSON
                  data={geoJson}
                  style={(feature) => ({
                    fillColor: heatColor(feature.properties.count, maxCount),
                    fillOpacity: 0.75,
                    color: '#ffffff',
                    weight: 0.5,
                  })}
                  onEachFeature={(feature, layer) => {
                    layer.bindTooltip(`${feature.properties.nome}: ${feature.properties.count} pedido(s)`)
                  }}
                />
              </MapContainer>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <span>Menos</span>
              <div className="h-2 max-w-xs flex-1 rounded-full bg-gradient-to-r from-[#fef08a] via-[#fb923c] to-[#dc2626]" />
              <span>Mais</span>
            </div>

            {topMunicipios.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Top 10 municípios
                </h3>
                <div className="mt-2 space-y-1.5">
                  {topMunicipios.map((f) => (
                    <div
                      key={f.properties.codarea}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-700">{f.properties.nome}</span>
                      <span className="font-semibold text-gray-900">{f.properties.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
