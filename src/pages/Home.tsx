import { Link } from "react-router-dom";
import { Book, Mic2, Calendar, Heart, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useContent } from "@/hooks/useContent";

const Home = () => {
  const { content, metadata } = useContent();
  
  const modules = [
    {
      title: "Estudos Bíblicos",
      description: "Mergulhe profundamente nas Escrituras",
      icon: Book,
      href: "/estudos",
      gradient: "gradient-primary",
    },
    {
      title: "Pregações",
      description: "Mensagens inspiradoras e transformadoras",
      icon: Mic2,
      href: "/pregacoes",
      gradient: "gradient-accent",
    },
    {
      title: "Devocional",
      description: "Reflexões diárias para sua jornada",
      icon: Calendar,
      href: "/devocional",
      gradient: "gradient-primary",
    },
    {
      title: "Atualidades",
      description: "Perspectiva bíblica sobre o mundo atual",
      icon: TrendingUp,
      href: "/atualidades",
      gradient: "gradient-accent",
    },
    {
      title: "Favoritos",
      description: "Seus conteúdos salvos",
      icon: Heart,
      href: "/favoritos",
      gradient: "gradient-accent",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64">
      {/* Hero Section */}
      <div className="mb-12 gradient-hero rounded-2xl p-8 md:p-12 shadow-medium decorative-pattern">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
          Bem-vindo à Palavra Viva
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
          Explore estudos bíblicos, pregações inspiradoras e reflexões diárias que transformarão sua jornada espiritual.
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.title} to={module.href}>
              <Card className="group h-full p-6 hover:shadow-medium transition-smooth cursor-pointer border-border hover:border-accent card-enhanced hover-lift">
                <div className="flex flex-col items-start gap-4">
                  <div className={`${module.gradient} p-3 rounded-xl shadow-soft group-hover:shadow-glow transition-smooth`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold mb-2 group-hover:text-accent transition-smooth">
                      {module.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center shadow-soft stat-card hover-lift">
          <div className="text-3xl font-bold text-primary mb-1">{content?.estudos?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Estudos Bíblicos</div>
        </Card>
        <Card className="p-6 text-center shadow-soft stat-card hover-lift">
          <div className="text-3xl font-bold text-primary mb-1">{content?.pregacoes?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Pregações</div>
        </Card>
        <Card className="p-6 text-center shadow-soft stat-card hover-lift">
          <div className="text-3xl font-bold text-accent mb-1">{content?.devocionais?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Devocionais</div>
        </Card>
        <Card className="p-6 text-center shadow-soft stat-card hover-lift">
          <div className="text-3xl font-bold text-accent mb-1">{content?.atualidades?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Atualidades</div>
        </Card>
      </div>

      {/* Last Update Info */}
      {metadata && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date(metadata.lastUpdated).toLocaleDateString('pt-BR', { 
              month: '2-digit', 
              year: 'numeric' 
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
