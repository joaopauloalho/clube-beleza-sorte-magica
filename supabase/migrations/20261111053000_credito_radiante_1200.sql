-- Clube Beleza. Só no projeto ooyyenjndsaptlxidgko.
-- Abaixa o crédito da Beleza Radiante de 1350 para 1200.
-- Casa pelo nome e pelo valor atual, então rodar de novo não altera quem já está em 1200.
-- Não mexe em mensalidade, desconto, bônus percentual nem em nenhuma outra linha.
-- Não há UPDATE nem DELETE em public.leads.
--
-- Reverter, se precisar:
-- update public.planos
-- set credito_sorteio = 1350
-- where nome = 'Beleza Radiante'
--   and credito_sorteio = 1200;

update public.planos
set credito_sorteio = 1200
where nome = 'Beleza Radiante'
  and credito_sorteio = 1350;
