# HUB AlexBrasil

PWA de campanha: cadastro de eleitores, pedido de voto, localização em tempo real com check-in, e uma rede de convites em hierarquia (Deputado → Líder) com autenticação real via Supabase.

## Stack

- React + Vite + Tailwind CSS v4
- vite-plugin-pwa (manifest + service worker)
- React Router
- Supabase (Auth + Postgres + Row Level Security)
- Leaflet / OpenStreetMap (mapa e geocodificação)
- qrcode.react (QR Codes de instalação e convite)

## Rodando localmente

```bash
npm install
```

Crie um arquivo `.env.local` (veja `.env.local.example`) com as credenciais do seu projeto Supabase:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publishable-aqui
```

Rode o schema em `supabase/schema.sql` no SQL Editor do seu projeto Supabase antes de usar o app (cria as tabelas, políticas de segurança e funções de convite).

No painel do Supabase, em **Authentication → Sign In / Providers → Email**, desative **"Confirm email"** (o app usa um e-mail sintético interno, que não recebe confirmação de verdade).

```bash
npm run dev
```

Acesse `/setup` uma única vez para criar a primeira conta (Deputado, topo da hierarquia). Depois disso, novas contas só entram por convite (`/convite/:code`), gerado dentro de "Minha Equipe".

## Build de produção

```bash
npm run build
```
