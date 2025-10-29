import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, ChevronRight, ArrowLeft } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const EstudosCategoria = () => {
  const { categoria } = useParams();
  const { content, loading, error } = useContent();
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando estudos...</p>
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

  const categoriaInfo = content.categorias.find(c => c.slug === categoria);
  const estudosCategoria = content.estudos.filter(e => e.category === categoria);

  if (!categoriaInfo) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
        <p>Categoria não encontrada</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
      <div className="mb-6">
        <Link to="/estudos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Categorias
          </Button>
        </Link>
        <h1 className="text-4xl font-serif font-bold mb-2">{categoriaInfo.nome}</h1>
        <p className="text-muted-foreground">{categoriaInfo.descricao}</p>
      </div>

      <div className="space-y-6">
        {estudosCategoria.map((estudo) => (
          <div key={estudo.id} className="block">
            <Link to={`/estudos/${estudo.id}`} className="block">
              <Card className="group p-6 hover:shadow-medium transition-smooth cursor-pointer border-border hover:border-accent">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-accent transition-smooth">
                      {estudo.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {estudo.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {estudo.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{estudo.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(estudo.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>~{estudo.reading_time} min</span>
                      </div>
                    </div>

                    {estudo.progress > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Progresso</span>
                          <span className="text-sm font-medium">{estudo.progress}%</span>
                        </div>
                        <Progress value={estudo.progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end md:justify-center">
                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-smooth" />
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      {estudosCategoria.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum estudo disponível nesta categoria ainda.</p>
        </Card>
      )}
    </div>
  );
};

export default EstudosCategoria;