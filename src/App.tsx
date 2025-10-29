import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";

// Lazy load pages for better performance
const Estudos = lazy(() => import("./pages/Estudos"));
const EstudosCategoria = lazy(() => import("./pages/EstudosCategoria"));
const EstudoDetalhes = lazy(() => import("./pages/EstudoDetalhes"));
const Pregacoes = lazy(() => import("./pages/Pregacoes"));
const PregacaoDetalhes = lazy(() => import("./pages/PregacaoDetalhes"));
const Atualidades = lazy(() => import("./pages/Atualidades"));
const AtualidadeDetalhes = lazy(() => import("./pages/AtualidadeDetalhes"));
const Devocional = lazy(() => import("./pages/Devocional"));
const DevocionalDetalhes = lazy(() => import("./pages/DevocionalDetalhes"));
const Favoritos = lazy(() => import("./pages/Favoritos"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Suspense fallback={
              <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                </div>
              </div>
            }>
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
            </Suspense>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
