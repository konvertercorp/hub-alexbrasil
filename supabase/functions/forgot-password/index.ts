// Edge Function: recebe um e-mail, localiza a conta correspondente e
// envia um código de 6 dígitos por e-mail via Resend (em vez de um link —
// links de recuperação costumam ser "clicados" automaticamente por
// verificadores de segurança de e-mail, o que invalida o token antes da
// pessoa abrir de verdade). A conta em si é autenticada por telefone, então
// o código é gerado para o e-mail sintético usado internamente no login;
// devolvemos o telefone associado para o front-end conseguir verificar o
// código na etapa seguinte.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return jsonResponse({ success: false, error: 'E-mail é obrigatório.' }, 400)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    const { data: profileRows } = await supabaseAdmin.rpc(
      'get_profile_for_password_reset_by_email',
      { email_input: email.trim() },
    )
    const profile = profileRows?.[0]

    // E-mail não encontrado: responde sucesso mesmo assim, sem enviar
    // nada — evita que alguém descubra quais e-mails têm conta só
    // testando essa tela.
    if (!profile?.telefone || !resendApiKey) {
      return jsonResponse({ success: true })
    }

    const digits = profile.telefone.replace(/\D/g, '')
    const syntheticEmail = `${digits}@example.com`

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: syntheticEmail,
    })

    const code = linkData?.properties?.email_otp
    if (linkError || !code) {
      return jsonResponse({ success: true })
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: profile.email,
        subject: 'Seu código para redefinir a senha — HUB AlexBrasil',
        html: `
          <p>Olá, ${profile.nome ?? ''}!</p>
          <p>Recebemos um pedido para redefinir a senha da sua conta no HUB AlexBrasil.</p>
          <p>Digite este código no app para continuar:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:4px;">${code}</p>
          <p>O código vale por alguns minutos. Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.</p>
        `,
      }),
    })

    return jsonResponse({ success: true, telefone: profile.telefone })
  } catch {
    return jsonResponse({ success: true })
  }
})
