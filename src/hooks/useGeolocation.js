import { useEffect, useState } from 'react'

export function useGeolocation() {
  const [state, setState] = useState({
    position: null,
    accuracy: null,
    updatedAt: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocalização não é suportada neste dispositivo.',
      }))
      return
    }

    const handleSuccess = (position) => {
      setState({
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        accuracy: position.coords.accuracy,
        updatedAt: new Date(position.timestamp),
        error: null,
        loading: false,
      })
    }

    const handleError = (error) => {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error.code === error.PERMISSION_DENIED
            ? 'Permissão de localização negada. Habilite o acesso nas configurações do navegador.'
            : 'Não foi possível obter sua localização.',
      }))
    }

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return state
}
