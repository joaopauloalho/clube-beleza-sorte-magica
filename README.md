# Clube Beleza

Site do clube de assinatura da clínica. É uma SPA (Vite + React) com funções de servidor em `/api` e dados no Supabase **clube-beleza-sorte-magica** (ref `ooyyenjndsaptlxidgko`).

Este repositório não depende mais do Lovable. O deploy previsto é a Vercel.

## Desenvolvimento local

É preciso ter Node.js 20 ou mais recente.

```sh
npm i
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com os valores do projeto `ooyyenjndsaptlxidgko`. O arquivo não entra no Git.

## Deploy na Vercel

1. Importe este repositório na Vercel. O framework é Vite e a pasta de saída é `dist`.
2. O arquivo `vercel.json` já reescreve qualquer rota que não seja `/api/*` para `index.html`, para o React Router funcionar.
3. Defina as variáveis de ambiente abaixo no projeto da Vercel (Production e Preview). Não coloque segredo em variável com prefixo `VITE_`.
4. Rode as migrations no SQL Editor do Supabase **somente** no projeto `ooyyenjndsaptlxidgko`. A ordem está na seção [Migrations](#migrations).
5. Crie o primeiro operador com o SQL indicado nessa seção. Papel de admin não fica em `user_metadata`.
6. No painel de **teste** da AbacatePay, cadastre o webhook `https://SEU-DOMINIO/api/webhook/abacatepay?webhookSecret=SEU_SEGREDO`. Use somente chave e ambiente de teste.

`VITE_SUPABASE_URL` deve ser a URL desse projeto (`https://ooyyenjndsaptlxidgko.supabase.co`). Não aponte este app para nenhum outro projeto Supabase.

### Variáveis

| Variável | Onde | Uso |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | navegador | URL do projeto `ooyyenjndsaptlxidgko` |
| `VITE_SUPABASE_ANON_KEY` | navegador | chave anon/publishable desse projeto |
| `SUPABASE_URL` | só servidor | a mesma URL, lida pelas funções `/api` |
| `SUPABASE_SERVICE_ROLE_KEY` | só servidor | ignora RLS; lista de espera e webhook |
| `ABACATEPAY_API_KEY` | só servidor | chave de **teste**. O checkout avulso está desligado |
| `ABACATEPAY_WEBHOOK_SECRET` | só servidor | segredo que você escolhe ao criar o webhook (`webhookSecret` na URL) |
| `ABACATEPAY_WEBHOOK_PUBLIC_KEY` | só servidor | chave pública HMAC publicada pela AbacatePay em [Verificação e Segurança](https://docs.abacatepay.com/pages/webhooks/security) |
| `APP_URL` | só servidor | URL pública do app, sem barra no final |

A chave de serviço e as chaves da AbacatePay não podem aparecer no frontend nem no Git. O webhook recusa evento que não esteja em modo de teste (`devMode: true`).

Se a Vercel já tiver a variável antiga `ABACATEPAY_WEBHOOK_TOKEN`, o webhook ainda a aceita no lugar de `ABACATEPAY_WEBHOOK_SECRET`. Prefira o nome novo.

## Migrations

Rodar no SQL Editor do projeto `ooyyenjndsaptlxidgko`, nesta ordem:

1. `supabase/migrations/20261110220000_user_roles_and_rls.sql`
2. `supabase/migrations/20261110220100_consentimentos_e_webhooks.sql`

A lista de espera grava consentimento e o webhook grava evento processado. As duas migrations precisam estar aplicadas antes de usar essas funções. Nada disso foi aplicado automaticamente por este repositório.

Depois, no mesmo projeto, promova o usuário operador (troque o uuid pelo `id` em Authentication → Users):

```sql
insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'admin');
```

`admin` e `operador` acessam `/admin`. Quem não tem linha em `user_roles` não acessa, mesmo que edite o próprio `user_metadata`.

## O que o site faz agora

A entrada é lista de espera (nome, WhatsApp, aceite do regulamento e opt-in de WhatsApp separado). Ninguém é cobrado enquanto o grupo não tiver 24 pessoas. O checkout avulso da AbacatePay, que aceitava cartão, responde `410` e não cria cobrança. A cobrança futura é só Pix Automático, e o webhook em `/api/webhook/abacatepay` só trata evento de teste.

## Lovable

O Lovable sincronizava este repositório e pode voltar a gravar nele. Desligue essa sincronização antes de mergear. Um sync ativo pode reintroduzir o `lovable-tagger` e sobrescrever estas correções.
