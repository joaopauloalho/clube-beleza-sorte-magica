-- Clube Beleza. Só no projeto ooyyenjndsaptlxidgko.
-- Sobe o crédito da Beleza Suprema de 1600 para 1700.
-- Casa pelo nome e pelo valor atual, então rodar de novo não altera quem já está em 1700.
-- Não mexe em mensalidade, desconto, bônus percentual nem em nenhuma outra linha.
-- Não há UPDATE nem DELETE em public.leads.
--
-- Reverter, se precisar:
-- update public.planos
-- set credito_sorteio = 1600
-- where nome = 'Beleza Suprema'
--   and credito_sorteio = 1700;

update public.planos
set credito_sorteio = 1700
where nome = 'Beleza Suprema'
  and credito_sorteio = 1600;
