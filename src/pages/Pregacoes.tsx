import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, ChevronRight } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { Progress } from "@/components/ui/progress";

const Pregacoes = () => {
  const { content, loading, error } = useContent();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando pregações...</p>
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
        <h1 className="text-4xl font-serif font-bold mb-2">Pregações</h1>
        <p className="text-muted-foreground">Mensagens inspiradoras e transformadoras</p>
      </div>

      <div className="space-y-6">
        {content.pregacoes.map((pregacao) => (
          <Link key={pregacao.id} to={`/pregacoes/${pregacao.id}`}>
            <Card className="group p-6 hover:shadow-medium transition-smooth cursor-pointer border-border hover:border-accent card-enhanced hover-lift fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-accent transition-smooth">
                    {pregacao.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {pregacao.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pregacao.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{pregacao.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(pregacao.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>~{pregacao.reading_time} min</span>
                    </div>
                  </div>

                  {pregacao.progress > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progresso</span>
                        <span className="text-sm font-medium">{pregacao.progress}%</span>
                      </div>
                      <Progress value={pregacao.progress} className="h-2" />
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

      {content.pregacoes.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma pregação disponível ainda.</p>
        </Card>
      )}
    </div>
  );
};

export default Pregacoes;