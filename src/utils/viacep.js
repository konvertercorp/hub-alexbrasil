export async function fetchAddressByCep(cep) {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
  if (!response.ok) throw new Error('Falha ao buscar CEP')

  const data = await response.json()
  if (data.erro) return null

  return {
    logradouro: data.logradouro ?? '',
    bairro: data.bairro ?? '',
    municipio: data.localidade ?? '',
    uf: data.uf ?? '',
  }
}
