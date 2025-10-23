import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Estudos from "./pages/Estudos";
import EstudosCategoria from "./pages/EstudosCategoria";
import EstudoDetalhes from "./pages/EstudoDetalhes";
import Pregacoes from "./pages/Pregacoes";
import PregacaoDetalhes from "./pages/PregacaoDetalhes";
import Atualidades from "./pages/Atualidades";
import AtualidadeDetalhes from "./pages/AtualidadeDetalhes";
import Devocional from "./pages/Devocional";
import DevocionalDetalhes from "./pages/DevocionalDetalhes";
import Favoritos from "./pages/Favoritos";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/estudos" element={<Estudos />} />
            <Route path="/estudos/categoria/:categoria" element={<EstudosCategoria />} />
            <Route path="/estudos/:id" element={<EstudoDetalhes />} />
            <Route path="/pregacoes" element={<Pregacoes />} />
              <Route path="/pregacoes/:id" element={<PregacaoDetalhes />} />
              <Route path="/atualidades" element={<Atualidades />} />
              <Route path="/atualidades/:id" element={<AtualidadeDetalhes />} />
              <Route path="/devocional" element={<Devocional />} />
              <Route path="/devocional/:id" element={<DevocionalDetalhes />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
