import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  ExternalLink, 
  Copy, 
  Check,
  Database,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ConfigPanel() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopySheetId = async () => {
    try {
      await navigator.clipboard.writeText('1QlDrtv5oPXYH9LsS7GhvvGsSUlSwWDykzVurp7rUAms');
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "ID do Google Sheets copiado para área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o ID",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração do Google Sheets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Conexão Google Sheets</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-id">Sheet ID atual</Label>
            <div className="flex space-x-2">
              <Input
                id="sheet-id"
                value="1QlDrtv5oPXYH9LsS7GhvvGsSUlSwWDykzVurp7rUAms"
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySheetId}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Como conectar seu próprio Google Sheets:</Label>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. Abra seu Google Sheets e vá em <Badge variant="secondary">Arquivo → Compartilhar → Publicar na web</Badge></p>
              <p>2. Selecione a aba desejada e escolha formato CSV</p>
              <p>3. Copie o ID da URL (parte entre /d/ e /edit)</p>
              <p>4. Edite o arquivo <code className="text-xs bg-muted px-1 py-0.5 rounded">src/hooks/useDashboardData.ts</code></p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Estrutura esperada das colunas:</Label>
            <Textarea
              readOnly
              value={`Colunas necessárias no seu Google Sheets:
• Categoria (CRI, CRA, Debênture, etc.)
• Operação/Nome (nome da operação)
• Status (Liquidada, Estruturação)
• Volume (valor em bilhões)
• Fee Estruturação (taxa de estruturação)
• Fee Gestão (taxa de gestão)  
• Data Liquidação (data da liquidação)
• Data Início (data de início)
• Previsão Liquidação (previsão)`}
              className="text-xs h-32 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuração de KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Personalizar KPIs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Para personalizar os KPIs e métricas:</p>
            <div className="space-y-1">
              <p>• <strong>Editar cálculos:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">src/hooks/useDashboardData.ts</code></p>
              <p>• <strong>Modificar cards:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">src/pages/Dashboard.tsx</code></p>
              <p>• <strong>Novos gráficos:</strong> <code className="text-xs bg-muted px-1 py-0.5 rounded">src/components/CustomCharts.tsx</code></p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Exemplos de personalizações:</Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Adicionar filtros por período</p>
              <p>• Criar gráficos de tendência</p>
              <p>• Implementar alertas automáticos</p>
              <p>• Adicionar comparativos YoY</p>
              <p>• Métricas de performance por categoria</p>
            </div>
          </div>

          <Button className="w-full" asChild>
            <a
              href="https://docs.lovable.dev/features/visual-edit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Usar Visual Edits para mudanças rápidas</span>
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}