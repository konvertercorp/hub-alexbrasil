// Edge Function: recebe um telefone, localiza a conta correspondente e,
// se ela tiver um e-mail cadastrado, envia um link de redefinição de senha
// via Resend. Sempre responde com sucesso genérico (não revela se o
// telefone existe ou tem e-mail) para não permitir enumeração de contas.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const APP_URL = 'https://hubalexbrasil.com.br'
const FROM_EMAIL = 'HUB AlexBrasil <naoresponda@hubalexbrasil.com.br>'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { telefone } = await req.json()
    if (!telefone || typeof telefone !== 'string') {
      return jsonResponse({ success: false, error: 'Telefone é obrigatório.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: profileRows } = await supabaseAdmin.rpc('get_profile_for_password_reset', {
      phone: telefone,
    })
    const profile = profileRows?.[0]

    // Telefone não encontrado ou sem e-mail cadastrado: responde sucesso
    // mesmo assim, sem enviar nada — evita que alguém descubra quais
    // telefones têm conta só testando essa tela.
    if (!profile?.email || !resendApiKey) {
      return jsonResponse({ success: true })
    }

    const digits = telefone.replace(/\D/g, '')
    const syntheticEmail = `${digits}@example.com`

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: syntheticEmail,
      options: { redirectTo: `${APP_URL}/redefinir-senha` },
    })

    if (linkError || !linkData?.properties?.action_link) {
      return jsonResponse({ success: true })
    }

    const actionLink = linkData.properties.action_link

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: profile.email,
        subject: 'Redefinir sua senha — HUB AlexBrasil',
        html: `
          <p>Olá, ${profile.nome ?? ''}!</p>
          <p>Recebemos um pedido para redefinir a senha da sua conta no HUB AlexBrasil.</p>
          <p><a href="${actionLink}" style="display:inline-block;background:#b8e000;color:#111827;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Redefinir senha</a></p>
          <p>Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.</p>
        `,
      }),
    })

    return jsonResponse({ success: true })
  } catch {
    return jsonResponse({ success: true })
  }
})
