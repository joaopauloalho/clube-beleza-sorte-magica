import { useEffect, useState } from 'react'
import { carregarPlanosPublicos, planosCanonicos, type PlanoPublico } from './planos-publicos'

export function usePlanosPublicos(): PlanoPublico[] {
  const [planos, setPlanos] = useState<PlanoPublico[]>(planosCanonicos)

  useEffect(() => {
    let ativo = true
    carregarPlanosPublicos().then((lista) => {
      if (ativo) setPlanos(lista)
    }).catch(() => {
      if (ativo) setPlanos(planosCanonicos())
    })
    return () => {
      ativo = false
    }
  }, [])

  return planos
}
