import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Share2, ChevronLeft } from "lucide-react";
import { mockDevocionais } from "@/data/mockContent";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const DevocionalDetalhes = () => {
  const { id } = useParams();
  const devocional = mockDevocionais.find((d) => d.id === id);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (devocional) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.some((f: any) => f.id === devocional.id));
    }
  }, [devocional]);

  if (!devocional) {
    return (
      <div className="container mx-auto px-4 py-8 md:ml-64">
        <p>Devocional não encontrado</p>
        <Link to="/devocional">
          <Button variant="outline" className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar para Devocional
          </Button>
        </Link>
      </div>
    );
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    
    if (isFavorite) {
      const newFavorites = favorites.filter((f: any) => f.id !== devocional.id);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast.success("Removido dos favoritos");
    } else {
      favorites.push({ ...devocional, favoriteDate: new Date().toISOString() });
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Adicionado aos favoritos!");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: devocional.title,
        text: devocional.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/devocional">
            <Button variant="ghost" size="sm" className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar para Devocional
            </Button>
          </Link>

          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {devocional.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            <span>{new Date(devocional.date).toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            <span>•</span>
            <span>~10 min de leitura</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Favoritado" : "Favoritar"}
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="bg-card rounded-xl p-8 shadow-soft border border-border">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-serif font-bold mt-8 mb-4 text-foreground">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-serif font-bold mt-6 mb-3 text-foreground">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-serif font-bold mt-4 mb-2 text-foreground">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed text-foreground">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-accent">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-primary">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-foreground">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground">{children}</ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-accent pl-4 italic my-4 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr className="my-8 border-border" />
                ),
              }}
            >
              {devocional.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevocionalDetalhes;
