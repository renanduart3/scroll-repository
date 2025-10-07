import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Moon, Sun, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Configuracoes = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
      toast.success("Modo claro ativado");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
      toast.success("Modo escuro ativado");
    }
  };

  const handleCopyPix = () => {
    // Simulated PIX key
    const pixKey = "suporte@palavraviva.com.br";
    navigator.clipboard.writeText(pixKey);
    toast.success("Chave PIX copiada! 🙏", {
      description: "Obrigado pelo seu apoio ao ministério!"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:ml-64 pb-24 md:pb-8">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground">Personalize sua experiência</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card className="p-6">
            <h3 className="text-lg font-serif font-bold mb-4">Aparência</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-accent" />
                ) : (
                  <Sun className="h-5 w-5 text-accent" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">
                    Modo Escuro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reduza o brilho da tela
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
          </Card>

          {/* Reading Preferences */}
          <Card className="p-6">
            <h3 className="text-lg font-serif font-bold mb-4">Preferências de Leitura</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications" className="font-medium">
                    Notificações Diárias
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes para o devocional
                  </p>
                </div>
                <Switch id="notifications" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast" className="font-medium">
                    Alto Contraste
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Melhor legibilidade
                  </p>
                </div>
                <Switch id="high-contrast" />
              </div>
            </div>
          </Card>

          {/* Support */}
          <Card className="p-6 border-accent">
            <div className="flex items-start gap-4">
              <div className="gradient-accent p-3 rounded-xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-serif font-bold mb-2">
                  Apoiar o Projeto
                </h3>
                <p className="text-muted-foreground mb-4">
                  Ajude-nos a continuar compartilhando a Palavra de Deus gratuitamente.
                  Sua contribuição faz diferença!
                </p>
                <Button onClick={handleCopyPix} className="w-full sm:w-auto">
                  Copiar Chave PIX
                </Button>
              </div>
            </div>
          </Card>

          {/* About */}
          <Card className="p-6">
            <h3 className="text-lg font-serif font-bold mb-4">Sobre</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Versão:</strong> 1.0.0
              </p>
              <p>
                <strong className="text-foreground">Desenvolvido por:</strong> Palavra Viva Ministério
              </p>
              <p className="mt-4 italic">
                "Lâmpada para os meus pés é a tua palavra e luz, para o meu caminho." - Salmo 119:105
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
