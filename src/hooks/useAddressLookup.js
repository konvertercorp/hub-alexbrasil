import { useState } from 'react'
import { fetchAddressByCep } from '../utils/viacep'
import { forwardGeocode, reverseGeocodeStructured } from '../utils/geocoding'

export function useAddressLookup(form, setField) {
  const [cepLoading, setCepLoading] = useState(false)
  const [coordLoading, setCoordLoading] = useState(false)
  const [coordError, setCoordError] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  const handleCepBlur = async () => {
    if (form.cep.replace(/\D/g, '').length !== 8) return
    setCepLoading(true)
    try {
      const address = await fetchAddressByCep(form.cep)
      if (address) {
        if (address.logradouro) setField('logradouro', address.logradouro)
        if (address.bairro) setField('bairro', address.bairro)
        if (address.uf) setField('uf', address.uf)
        if (address.municipio) setField('municipio', address.municipio)
      }
    } catch {
      // CEP não encontrado — usuário preenche manualmente
    } finally {
      setCepLoading(false)
    }
  }

  const handleBuscarCoordenadas = async () => {
    const query = [form.logradouro, form.numero, form.bairro, form.municipio, form.uf, 'Brasil']
      .filter(Boolean)
      .join(', ')
    if (!form.bairro || !form.municipio) {
      setCoordError('Preencha bairro e município para buscar')
      return
    }
    setCoordLoading(true)
    setCoordError('')
    try {
      const result = await forwardGeocode(query)
      if (result) {
        setField('coordenadas', result)
      } else {
        setCoordError('Coordenadas não encontradas')
      }
    } catch {
      setCoordError('Falha ao buscar coordenadas')
    } finally {
      setCoordLoading(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocalização não é suportada neste dispositivo.')
      return
    }
    setLocationLoading(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        try {
          const address = await reverseGeocodeStructured(lat, lng)
          if (address.logradouro && !form.logradouro) setField('logradouro', address.logradouro)
          if (address.bairro && !form.bairro) setField('bairro', address.bairro)
          if (address.municipio && !form.municipio) setField('municipio', address.municipio)
          if (address.uf && !form.uf) setField('uf', address.uf)
          if (address.cep && !form.cep) setField('cep', address.cep)
          setField('coordenadas', { lat, lng })
        } catch {
          setLocationError('Não foi possível identificar o endereço da sua localização.')
        } finally {
          setLocationLoading(false)
        }
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? 'Permissão de localização negada.'
            : 'Não foi possível obter sua localização.',
        )
        setLocationLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  }

  return {
    cepLoading,
    coordLoading,
    coordError,
    locationLoading,
    locationError,
    handleCepBlur,
    handleBuscarCoordenadas,
    handleUseMyLocation,
  }
}
