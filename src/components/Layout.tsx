import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Book, Home, Heart, Settings, BookOpen, Mic2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navigation = [
    { name: "Início", href: "/", icon: Home },
    { name: "Estudos", href: "/estudos", icon: Book },
    { name: "Pregações", href: "/pregacoes", icon: Mic2 },
    { name: "Devocional", href: "/devocional", icon: Calendar },
    { name: "Favoritos", href: "/favoritos", icon: Heart },
    { name: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-accent" />
              <span className="text-xl font-serif font-bold gradient-primary bg-clip-text text-transparent">
                Palavra Viva
              </span>
            </Link>
            <Link 
              to="/configuracoes" 
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="sticky bottom-0 z-50 border-t border-border bg-card shadow-soft md:hidden">
        <div className="flex justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-smooth",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-card shadow-soft">
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth",
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
};

export default Layout;
