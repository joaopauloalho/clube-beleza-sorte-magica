import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireOperator?: boolean
}

export function ProtectedRoute({ children, requireOperator = false }: ProtectedRouteProps) {
  const { session, isOperator, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!session) return <Navigate to="/entrar" replace />
  if (requireOperator && !isOperator) return <Navigate to="/area" replace />

  return <>{children}</>
}
