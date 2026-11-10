import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ListaEspera from "./pages/ListaEspera";
import Adesao from "./pages/Adesao";
import Entrar from "./pages/Entrar";
import Area from "./pages/Area";
import Operador from "./pages/Operador";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lista-espera" element={<ListaEspera />} />
            <Route path="/adesao" element={<Adesao />} />
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/cadastro" element={<Navigate to="/adesao" replace />} />
            <Route path="/dashboard" element={<Navigate to="/area" replace />} />
            <Route path="/admin" element={<Navigate to="/operador" replace />} />
            <Route path="/area" element={<ProtectedRoute><Area /></ProtectedRoute>} />
            <Route path="/operador" element={<ProtectedRoute requireOperator><Operador /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
