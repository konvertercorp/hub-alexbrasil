import { isValidPhone, isValidCPF, isValidDateBR } from './formatters'

export function validatePedidoVoto(form) {
  const errors = {}

  if (form.nome.trim().length < 3) {
    errors.nome = 'Informe o nome completo'
  }
  if (!isValidPhone(form.telefone)) {
    errors.telefone = 'Telefone inválido'
  }
  if (form.cpf && !isValidCPF(form.cpf)) {
    errors.cpf = 'CPF inválido'
  }
  if (form.dataNascimento && !isValidDateBR(form.dataNascimento)) {
    errors.dataNascimento = 'Data de nascimento inválida'
  }
  if (!form.voto) {
    errors.voto = 'Selecione uma opção'
  }

  return errors
}
