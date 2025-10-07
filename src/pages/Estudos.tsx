import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar, ChevronRight } from "lucide-react";
import { mockEstudos } from "@/data/mockContent";
import { Progress } from "@/components/ui/progress";

const Estudos = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Estudos Bíblicos</h1>
        <p className="text-muted-foreground">Mergulhe profundamente nas Escrituras Sagradas</p>
      </div>

      <div className="space-y-4">
        {mockEstudos.map((estudo) => (
          <Link key={estudo.id} to={`/estudos/${estudo.id}`}>
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
                      <span>~15 min</span>
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
        ))}
      </div>
    </div>
  );
};

export default Estudos;
