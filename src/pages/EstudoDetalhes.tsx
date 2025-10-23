import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Share2, ChevronLeft } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ContentUpdater } from "@/services/ContentUpdater";

const EstudoDetalhes = () => {
  const { id } = useParams();
  const { content, loading, error } = useContent();
  const [isFavorite, setIsFavorite] = useState(false);
  const [estudoContent, setEstudoContent] = useState<string>("");

  const estudo = content?.estudos.find((e) => e.id === id);

  useEffect(() => {
    if (estudo) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.some((f: any) => f.id === estudo.id));
    }
  }, [estudo]);

  useEffect(() => {
    if (estudo) {
      const loadContent = async () => {
        // Tentar carregar do cache primeiro (IndexedDB ou localStorage)
        const updater = new ContentUpdater();
        const cachedContent = await updater.getMarkdownContent('estudos', estudo.id);
        
        if (cachedContent) {
          setEstudoContent(cachedContent);
        } else {
          // Fallback: tentar carregar do GitHub diretamente
          if (estudo.content_file) {
            fetch(`https://raw.githubusercontent.com/renanduart3/scroll-repository/master/estudos/${estudo.category}/${estudo.content_file}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Arquivo não encontrado: ${estudo.content_file}`);
                }
                return response.text();
              })
              .then(content => {
                // Verificar se é HTML (página de erro)
                if (content.includes('<!doctype html>')) {
                  throw new Error('Conteúdo não encontrado');
                }
                setEstudoContent(content);
              })
              .catch(err => {
                console.error('Erro ao carregar conteúdo:', err);
                setEstudoContent('Conteúdo não disponível. Clique em "Atualizar" para baixar o conteúdo mais recente.');
              });
          } else {
            setEstudoContent('Conteúdo não disponível. Clique em "Atualizar" para baixar o conteúdo mais recente.');
          }
        }
      };

      loadContent();
    }
  }, [estudo]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando estudo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Erro ao carregar conteúdo</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!estudo) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64">
        <p>Estudo não encontrado</p>
        <Link to="/estudos">
          <Button variant="outline" className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para Estudos
          </Button>
        </Link>
      </div>
    );
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    
    if (isFavorite) {
      const newFavorites = favorites.filter((f: any) => f.id !== estudo.id);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast.success("Removido dos favoritos");
    } else {
      favorites.push({ ...estudo, favoriteDate: new Date().toISOString() });
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Adicionado aos favoritos!");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: estudo.title,
        text: estudo.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64">
      <div className="mb-6">
        <Link to="/estudos">
          <Button variant="ghost" size="sm" className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para Estudos
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-4">{estudo.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{estudo.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <span>Por {estudo.author}</span>
            <span>•</span>
            <span>{new Date(estudo.date).toLocaleDateString('pt-BR')}</span>
            <span>•</span>
            <span>{estudo.reading_time} min de leitura</span>
            <span>•</span>
            <span className="capitalize">{estudo.difficulty}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {estudo.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={toggleFavorite}
            >
              <Heart className="h-4 w-4 mr-2" />
              {isFavorite ? "Favoritado" : "Favoritar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {estudo.bible_references && estudo.bible_references.length > 0 && (
          <div className="mb-8 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Referências Bíblicas</h3>
            <div className="flex flex-wrap gap-2">
              {estudo.bible_references.map((ref, index) => (
                <span key={index} className="px-3 py-1 bg-background text-foreground rounded border text-sm">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {estudoContent ? (
            <ReactMarkdown>{estudoContent}</ReactMarkdown>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando conteúdo...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstudoDetalhes;