import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, LogOut } from 'lucide-react'

export default function Admin() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
          <span className="font-bold text-purple-700">Admin — Clube de Estética</span>
        </div>
        <Button variant="outline" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </header>
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Painel Administrativo</h1>
        <Card>
          <CardHeader><CardTitle>Painel em construção</CardTitle></CardHeader>
          <CardContent>
            <p className="text-gray-600">As funcionalidades serão implementadas em breve.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
