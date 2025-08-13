import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[var(--gradient-primary)] opacity-5"></div>
        
        <div className="text-center space-y-8 relative z-10 max-w-4xl mx-auto px-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <BarChart3 className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold bg-[var(--gradient-primary)] bg-clip-text text-transparent">
                Travessia
              </h1>
            </div>
            
            <h2 className="text-3xl font-bold text-foreground">
              Dashboard Financeiro Moderno
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gerencie suas operações financeiras com uma interface elegante e intuitiva. 
              Monitore KPIs, visualize dados em tempo real e tome decisões estratégicas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary-blue mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Analytics Avançados</h3>
              <p className="text-sm text-muted-foreground">
                Visualize tendências e performance com gráficos interativos
              </p>
            </div>
            
            <div className="p-6 bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary-green mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Operações em Tempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe liquidações e estruturações em andamento
              </p>
            </div>
            
            <div className="p-6 bg-card/30 backdrop-blur-sm border border-border/50 rounded-lg">
              <DollarSign className="h-8 w-8 text-primary-orange mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Gestão Financeira</h3>
              <p className="text-sm text-muted-foreground">
                Controle fees, volumes e performance financeira
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard')}
              className="bg-[var(--gradient-primary)] hover:shadow-[var(--shadow-premium)] transition-all duration-300"
            >
              Acessar Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
