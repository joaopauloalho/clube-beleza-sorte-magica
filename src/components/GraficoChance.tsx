import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { serieDeChance } from '@/lib/chance'

export function GraficoChance() {
  const dados = serieDeChance()

  return (
    <div className="h-80 w-full" role="img" aria-label="Gráfico da chance mensal e da chance acumulada ao longo de 12 meses">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="mes" tickFormatter={(mes) => `${mes}º`} stroke="hsl(var(--muted-foreground))" />
          <YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
          <Tooltip formatter={(valor: number, nome: string) => [`${valor}%`, nome]} labelFormatter={(mes) => `${mes}º mês`} />
          <Legend />
          <Line type="monotone" dataKey="mensal" name="Chance no mês" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="acumulada" name="Chance acumulada" stroke="hsl(var(--gold))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
