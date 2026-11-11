-- Clube Uniquas. Só no projeto ooyyenjndsaptlxidgko.
-- Atualiza o nome no texto de consentimento aceito daqui para a frente.
-- Não há UPDATE nem DELETE em public.leads.
-- Não renomeia planos, grupos nem o projeto.

create or replace function public.texto_consentimento(p_tipo text)
returns text
language sql
immutable
set search_path = public
as $$
  select case p_tipo
    when 'regulamento' then 'Aceito as regras publicadas do Clube Uniquas: grupo fechado de 24 pessoas no mesmo plano; cobrança somente por Pix Automático e somente quando o grupo completar 24 pessoas; todo mês 2 integrantes em dia são sorteadas; nos meses 4 e 8 há um sorteio extra, com 3 sorteadas, só entre quem está em dia; quem já foi sorteada não concorre de novo; quem para de pagar sai do sorteio; todas as integrantes em dia são sorteadas até o mês 11. [A DEFINIR: regras de atraso no pagamento] [A DEFINIR: regulamento]'
    when 'whatsapp_opt_in' then 'Aceito receber mensagens de WhatsApp sobre a minha participação no Clube Uniquas. Este aceite é opcional e separado do regulamento. [A DEFINIR: política de mensagens no WhatsApp]'
    else null
  end;
$$;
