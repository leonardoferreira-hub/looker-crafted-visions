import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Info, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevenueData {
  estruturacao: {
    liquidado: string;
    estruturacao: string;
    liquidadoRaw: number;
    estruturacaoRaw: number;
    change?: { value: string; type: "positive" | "negative" };
  };
  gestao: {
    liquidado: string;
    estruturacao: string;
    liquidadoRaw: number;
    estruturacaoRaw: number;
  };
  colocacao: {
    liquidado: string;
    estruturacao: string;
    liquidadoRaw: number;
    estruturacaoRaw: number;
  };
}

interface RevenueCardProps {
  data: RevenueData;
  className?: string;
}

export function RevenueCard({ data, className }: RevenueCardProps) {
  // Calcula receita total
  const totalLiquidado = data.estruturacao.liquidadoRaw + data.gestao.liquidadoRaw + data.colocacao.liquidadoRaw;
  const totalEstruturacao = data.estruturacao.estruturacaoRaw + data.gestao.estruturacaoRaw + data.colocacao.estruturacaoRaw;
  const totalGeral = totalLiquidado + totalEstruturacao;

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} mi`;
    }
    return Math.round(value).toLocaleString('pt-BR');
  };

  const FeeSection = ({ 
    title, 
    liquidado, 
    estruturacao, 
    liquidadoRaw,
    estruturacaoRaw,
    change,
    color 
  }: {
    title: string;
    liquidado: string;
    estruturacao: string;
    liquidadoRaw: number;
    estruturacaoRaw: number;
    change?: { value: string; type: "positive" | "negative" };
    color: string;
  }) => (
    <div className={cn("p-4 rounded-lg border border-white/20", color)}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide">{title}</h4>
        <div className="text-lg font-bold text-white">
          {formatValue(liquidadoRaw + estruturacaoRaw)}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-white/80 text-sm">
        <div className="text-center">
          <div className="font-semibold">{liquidado}</div>
          <div className="text-xs opacity-70">Liquidado</div>
        </div>
        <div className="w-px h-8 bg-white/30 mx-3"></div>
        <div className="text-center">
          <div className="font-semibold">{estruturacao}</div>
          <div className="text-xs opacity-70">Estruturação</div>
        </div>
      </div>

      {change && (
        <div className="flex items-center justify-center mt-2 pt-2 border-t border-white/20">
          <div className="flex items-center text-xs font-medium text-white/90">
            {change.type === "positive" ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            <span>{change.value} vs 2024</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-2 text-white cursor-help bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 shadow-xl shadow-emerald-500/25",
            className
          )}>
            <CardHeader className="pb-4 text-center relative">
              <CardTitle className="text-sm font-bold text-white/90 uppercase tracking-wide flex items-center justify-center gap-2">
                <DollarSign className="h-4 w-4" />
                Receita
                <Info className="h-3 w-3 opacity-60" />
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Valor total */}
              <div className="text-center border-b border-white/20 pb-4">
                <div className="text-4xl font-black tracking-tight text-white mb-2">
                  {formatValue(totalGeral)}
                </div>
                <div className="flex justify-between items-center text-white/90 text-sm">
                  <div className="text-center flex-1">
                    <div className="text-xl font-bold">{formatValue(totalLiquidado)}</div>
                    <div className="text-xs uppercase tracking-wide opacity-80">Total Liquidado</div>
                  </div>
                  <div className="w-px h-6 bg-white/30 mx-3"></div>
                  <div className="text-center flex-1">
                    <div className="text-xl font-bold">{formatValue(totalEstruturacao)}</div>
                    <div className="text-xs uppercase tracking-wide opacity-80">Total Estruturação</div>
                  </div>
                </div>
              </div>

              {/* Seções de cada fee */}
              <div className="space-y-3">
                <FeeSection
                  title="Estruturação"
                  liquidado={data.estruturacao.liquidado}
                  estruturacao={data.estruturacao.estruturacao}
                  liquidadoRaw={data.estruturacao.liquidadoRaw}
                  estruturacaoRaw={data.estruturacao.estruturacaoRaw}
                  change={data.estruturacao.change}
                  color="bg-orange-500/20"
                />
                
                <FeeSection
                  title="Gestão"
                  liquidado={data.gestao.liquidado}
                  estruturacao={data.gestao.estruturacao}
                  liquidadoRaw={data.gestao.liquidadoRaw}
                  estruturacaoRaw={data.gestao.estruturacaoRaw}
                  color="bg-blue-500/20"
                />
                
                <FeeSection
                  title="Colocação"
                  liquidado={data.colocacao.liquidado}
                  estruturacao={data.colocacao.estruturacao}
                  liquidadoRaw={data.colocacao.liquidadoRaw}
                  estruturacaoRaw={data.colocacao.estruturacaoRaw}
                  color="bg-purple-500/20"
                />
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md p-4 bg-background/95 backdrop-blur-sm border shadow-lg">
          <div className="space-y-2">
            <div className="font-semibold text-sm border-b pb-2 mb-3">Receita Total - Detalhes</div>
            
            <div className="text-xs">
              <span className="font-medium">Período atual:</span> 01/01/2025 - {new Date().toLocaleDateString('pt-BR')}
            </div>
            
            <div className="text-xs">
              <span className="font-medium">Total geral:</span>
              <span className="block text-primary font-semibold">R$ {formatValue(totalGeral)}</span>
            </div>
            
            <div className="text-xs pt-2 border-t">
              <span className="font-medium">Composição:</span>
              <div className="text-muted-foreground space-y-1 mt-1">
                <div>• Fee de Estruturação: R$ {formatValue(data.estruturacao.liquidadoRaw + data.estruturacao.estruturacaoRaw)}</div>
                <div>• Fee de Gestão: R$ {formatValue(data.gestao.liquidadoRaw + data.gestao.estruturacaoRaw)}</div>
                <div>• Fee de Colocação: R$ {formatValue(data.colocacao.liquidadoRaw + data.colocacao.estruturacaoRaw)}</div>
              </div>
            </div>
            
            <div className="text-xs pt-2 border-t">
              <span className="font-medium">Fonte dos dados:</span>
              <div className="text-muted-foreground">
                Consolidação dos fees de estruturação, gestão e colocação das abas Histórico (liquidadas) e Pipe (estruturação)
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}