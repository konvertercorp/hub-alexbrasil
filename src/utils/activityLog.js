import { supabase } from '../lib/supabaseClient'

// Fire-and-forget: falha ao gravar o log nunca deve travar a ação principal.
export function logActivity(actorId, action, entityType, entityId, details) {
  supabase
    .from('activity_log')
    .insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, details })
    .then(() => {})
}
