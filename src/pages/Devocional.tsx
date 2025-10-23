import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useContent } from "@/hooks/useContent";
import { Calendar, ChevronRight } from "lucide-react";

const Devocional = () => {
  const { content, loading, error } = useContent();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando devocionais...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Erro ao carregar conteúdo</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Devocional Diário</h1>
        <p className="text-muted-foreground">Reflexões diárias para sua jornada espiritual</p>
      </div>

      <div className="space-y-6">
        {content.devocionais.map((devocional) => (
          <Link key={devocional.id} to={`/devocional/${devocional.id}`}>
            <Card className="group p-6 hover:shadow-medium transition-smooth cursor-pointer border-border hover:border-accent">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {new Date(devocional.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-accent transition-smooth">
                    {devocional.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {devocional.description}
                  </p>
                </div>

                <div className="flex items-center justify-end md:justify-center">
                  <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-smooth" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {content.devocionais.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum devocional disponível ainda.</p>
        </Card>
      )}
    </div>
  );
};

export default Devocional;