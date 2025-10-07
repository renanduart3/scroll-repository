import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronRight, Book, AlertTriangle, Users, Sparkles, Heart, UserCircle, Landmark, Eye, BookOpen, Lightbulb } from "lucide-react";
import { estudosCategorias } from "@/data/mockContent";

const iconMap: Record<string, any> = {
  "AlertTriangle": AlertTriangle,
  "Users": Users,
  "Sparkles": Sparkles,
  "Heart": Heart,
  "UserCircle": UserCircle,
  "Landmark": Landmark,
  "Eye": Eye,
  "BookOpen": BookOpen,
  "Lightbulb": Lightbulb,
  "Book": Book
};

const Estudos = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Estudos Bíblicos</h1>
        <p className="text-muted-foreground">Explore diferentes categorias de estudos profundos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {estudosCategorias.map((categoria) => {
          const Icon = iconMap[categoria.icon] || Book;
          return (
            <Link key={categoria.slug} to={`/estudos/categoria/${categoria.slug}`}>
              <Card className="group p-6 hover:shadow-medium transition-smooth cursor-pointer border-border hover:border-accent h-full">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-smooth" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-accent transition-smooth">
                      {categoria.nome}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {categoria.descricao}
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {categoria.quantidade} {categoria.quantidade === 1 ? 'estudo' : 'estudos'}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Estudos;
