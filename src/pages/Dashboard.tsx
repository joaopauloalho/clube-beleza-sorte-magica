import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <header className="bg-white border-b border-pink-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-pink-600" />
          <span className="font-bold text-pink-700">Clube de Estética</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Olá, {user?.email?.split('@')[0]} 👋
        </h1>
        <Card>
          <CardHeader><CardTitle>Sua área está sendo preparada</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600">Em breve você verá seu plano, grupo e posição no sorteio aqui.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
