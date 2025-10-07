import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ChevronRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Content } from "@/data/mockContent";

const Favoritos = () => {
  const [favorites, setFavorites] = useState<(Content & { favoriteDate: string })[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(stored);
  };

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((f) => f.id !== id);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    toast.success("Removido dos favoritos");
  };

  const getCategoryLink = (category: string, id: string) => {
    switch (category) {
      case "estudos":
        return `/estudos/${id}`;
      case "pregacoes":
        return `/pregacoes/${id}`;
      case "devocional":
        return `/devocional/${id}`;
      default:
        return "/";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "estudos":
        return "Estudo Bíblico";
      case "pregacoes":
        return "Pregação";
      case "devocional":
        return "Devocional";
      default:
        return category;
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Favoritos</h1>
          <p className="text-muted-foreground">Seus conteúdos salvos</p>
        </div>
        
        <Card className="p-12 text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-serif font-bold mb-2">
            Nenhum favorito ainda
          </h3>
          <p className="text-muted-foreground mb-6">
            Comece a salvar seus estudos, pregações e devocionais favoritos!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/estudos">
              <Button>Explorar Estudos</Button>
            </Link>
            <Link to="/pregacoes">
              <Button variant="outline">Ver Pregações</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Favoritos</h1>
        <p className="text-muted-foreground">
          {favorites.length} {favorites.length === 1 ? "item salvo" : "itens salvos"}
        </p>
      </div>

      <div className="space-y-4">
        {favorites.map((item) => (
          <Card key={item.id} className="group p-6 border-border hover:border-accent transition-smooth">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {getCategoryLabel(item.category)}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Salvo em {new Date(item.favoriteDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <Link to={getCategoryLink(item.category, item.id)}>
                  <h3 className="text-xl font-serif font-bold mb-2 hover:text-accent transition-smooth">
                    {item.title}
                  </h3>
                </Link>
                
                <p className="text-muted-foreground mb-4">
                  {item.description}
                </p>

                <div className="flex gap-2">
                  <Link to={getCategoryLink(item.category, item.id)}>
                    <Button size="sm" variant="outline">
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Ler agora
                    </Button>
                  </Link>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFavorite(item.id)}
                  >
                    <Heart className="h-4 w-4 mr-1 fill-current" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Favoritos;
