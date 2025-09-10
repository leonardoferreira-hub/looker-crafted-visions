import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Mail } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BarChart3 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Travessia</h1>
          <p className="text-muted-foreground">Dashboard Financeiro</p>
        </div>

        {/* Auth Form */}
        <Card className="border border-border/50 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
            <CardDescription>
              Entre com sua conta Google autorizada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
              size="lg"
            >
              <Mail className="h-5 w-5 text-red-500" />
              {isLoading ? "Conectando..." : "Continuar com Google"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Apenas emails autorizados têm acesso</p>
              <p className="mt-1 text-xs">Entre em contato com o administrador para solicitar acesso</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;