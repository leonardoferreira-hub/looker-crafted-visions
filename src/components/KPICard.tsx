import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";

interface KPICardProps {
  title: string;
  value?: string;
  subtitle?: string;
  leftValue?: string;
  leftLabel?: string;
  rightValue?: string;
  rightLabel?: string;
  change?: {
    value: string;
    type: "positive" | "negative";
  };
  variant?: "default" | "primary" | "success" | "warning" | "secondary";
  className?: string;
  tooltipInfo?: {
    currentPeriod?: string;
    comparisonPeriod?: string;
    currentValue?: string;
    comparisonValue?: string;
    calculation?: string;
  };
  requiresAdminAccess?: boolean;
  showComparison?: boolean;
}

export function KPICard({ 
  title, 
  value, 
  subtitle,
  leftValue,
  leftLabel,
  rightValue,
  rightLabel,
  change, 
  variant,
  className,
  tooltipInfo,
  requiresAdminAccess = false,
  showComparison = true
}: KPICardProps) {
  const { hasPermission } = useUserRole();
  
  // Sistema de cores padronizado: usa 'variant' quando fornecido; caso contrário, mapeia por título
  const getVariantStyles = () => {
    const variantStyles: Record<string, string> = {
      default: "bg-gradient-to-br from-card to-card border-border shadow-xl shadow-black/10",
      primary: "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-xl shadow-blue-500/25",
      success: "bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-xl shadow-green-500/25",
      warning: "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-xl shadow-orange-500/25",
      secondary: "bg-gradient-to-br from-slate-500 to-slate-600 border-slate-400 shadow-xl shadow-slate-500/25",
    };

    // Mapear títulos para cores consistentes
    const colorMap: Record<string, string> = {
      // Volume - Verde
      "Volume Total": variantStyles.success,
      "Volume Liquidado": variantStyles.success,
      
      // Fee de Estruturação - Laranja
      "Fee de Estruturação": variantStyles.warning,
      "Fee Estruturação": variantStyles.warning,
      
      // Fee de Colocação - Cinza/secondary
      "Fee de Colocação": variantStyles.secondary,
      
      // Fee de Gestão - Roxo (mantém identidade)
      "Fee de Gestão": "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400 shadow-xl shadow-purple-500/25",
      
      // Operações - Azul
      "Operações em Estruturação": variantStyles.primary,
      "Operações Liquidadas": variantStyles.primary,
      "Liquidadas": variantStyles.primary,
      
      // Fee Realizado - Laranja (mesmo que Fee de Estruturação)
      "Fee Realizado": variantStyles.warning,
      
      // Fee Liquidado - Verde
      "Fee Liquidado": variantStyles.success,
    };

    if (variant && variantStyles[variant]) return variantStyles[variant];

    // Usar mapeamento baseado no título, ou cor padrão
    return colorMap[title] || "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400 shadow-xl shadow-purple-500/25";
  };

  const canAccess = !requiresAdminAccess || hasPermission('admin');

  // Debug crítico - forçar logs sempre
  if (requiresAdminAccess) {
    console.log(`🚨 CARD "${title}" - DECISÃO FINAL:`, {
      requiresAdminAccess,
      hasPermission: hasPermission('admin'),
      canAccess,
      willReturn: canAccess ? 'RENDER' : 'NULL'
    });
  }

  if (!canAccess) {
    console.log(`❌ RETORNANDO NULL para "${title}"`);
    return null;
  }

  console.log(`✅ RENDERIZANDO "${title}"`);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] border-2 text-white cursor-help",
            getVariantStyles(),
            className
          )}>
            <CardHeader className="pb-3 text-center relative">
              <CardTitle className="text-sm font-bold text-white/90 uppercase tracking-wide flex items-center justify-center gap-2">
                {title}
                {tooltipInfo && <Info className="h-3 w-3 opacity-60" />}
              </CardTitle>
            </CardHeader>
            <CardContent className={`${!value && leftValue && rightValue ? 'flex-1 flex flex-col justify-center py-6' : 'space-y-4'}`}>
              {/* Número principal centralizado */}
              {value && (
                <div className="text-center">
                  <div className="text-5xl font-black tracking-tight text-white">
                    {value}
                  </div>
                </div>
              )}
              
              {/* Breakdown ou subtitle */}
              {(leftValue && rightValue && leftLabel && rightLabel) ? (
                <div className="flex justify-between items-center text-white/90">
                  <div className="text-center flex-1">
                    <div className={`${!value ? 'text-5xl mb-2' : 'text-2xl'} font-bold`}>{leftValue}</div>
                    <div className={`text-xs uppercase tracking-wide opacity-80 ${!value ? 'text-sm' : ''}`}>{leftLabel}</div>
                  </div>
                  <div className={`w-px bg-white/30 mx-4 ${!value ? 'h-12' : 'h-8'}`}></div>
                  <div className="text-center flex-1">
                    <div className={`${!value ? 'text-5xl mb-2' : 'text-2xl'} font-bold`}>{rightValue}</div>
                    <div className={`text-xs uppercase tracking-wide opacity-80 ${!value ? 'text-sm' : ''}`}>{rightLabel}</div>
                  </div>
                </div>
              ) : subtitle && (
                <div className="text-center text-white/90">
                  <div className="text-sm uppercase tracking-wide opacity-80">{subtitle}</div>
                </div>
              )}
              
              {/* Comparativo com ano anterior */}
              {showComparison && (
                <div className="flex items-center justify-center text-sm font-bold text-white border-t border-white/20 pt-3">
                  {change ? (
                    <>
                      {change.type === "positive" ? (
                        <TrendingUp className="mr-1 h-4 w-4" />
                      ) : (
                        <TrendingDown className="mr-1 h-4 w-4" />
                      )}
                      <span>{change.value} vol. liquidado vs mesmo período 2024</span>
                    </>
                  ) : (
                    <span className="text-white/70 text-xs">Dados de comparação não disponíveis.</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        {tooltipInfo && (
          <TooltipContent side="top" className="max-w-sm p-4 bg-background/95 backdrop-blur-sm border shadow-lg">
            <div className="space-y-2">
              <div className="font-semibold text-sm border-b pb-2 mb-3">{title} - Detalhes</div>
              
              {tooltipInfo.currentPeriod && (
                <div className="text-xs">
                  <span className="font-medium">Período atual:</span> {tooltipInfo.currentPeriod}
                  {tooltipInfo.currentValue && (
                    <span className="block text-primary font-semibold">{tooltipInfo.currentValue}</span>
                  )}
                </div>
              )}
              
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
              
              {change && (
                <div className="text-xs pt-2 border-t">
                  <span className="font-medium">Variação:</span>
                  <div className={cn(
                    "font-semibold",
                    change.type === "positive" ? "text-green-600" : "text-red-600"
                  )}>
                    {change.value} {change.type === "positive" ? "↗" : "↘"}
                  </div>
                </div>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}