import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Moon, Sun, DollarSign, Share2, Star, Monitor } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Share } from '@capacitor/share';

const Configuracoes = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
    
    const isHighContrast = document.documentElement.classList.contains("high-contrast");
    setHighContrast(isHighContrast);
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

  const toggleHighContrast = () => {
    if (highContrast) {
      document.documentElement.classList.remove("high-contrast");
      localStorage.setItem("highContrast", "false");
      setHighContrast(false);
      toast.success("Alto contraste desativado");
    } else {
      document.documentElement.classList.add("high-contrast");
      localStorage.setItem("highContrast", "true");
      setHighContrast(true);
      toast.success("Alto contraste ativado");
    }
  };

  const handleCopyPix = () => {
    const pixKey = "suporte@palavraviva.com.br";
    navigator.clipboard.writeText(pixKey);
    toast.success("Chave PIX copiada! 🙏", {
      description: "Obrigado pelo seu apoio ao ministério!"
    });
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Palavra Viva',
        text: 'Conheça o app Palavra Viva - Estudos bíblicos, pregações e devocionais!',
        url: 'https://4839cb4c-fa33-4792-9027-343f87e48278.lovableproject.com',
        dialogTitle: 'Compartilhar Palavra Viva'
      });
    } catch (error) {
      toast.error("Não foi possível compartilhar");
    }
  };

  const handleRateApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const storeUrl = isIOS 
      ? 'https://apps.apple.com/app/id[SEU_APP_ID]'
      : 'https://play.google.com/store/apps/details?id=app.lovable.4839cb4cfa3347929027343f87e48278';
    
    window.open(storeUrl, '_blank');
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-accent" />
                <div>
                  <Label htmlFor="high-contrast" className="font-medium">
                    Alto Contraste
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Melhor legibilidade
                  </p>
                </div>
              </div>
              <Switch 
                id="high-contrast" 
                checked={highContrast}
                onCheckedChange={toggleHighContrast}
              />
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

          {/* Community */}
          <Card className="p-6">
            <h3 className="text-lg font-serif font-bold mb-4">Comunidade</h3>
            
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleShareApp}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar este App
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleRateApp}
              >
                <Star className="h-4 w-4 mr-2" />
                Avaliar o App na Loja
              </Button>
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
