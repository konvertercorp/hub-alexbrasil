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
    <div className="min-h-screen bg-gradient-to-br from-white to-[#f2f4e6]">
      <Header appName="HUB AlexBrasil" backTo="/" />

      <main className="px-5 py-8">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-bold text-gray-900">Check-in</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sua posição em tempo real.
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
            {position ? (
              <LiveMap position={position} accuracy={accuracy} />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-gray-50">
                {loading ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">Obtendo localização...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-6 text-center text-sm text-red-600">
                    <MapPin className="h-6 w-6" />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {position && (
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#b8e000] py-3 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MapPin size={16} />
              Fazer check-in
            </button>
          ) : (
            <div className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nome do local ou evento
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(event) => setEventName(event.target.value)}
                  placeholder="Ex: Comício Bairro Central"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#b8e000]"
                />
                {formError && (
                  <p className="mt-1 text-xs text-red-600">{formError}</p>
                )}
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-gray-700">
                  Endereço
                </span>
                <p className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
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
                  className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCheckin}
                  className="flex-1 rounded-xl bg-[#b8e000] py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-[#a3cc00]"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          <h2 className="mt-8 text-sm font-semibold text-gray-700">
            Check-ins recentes
          </h2>
          <div className="mt-3 space-y-3">
            {checkins.length === 0 ? (
              <p className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
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
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold text-gray-900">{checkin.nome}</p>
          <p className="mt-0.5 text-xs text-gray-500">{checkin.endereco}</p>
          <p className="mt-1 text-[11px] text-gray-400">
            {formatDate(checkin.createdAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
