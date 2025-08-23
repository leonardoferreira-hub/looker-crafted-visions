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

const FeeSubCard = ({ 
  title, 
  total, 
  liquidado, 
  estruturacao, 
  liquidadoRaw,
  estruturacaoRaw,
  change,
  color,
  tooltipInfo 
}: {
  title: string;
  total: string;
  liquidado: string;
  estruturacao: string;
  liquidadoRaw: number;
  estruturacaoRaw: number;
  change?: { value: string; type: "positive" | "negative" };
  color: string;
  tooltipInfo: any;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "p-3 rounded-lg transition-all duration-200 hover:shadow-md cursor-help",
          color
        )}>
          <div className="text-center mb-2">
            <div className="text-lg font-bold text-white">{total}</div>
            <div className="text-xs uppercase tracking-wide text-white/90 font-medium">{title}</div>
          </div>
          
          <div className="flex justify-between items-center text-white/90 text-sm">
            <div className="text-center">
              <div className="font-semibold">{liquidado}</div>
              <div className="text-xs opacity-80">Liquidado</div>
            </div>
            <div className="w-px h-6 bg-white/40 mx-2"></div>
            <div className="text-center">
              <div className="font-semibold">{estruturacao}</div>
              <div className="text-xs opacity-80">Estruturação</div>
            </div>
          </div>

          {change && (
            <div className="flex items-center justify-center mt-2 pt-2 border-t border-white/30">
              <div className="flex items-center text-xs font-medium text-white/95">
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
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm p-4 bg-background/95 backdrop-blur-sm border shadow-lg">
        <div className="space-y-2">
          <div className="font-semibold text-sm border-b pb-2 mb-3">{title} - Detalhes</div>
          
          <div className="text-xs">
            <span className="font-medium">Período atual:</span> {tooltipInfo.currentPeriod}
            {tooltipInfo.currentValue && (
              <span className="block text-primary font-semibold">{tooltipInfo.currentValue}</span>
            )}
          </div>
          
          {tooltipInfo.comparisonPeriod && (
            <div className="text-xs">
              <span className="font-medium">Período comparação:</span> {tooltipInfo.comparisonPeriod}
              {tooltipInfo.comparisonValue && (
                <span className="block text-muted-foreground">{tooltipInfo.comparisonValue}</span>
              )}
            </div>
          )}
          
          {tooltipInfo.calculation && (
            <div className="text-xs pt-2 border-t">
              <span className="font-medium">Cálculo:</span>
              <div className="text-muted-foreground">{tooltipInfo.calculation}</div>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

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
    <Card className={cn(
      "transition-all duration-300 hover:shadow-xl border-2 bg-gradient-to-br from-rose-600 to-rose-700 border-rose-500 shadow-xl shadow-rose-500/25",
      className
    )}>
      <CardHeader className="pb-3 text-center">
        <CardTitle className="text-sm font-bold text-white/90 uppercase tracking-wide flex items-center justify-center gap-2">
          <DollarSign className="h-4 w-4" />
          Receita
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Valor total simplificado */}
        <div className="text-center pb-4 border-b border-white/20">
          <div className="text-4xl font-black tracking-tight text-white mb-2">
            {formatValue(totalGeral)}
          </div>
          <div className="flex justify-between items-center text-white/90 text-sm">
            <div className="text-center flex-1">
              <div className="text-lg font-bold">{formatValue(totalLiquidado)}</div>
              <div className="text-xs uppercase tracking-wide opacity-80">Liquidado</div>
            </div>
            <div className="w-px h-6 bg-white/30 mx-3"></div>
            <div className="text-center flex-1">
              <div className="text-lg font-bold">{formatValue(totalEstruturacao)}</div>
              <div className="text-xs uppercase tracking-wide opacity-80">Estruturação</div>
            </div>
          </div>
        </div>

        {/* Sub-cards para cada tipo de fee */}
        <div className="space-y-3">
          {/* Gestão - card separado no topo */}
          <FeeSubCard
            title="Gestão"
            total={formatValue(data.gestao.liquidadoRaw + data.gestao.estruturacaoRaw)}
            liquidado={data.gestao.liquidado}
            estruturacao={data.gestao.estruturacao}
            liquidadoRaw={data.gestao.liquidadoRaw}
            estruturacaoRaw={data.gestao.estruturacaoRaw}
            color="bg-amber-600/40 hover:bg-amber-600/50 border-amber-400/40"
            tooltipInfo={{
              currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
              comparisonPeriod: `Dados não disponíveis para comparação histórica`,
              currentValue: `R$ ${Math.round((data.gestao.liquidadoRaw + data.gestao.estruturacaoRaw) / 1000).toLocaleString('pt-BR')} milhares`,
              calculation: "Soma dos valores da coluna Gestão das abas Histórico (liquidadas) e Pipe (em estruturação)"
            }}
          />
          
          {/* Estruturação e Colocação lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <FeeSubCard
              title="Estruturação"
              total={formatValue(data.estruturacao.liquidadoRaw + data.estruturacao.estruturacaoRaw)}
              liquidado={data.estruturacao.liquidado}
              estruturacao={data.estruturacao.estruturacao}
              liquidadoRaw={data.estruturacao.liquidadoRaw}
              estruturacaoRaw={data.estruturacao.estruturacaoRaw}
              change={data.estruturacao.change}
              color="bg-orange-600/40 hover:bg-orange-600/50 border-orange-400/40"
              tooltipInfo={{
                currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                currentValue: `R$ ${data.estruturacao.liquidado} milhões liquidado`,
                comparisonValue: `Dados históricos de estruturação`,
                calculation: "Soma dos valores da coluna Estruturação das abas Histórico (liquidadas) e Pipe (em estruturação)"
              }}
            />
            
            <FeeSubCard
              title="Colocação"
              total={formatValue(data.colocacao.liquidadoRaw + data.colocacao.estruturacaoRaw)}
              liquidado={data.colocacao.liquidado}
              estruturacao={data.colocacao.estruturacao}
              liquidadoRaw={data.colocacao.liquidadoRaw}
              estruturacaoRaw={data.colocacao.estruturacaoRaw}
              color="bg-violet-600/40 hover:bg-violet-600/50 border-violet-400/40"
              tooltipInfo={{
                currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                comparisonPeriod: `Dados não disponíveis para comparação histórica`,
                currentValue: `R$ ${Math.round((data.colocacao.liquidadoRaw + data.colocacao.estruturacaoRaw) / 1000).toLocaleString('pt-BR')} milhares`,
                calculation: "Soma dos valores da coluna Originação das abas Histórico (liquidadas) e Pipe (em estruturação)"
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}