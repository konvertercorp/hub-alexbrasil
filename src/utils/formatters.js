export function formatPhone(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)
  const splitAt = digits.length > 10 ? 5 : 4
  const part1 = rest.slice(0, splitAt)
  const part2 = rest.slice(splitAt)

  let out = `(${ddd}) ${part1}`
  if (part2) out += `-${part2}`
  return out
}

export function isValidPhone(rawValue) {
  const digits = rawValue.replace(/\D/g, '')
  return digits.length === 10 || digits.length === 11
}

export function formatCPF(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 11)
  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 9)
  const part4 = digits.slice(9, 11)

  let out = part1
  if (part2) out += `.${part2}`
  if (part3) out += `.${part3}`
  if (part4) out += `-${part4}`
  return out
}

export function formatCEP(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 8)
  const part1 = digits.slice(0, 5)
  const part2 = digits.slice(5, 8)
  return part2 ? `${part1}-${part2}` : part1
}

export function isValidCEP(rawValue) {
  return rawValue.replace(/\D/g, '').length === 8
}

export function formatDateBR(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  let out = day
  if (month) out += `/${month}`
  if (year) out += `/${year}`
  return out
}

export function isValidDateBR(rawValue) {
  const match = rawValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false
  const [, day, month, year] = match.map(Number)
  if (month < 1 || month > 12) return false
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false
  }
  return date <= new Date()
}

export function isValidCPF(rawValue) {
  const cpf = rawValue.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i)
  let checkDigit1 = 11 - (sum % 11)
  if (checkDigit1 >= 10) checkDigit1 = 0
  if (checkDigit1 !== Number(cpf[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i)
  let checkDigit2 = 11 - (sum % 11)
  if (checkDigit2 >= 10) checkDigit2 = 0
  if (checkDigit2 !== Number(cpf[10])) return false

  return true
}
