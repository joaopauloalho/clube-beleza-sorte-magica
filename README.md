# Clube Beleza

Aplicação do clube: lista de espera, adesão em três passos, área da integrante e painel de operação. O visual (cores, fontes, tokens e componentes) é o que já estava no projeto. A Vercel publica o `main` deste repositório em https://clube-beleza-sorte-magica.vercel.app. Não faça merge sem querer: o merge entra no ar.

O projeto Supabase é só o `ooyyenjndsaptlxidgko`. Não use o projeto `pvkrwjryvwsfwaxougyy`.

## Desenvolvimento

```sh
npm install
cp .env.example .env.local
npm run dev
npm test
npm run build
```

O Vite sobe em http://localhost:8080. A lista de espera funciona só com a URL e a chave anon do Supabase. Ela não chama a AbacatePay.

## Variáveis

Nada de segredo no código nem no navegador. Chave de serviço e chave da AbacatePay ficam só na Vercel, sem prefixo `VITE_`.

| Variável | Onde | O que é |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | navegador | `https://ooyyenjndsaptlxidgko.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | navegador | chave anon/publishable desse projeto |
| `SUPABASE_URL` | servidor | a mesma URL |
| `SUPABASE_SERVICE_ROLE_KEY` | servidor | chave service role |
| `ABACATEPAY_API_KEY` | servidor | chave **v2** de **devMode** |
| `ABACATEPAY_WEBHOOK_SECRET` | servidor | segredo de 32 caracteres ou mais, definido ao criar o webhook |
| `ABACATEPAY_PIX_AUTOMATICO_ENABLED` | servidor | `true` só depois que o Pix Automático estiver liberado. Qualquer outro valor, inclusive vazio, deixa a cobrança desligada |
| `APP_URL` | servidor | URL pública, sem barra no final |
| `ABACATE_PAY_API_KEY` | ambiente do Cursor | a mesma chave v2 de devMode, para o MCP. Não vai para a Vercel |

A base da API é `https://api.abacatepay.com/v2`, com `Authorization: Bearer`. Dev e produção usam a mesma URL. Quem decide o modo é a chave. Chave v1 não serve na v2. Se a resposta ou o evento não vier com `devMode: true`, o servidor recusa.

## Deploy na Vercel

1. O projeto já aponta para este repositório. Confira as variáveis acima em Production e Preview.
2. `vercel.json` reescreve qualquer rota fora de `/api` para `index.html`. As funções em `/api` continuam serverless.
3. Não coloque a service role nem a chave da AbacatePay em variável `VITE_`.
4. Um push no `main` publica. Este repositório não deve receber merge enquanto a revisão não acabar.

## Migrations

Ainda **não foram aplicadas**. Rode no SQL Editor do projeto `ooyyenjndsaptlxidgko`, nesta ordem:

1. `supabase/migrations/20261110230000_papeis_e_fim_do_user_metadata.sql`
2. `supabase/migrations/20261110230100_tabelas_do_clube.sql`
3. `supabase/migrations/20261110230200_funcoes_rls_e_planos.sql`
4. `supabase/migrations/20261111040200_credito_suprema_1700.sql`

São idempotentes. Não há `UPDATE` nem `DELETE` em `public.leads`. As 5 leads continuam como estão, inclusive o WhatsApp repetido: a coluna nova `dedupe_whatsapp` nasce `false` para as linhas que já existem e o índice único vale só onde ela é `true`. Linhas novas entram no índice. Se o WhatsApp já existir em qualquer lead, a função devolve “já cadastrado” ou recusa a adesão, sem alterar a linha antiga.

Os 3 planos permanecem nas mesmas linhas, achados pelo nome. Na primeira execução, preço, crédito, brinde e desconto anteriores vão para colunas `*_legado`. Em seguida os números comerciais passam a ser os da fonte única (`src/lib/plans.ts`): Essencial 50/600/700/17%/10%, Radiante 75/900/1125/25%/15%, Suprema 100/1200/1700/33%/20%. A migration 4 só faz o crédito da Suprema ir de 1600 para 1700, pelo nome, e não foi aplicada. O texto de brinde antigo não é apagado; a interface não o exibe. O bônus em serviços mostrado no site é o crédito menos as 12 mensalidades.

Papel de admin ou operador, com o uuid de Authentication → Users:

```sql
insert into public.user_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000000', 'admin');
```

`operador` também entra no painel. O papel não vem de `user_metadata`. Sem a linha, a pessoa não entra no painel mesmo que edite o próprio metadata.

## AbacatePay, só teste

Pix Automático precisa estar habilitado na conta, também no modo de teste. Enquanto não estiver, deixe `ABACATEPAY_PIX_AUTOMATICO_ENABLED` fora de `true`. A adesão termina na confirmação da cota e mostra `[A DEFINIR: liberação do Pix Automático na AbacatePay]`. Ninguém é cobrado.

Quando a flag estiver `true` e o grupo chegar a 24:

1. Cria um produto com `cycle: MONTHLY`, sem `trialDays`.
2. `POST /v2/subscriptions/create` com um único item, `methods: ["PIX"]`, `externalId`, `customerId`, `completionUrl` e `returnUrl`. Não envia cupom: cupom e `trialDays` não valem para PIX.
3. Isso cria um checkout (`bill_`). A assinatura (`subs_`) só existe depois do pagamento. O webhook `subscription.completed` é quem ativa.
4. A `retryPolicy` não é enviada. Na documentação, ela não se aplica ao Pix Automático, porque quem debita é o banco. O webhook ainda trata `max_payment_retries_exceeded` se o evento chegar.

Webhook: `https://SEU-DOMINIO/api/webhook/abacatepay?webhookSecret=SEU_SEGREDO`

Eventos: `subscription.completed`, `subscription.renewed`, `subscription.payment_failed`, `subscription.cancelled`.

O endpoint confere o segredo (`X-Webhook-Secret` ou `webhookSecret`) e a assinatura `X-Webhook-Signature` (HMAC-SHA256 com a chave pública da documentação, sobre o corpo cru). Evento repetido cai na chave primária de `webhook_eventos` e responde 200 sem processar de novo. `devMode` diferente de `true` responde 422 e não grava efeito. `subscription.payment_failed` cobre saldo insuficiente. `subscription.cancelled` cobre revogação no app do banco (`pix_automatic_authorization_refused`) e cancelamento depois das tentativas.

`POST /api/dev/simular-pagamento` chama `POST /v2/transparents/simulate-payment` e só segue se a resposta estiver em devMode. Serve para QR de checkout transparente, não para autorizar o Pix Automático. Exige papel de operador.

O checkout avulso antigo responde 410 e não chama a AbacatePay.

## MCP da AbacatePay

Há duas entradas em `.cursor/mcp.json`. Use uma. Com as duas ligadas, as ferramentas aparecem duplicadas.

**Local, como na documentação.** O caminho no JSON é `${workspaceFolder}/...`, que o Cursor resolve para absoluto. Caminho relativo quebra.

```sh
export ABACATE_PAY_API_KEY=   # chave v2 de devMode, fora do git
npm run mcp:abacatepay
```

O script clona https://github.com/AbacatePay/abacatepay-mcp em `tools/abacatepay-mcp` (gitignored) e roda `bun install`. O servidor `abacate-pay` executa `bun` com `tools/abacatepay-mcp/src/index.ts` e lê `ABACATE_PAY_API_KEY` do ambiente.

**Remoto, sem instalar.** O servidor `abacatepay` aponta para `https://mcp.abacatepay.com/mcp` e manda `Authorization: Bearer ${env:ABACATE_PAY_API_KEY}`. A chave também não fica no arquivo.

## O que o João ainda configura

- Criar a chave v2 de devMode e colocá-la na Vercel (`ABACATEPAY_API_KEY`) e no ambiente local (`ABACATE_PAY_API_KEY` para o MCP).
- Pedir ao suporte da AbacatePay a liberação do Pix Automático, também no teste. Só então `ABACATEPAY_PIX_AUTOMATICO_ENABLED=true`.
- Criar o webhook v2 em devMode na URL acima, com os quatro eventos de assinatura.
- Rodar as três migrations e inserir o próprio usuário em `user_roles`.
- Desligar a sincronização do Lovable com este repositório **antes** de mergear. Um sync recoloca o fluxo antigo por cima desta versão.

## Pendências no texto

Tudo que ainda não foi decidido aparece como `[A DEFINIR: ...]`: regulamento, política de cancelamento, se o crédito soma com o desconto de membro, se o crédito sai de uma vez ou em etapas, validade, serviços elegíveis, gateway e tempo mínimo de CNPJ para Pix Automático, liberação do Pix Automático na conta, política de WhatsApp e vínculo das leads já existentes com uma conta nova.
