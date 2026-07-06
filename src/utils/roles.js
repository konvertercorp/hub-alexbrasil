export const ROLE_LABELS = {
  deputado: 'Deputado',
  lider: 'Líder',
  admin: 'Admin',
}

// Toda conta criada por convite entra como Líder — "Apoiador" não é mais
// um tipo de conta, é só o registro dentro do Pedido de Voto (sem login).
export const INVITEE_ROLE = 'lider'

// Por enquanto, todas as contas veem os mesmos módulos.
const VISIBLE_MODULES = ['localizacao', 'votos', 'equipe']

export function canAccessModule(_role, moduleKey) {
  return VISIBLE_MODULES.includes(moduleKey)
}

export function generateInviteCode() {
  return Math.random().toString(36).slice(2, 10)
}
