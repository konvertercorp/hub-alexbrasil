import { useState } from 'react'
import { fetchAddressByCep } from '../utils/viacep'
import { forwardGeocode } from '../utils/geocoding'

export function useAddressLookup(form, setField) {
  const [cepLoading, setCepLoading] = useState(false)
  const [coordLoading, setCoordLoading] = useState(false)
  const [coordError, setCoordError] = useState('')

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

  return { cepLoading, coordLoading, coordError, handleCepBlur, handleBuscarCoordenadas }
}
