import { useState } from 'react'
import {
  MapPin,
  LocateFixed,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Header } from '../components/Header'
import { LiveMap } from '../components/LiveMap'
import { useGeolocation } from '../hooks/useGeolocation'
import { useCheckins } from '../hooks/useCheckins'
import { reverseGeocode } from '../utils/geocoding'

function formatDate(isoString) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function Localizacao() {
  const { position, accuracy, updatedAt, error, loading } = useGeolocation()
  const { checkins, addCheckin } = useCheckins()

  const [isCheckinOpen, setIsCheckinOpen] = useState(false)
  const [eventName, setEventName] = useState('')
  const [address, setAddress] = useState('')
  const [addressLoading, setAddressLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const openCheckin = async () => {
    if (!position) return
    setIsCheckinOpen(true)
    setEventName('')
    setFormError('')
    setAddress('')
    setAddressLoading(true)
    try {
      const result = await reverseGeocode(position.lat, position.lng)
      setAddress(result ?? 'Endereço não encontrado')
    } catch {
      setAddress('Não foi possível buscar o endereço')
    } finally {
      setAddressLoading(false)
    }
  }

  const handleConfirmCheckin = async () => {
    if (eventName.trim().length < 3) {
      setFormError('Informe o nome do local ou evento')
      return
    }
    try {
      await addCheckin({
        nome: eventName.trim(),
        endereco: address,
        lat: position.lat,
        lng: position.lng,
      })
      setIsCheckinOpen(false)
    } catch {
      setFormError('Não foi possível salvar o check-in. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1a4a] to-[#1e3a8a]">
      <Header appName="HUB AlexBrasil" backTo="/" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-bold text-white">Check-in</h1>
          <p className="mt-1 text-sm text-blue-200">
            Sua posição em tempo real.
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-white/15">
            {position ? (
              <LiveMap position={position} accuracy={accuracy} />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-white/5">
                {loading ? (
                  <div className="flex flex-col items-center gap-2 text-blue-200">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">Obtendo localização...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-6 text-center text-sm text-red-300">
                    <MapPin className="h-6 w-6" />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {position && (
            <div className="mt-3 flex items-center justify-between text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <LocateFixed size={14} />
                {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                {accuracy && ` · ±${Math.round(accuracy)}m`}
              </span>
              {updatedAt && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {updatedAt.toLocaleTimeString('pt-BR')}
                </span>
              )}
            </div>
          )}

          {!isCheckinOpen ? (
            <button
              type="button"
              onClick={openCheckin}
              disabled={!position}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MapPin size={16} />
              Fazer check-in
            </button>
          ) : (
            <div className="mt-4 space-y-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-blue-100">
                  Nome do local ou evento
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                  placeholder="Ex: Comício Bairro Central"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-blue-200/40 outline-none transition focus:ring-2 focus:ring-blue-400"
                />
                {formError && (
                  <p className="mt-1 text-xs text-red-300">{formError}</p>
                )}
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-blue-100">
                  Endereço
                </span>
                <p className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-blue-200">
                  {addressLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Buscando endereço...
                    </>
                  ) : (
                    address
                  )}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckinOpen(false)}
                  className="flex-1 rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCheckin}
                  className="flex-1 rounded-xl bg-blue-500 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-400"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          <h2 className="mt-8 text-sm font-semibold text-blue-100">
            Check-ins recentes
          </h2>
          <div className="mt-3 space-y-3">
            {checkins.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-blue-200">
                Nenhum check-in registrado ainda.
              </p>
            ) : (
              [...checkins]
                .reverse()
                .map((checkin, index) => (
                  <CheckinCard key={`${checkin.createdAt}-${index}`} checkin={checkin} />
                ))
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

function CheckinCard({ checkin }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <div>
          <p className="font-semibold text-white">{checkin.nome}</p>
          <p className="mt-0.5 text-xs text-blue-200">{checkin.endereco}</p>
          <p className="mt-1 text-[11px] text-blue-300/70">
            {formatDate(checkin.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
