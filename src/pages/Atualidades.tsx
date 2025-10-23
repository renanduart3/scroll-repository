import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, ChevronRight, Newspaper } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useContent } from "@/hooks/useContent";

const Atualidades = () => {
  const { content, loading, error } = useContent();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
        <p>Carregando atualidades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
        <p className="text-red-500">Erro ao carregar atualidades: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Atualidades</h1>
        <p className="text-muted-foreground">Notícias e atualizações do mundo cristão</p>
      </div>

      <div className="space-y-6">
        {content.atualidades.map((atualidade) => (
          <Link key={atualidade.id} to={`/atualidades/${atualidade.id}`}>
            <Card className="group p-6 hover:shadow-medium transition-smooth cursor-pointer border-border hover:border-accent mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-accent transition-smooth">
                    {atualidade.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {atualidade.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {atualidade.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{atualidade.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(atualidade.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>~{atualidade.reading_time} min</span>
                    </div>
                  </div>

                  {atualidade.progress > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progresso</span>
                        <span className="text-sm font-medium">{atualidade.progress}%</span>
                      </div>
                      <Progress value={atualidade.progress} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end md:justify-center">
                  <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-smooth" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {content.atualidades.length === 0 && (
        <Card className="p-8 text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma atualidade disponível ainda.</p>
        </Card>
      )}
    </div>
  );
};

export default Atualidades;
