import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Share2, ChevronLeft, User, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useContent } from "@/hooks/useContent";
import { ContentUpdater } from "@/services/ContentUpdater";

const AtualidadeDetalhes = () => {
  const { id } = useParams();
  const { content, loading, error } = useContent();
  const atualidade = content.atualidades.find((a) => a.id === id);
  const [isFavorite, setIsFavorite] = useState(false);
  const [atualidadeContent, setAtualidadeContent] = useState<string>('');

  useEffect(() => {
    if (atualidade) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.some((f: any) => f.id === atualidade.id));
    }
  }, [atualidade]);

  useEffect(() => {
    if (atualidade) {
      const loadContent = async () => {
        // Tentar carregar do cache primeiro (IndexedDB ou localStorage)
        const updater = new ContentUpdater();
        const cachedContent = await updater.getMarkdownContent('atualidades', atualidade.id);
        
        if (cachedContent) {
          setAtualidadeContent(cachedContent);
        } else {
          // Fallback: tentar carregar do GitHub diretamente
          if (atualidade.content_file) {
            fetch(`https://raw.githubusercontent.com/renanduart3/scroll-repository/master/atualidades/${atualidade.content_file}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Arquivo não encontrado: ${atualidade.content_file}`);
                }
                return response.text();
              })
              .then(content => {
                // Verificar se é HTML (página de erro)
                if (content.includes('<!doctype html>')) {
                  throw new Error('Conteúdo não encontrado');
                }
                setAtualidadeContent(content);
              })
              .catch(err => {
                console.error('Erro ao carregar conteúdo:', err);
                setAtualidadeContent('Conteúdo não disponível. Clique em "Atualizar" para baixar o conteúdo mais recente.');
              });
          } else {
            setAtualidadeContent('Conteúdo não disponível. Clique em "Atualizar" para baixar o conteúdo mais recente.');
          }
        }
      };

      loadContent();
    }
  }, [atualidade]);

  const toggleFavorite = () => {
    if (!atualidade) return;
    
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const isCurrentlyFavorite = favorites.some((f: any) => f.id === atualidade.id);
    
    if (isCurrentlyFavorite) {
      const updatedFavorites = favorites.filter((f: any) => f.id !== atualidade.id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast.success("Removido dos favoritos");
    } else {
      const newFavorite = {
        id: atualidade.id,
        title: atualidade.title,
        type: 'atualidade',
        date: atualidade.date
      };
      favorites.push(newFavorite);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Adicionado aos favoritos");
    }
  };

  const shareContent = async () => {
    if (!atualidade) return;
    
    const shareData = {
      title: atualidade.title,
      text: atualidade.description,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência");
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast.error("Erro ao compartilhar");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64">
        <div className="flex items-center justify-center h-64">
          <p>Carregando atualidade...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64">
        <p className="text-red-500">Erro ao carregar atualidade: {error}</p>
      </div>
    );
  }

  if (!atualidade) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64">
        <p>Atualidade não encontrada</p>
        <Link to="/atualidades">
          <Button variant="outline" className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para Atualidades
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/atualidades">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar para Atualidades
            </Button>
          </Link>
          
          <h1 className="text-4xl font-serif font-bold mb-4">{atualidade.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{atualidade.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
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
              <span>~{atualidade.reading_time} min de leitura</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {atualidade.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Favorito' : 'Adicionar aos Favoritos'}
            </Button>
            <Button variant="outline" size="sm" onClick={shareContent}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          <div className="bg-card rounded-xl p-8 shadow-soft border border-border">
            {atualidadeContent ? (
              <ReactMarkdown>{atualidadeContent}</ReactMarkdown>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando conteúdo...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtualidadeDetalhes;
