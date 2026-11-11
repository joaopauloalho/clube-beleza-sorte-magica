-- Clube Beleza. Só no projeto ooyyenjndsaptlxidgko.
-- Sobe o crédito da Beleza Radiante de 1125 para 1350.
-- Casa pelo nome e pelo valor atual, então rodar de novo não altera quem já está em 1350.
-- Não mexe em mensalidade, desconto, bônus percentual nem em nenhuma outra linha.
-- Não há UPDATE nem DELETE em public.leads.
--
-- Reverter, se precisar:
-- update public.planos
-- set credito_sorteio = 1125
-- where nome = 'Beleza Radiante'
--   and credito_sorteio = 1350;

update public.planos
set credito_sorteio = 1350
where nome = 'Beleza Radiante'
  and credito_sorteio = 1125;
