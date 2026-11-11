import type { VercelRequest, VercelResponse } from '@vercel/node'
import { criarClienteAbacate, ForaDoModoTesteError } from '../_lib/abacatepay'
import { decidirCobranca, pixAutomaticoLigado } from '../_lib/cobranca'
import { clienteServico, usuarioDoBearer } from '../_lib/supabase-admin'
import { getPlanBySlug, precoEmCentavos } from '../../src/lib/plans'
import { apenasDigitos, normalizarWhatsapp } from '../../src/lib/validations'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const usuario = await usuarioDoBearer(req.headers.authorization)
    const admin = clienteServico()
    const membroBusca = await admin
      .from('membros')
      .select('id, grupo_id, plano_id, cota, status')
      .eq('user_id', usuario.id)
      .maybeSingle()
    if (!membroBusca.data) return res.status(404).json({ erro: 'Nenhuma cota para esta conta.' })

    const grupoBusca = await admin
      .from('grupos')
      .select('id, nome, vagas_preenchidas, total_vagas, cobranca_iniciada_em')
      .eq('id', membroBusca.data.grupo_id)
      .single()
    if (!grupoBusca.data) return res.status(404).json({ erro: 'Grupo não encontrado.' })

    const grupo = grupoBusca.data
    const decisao = decidirCobranca({
      vagas: grupo.vagas_preenchidas ?? 0,
      total: grupo.total_vagas ?? 24,
      pixAutomaticoLigado: pixAutomaticoLigado(),
    })

    if (!decisao.cobrar) {
      return res.status(200).json({
        cobranca: false,
        motivo: decisao.motivo,
        aviso: decisao.aviso,
        grupoNome: grupo.nome,
        cota: membroBusca.data.cota,
        vagas: grupo.vagas_preenchidas,
        total: grupo.total_vagas,
      })
    }

    const appUrl = process.env.APP_URL?.replace(/\/$/, '')
    if (!appUrl) return res.status(500).json({ erro: 'APP_URL ausente.' })

    const planoBusca = await admin.from('planos').select('id, nome, slug, preco, abacate_product_id').eq('id', membroBusca.data.plano_id).single()
    const plano = planoBusca.data
    const canonico = getPlanBySlug(plano?.slug)
    if (!plano || !canonico || Number(plano.preco) !== canonico.mensalidade) {
      return res.status(409).json({ erro: 'O plano no banco não está alinhado à fonte única. Cobrança não criada.' })
    }

    const abacate = criarClienteAbacate()
    let produtoId = plano.abacate_product_id as string | null
    if (!produtoId) {
      produtoId = await abacate.criarProduto({
        externalId: `clube-beleza-${canonico.slug}-mensal`,
        nome: `${canonico.nome} mensal`,
        precoCentavos: precoEmCentavos(canonico.mensalidade),
      })
      await admin.from('planos').update({ abacate_product_id: produtoId }).eq('id', plano.id)
    }

    const membrosBusca = await admin
      .from('membros')
      .select('id, cota, lead_id, leads!membros_lead_id_fkey(nome, email, cpf, whatsapp)')
      .eq('grupo_id', grupo.id)
    const assinaturasBusca = await admin.from('assinaturas').select('membro_id, checkout_id, checkout_url').eq('grupo_id', grupo.id)
    const jaCriadas = new Map((assinaturasBusca.data ?? []).map((item) => [item.membro_id, item]))

    let checkoutDaPessoa: { url: string; brCode: string | null; brCodeBase64: string | null } | null = null

    for (const item of membrosBusca.data ?? []) {
      const existente = jaCriadas.get(item.id)
      if (existente?.checkout_url) {
        if (item.id === membroBusca.data.id) {
          checkoutDaPessoa = { url: existente.checkout_url, brCode: null, brCodeBase64: null }
        }
        continue
      }

      const lead = Array.isArray(item.leads) ? item.leads[0] : item.leads
      if (!lead?.email || !lead.cpf || !lead.nome) continue

      const clienteId = await abacate.criarCliente({
        nome: lead.nome,
        email: lead.email,
        cpf: apenasDigitos(lead.cpf),
        celular: normalizarWhatsapp(lead.whatsapp ?? ''),
      })
      const checkout = await abacate.criarAssinaturaPix({
        productId: produtoId,
        externalId: item.id,
        customerId: clienteId,
        completionUrl: `${appUrl}/area`,
        returnUrl: `${appUrl}/adesao`,
      })

      await admin.from('assinaturas').upsert({
        membro_id: item.id,
        plano_id: plano.id,
        grupo_id: grupo.id,
        external_id: item.id,
        customer_id: clienteId,
        checkout_id: checkout.id,
        checkout_url: checkout.url,
        status: 'checkout_criado',
        dev_mode: true,
        metodo: 'PIX',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'membro_id' })

      await admin.from('membros').update({ status: 'aguardando_pix' }).eq('id', item.id).eq('status', 'aguardando_grupo')

      if (item.id === membroBusca.data.id) {
        checkoutDaPessoa = { url: checkout.url, brCode: checkout.brCode, brCodeBase64: checkout.brCodeBase64 }
      }
    }

    if (!grupo.cobranca_iniciada_em) {
      await admin.from('grupos').update({ cobranca_iniciada_em: new Date().toISOString() }).eq('id', grupo.id)
    }

    return res.status(200).json({
      cobranca: true,
      motivo: 'liberado',
      aviso: null,
      grupoNome: grupo.nome,
      cota: membroBusca.data.cota,
      vagas: grupo.vagas_preenchidas,
      total: grupo.total_vagas,
      checkoutUrl: checkoutDaPessoa?.url ?? null,
      brCode: checkoutDaPessoa?.brCode ?? null,
      brCodeBase64: checkoutDaPessoa?.brCodeBase64 ?? null,
    })
  } catch (error) {
    const status = error instanceof ForaDoModoTesteError ? 409 : (error as { status?: number }).status ?? 500
    const mensagem = error instanceof Error ? error.message : 'Falha ao preparar a cobrança.'
    return res.status(status).json({ erro: mensagem })
  }
}
