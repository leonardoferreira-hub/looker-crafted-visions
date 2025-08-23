import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Info, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeeData {
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
  data: FeeData;
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] border-2 text-white cursor-help bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 shadow-xl shadow-emerald-500/25 col-span-2 lg:col-span-3",
            className
          )}>
            <CardHeader className="pb-3 text-center relative">
              <CardTitle className="text-sm font-bold text-white/90 uppercase tracking-wide flex items-center justify-center gap-2">
                <DollarSign className="h-4 w-4" />
                Receita
                <Info className="h-3 w-3 opacity-60" />
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Valor total */}
              <div className="text-center">
                <div className="text-5xl font-black tracking-tight text-white">
                  {formatValue(totalGeral)}
                </div>
              </div>

              {/* Breakdown liquidado vs estruturação */}
              <div className="flex justify-between items-center text-white/90">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{formatValue(totalLiquidado)}</div>
                  <div className="text-xs uppercase tracking-wide opacity-80">Liquidado</div>
                </div>
                <div className="w-px h-8 bg-white/30 mx-3"></div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold">{formatValue(totalEstruturacao)}</div>
                  <div className="text-xs uppercase tracking-wide opacity-80">Estruturação</div>
                </div>
              </div>

              {/* Breakdown por tipo de fee */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-200">{formatValue(data.estruturacao.liquidadoRaw + data.estruturacao.estruturacaoRaw)}</div>
                  <div className="text-xs uppercase tracking-wide opacity-80">Estruturação</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-200">{formatValue(data.gestao.liquidadoRaw + data.gestao.estruturacaoRaw)}</div>
                  <div className="text-xs uppercase tracking-wide opacity-80">Gestão</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-200">{formatValue(data.colocacao.liquidadoRaw + data.colocacao.estruturacaoRaw)}</div>
                  <div className="text-xs uppercase tracking-wide opacity-80">Colocação</div>
                </div>
              </div>

              {/* Comparativo com ano anterior */}
              {data.estruturacao.change && (
                <div className="flex items-center justify-center text-sm font-bold text-white border-t border-white/20 pt-3">
                  {data.estruturacao.change.type === "positive" ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  <span>{data.estruturacao.change.value} vs mesmo período 2024</span>
                </div>
              )}
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
                Fee de Estruturação: colunas Estruturação das abas Histórico e Pipe<br/>
                Fee de Gestão: colunas Gestão das abas Histórico e Pipe<br/>
                Fee de Colocação: colunas Originação das abas Histórico e Pipe
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}