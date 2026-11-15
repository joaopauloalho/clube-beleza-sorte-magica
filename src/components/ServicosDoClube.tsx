import { LISTA_SERVICOS_PLACEHOLDER, SERVICOS_DO_CLUBE } from '@/lib/servicos'

export function ServicosDoClube() {
  const linhas = SERVICOS_DO_CLUBE.length > 0
    ? SERVICOS_DO_CLUBE
    : [{ nome: LISTA_SERVICOS_PLACEHOLDER }]

  return (
    <div className="overflow-hidden rounded-[28px] bg-white">
      <table className="w-full text-left text-[15px]">
        <caption className="sr-only">Serviços do clube</caption>
        <thead>
          <tr className="border-b border-[#E4D9D3] text-[12px] text-[#6B5560]">
            <th className="px-5 py-3 font-medium" scope="col">Serviço</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((servico) => (
            <tr key={servico.nome} className="border-b border-[#E4D9D3] last:border-0">
              <td className="px-5 py-4 text-[#2A1420]">{servico.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
