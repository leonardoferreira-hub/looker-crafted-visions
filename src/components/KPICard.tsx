import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  leftValue?: string;
  leftLabel?: string;
  rightValue?: string;
  rightLabel?: string;
  change?: {
    value: string;
    type: "positive" | "negative";
  };
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
  tooltipInfo?: {
    currentPeriod?: string;
    comparisonPeriod?: string;
    currentValue?: string;
    comparisonValue?: string;
    calculation?: string;
  };
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
  variant = "default",
  className,
  tooltipInfo
}: KPICardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-xl shadow-blue-500/25";
      case "success":
        return "bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-xl shadow-green-500/25";
      case "warning":
        return "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 shadow-xl shadow-orange-500/25";
      default:
        return "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400 shadow-xl shadow-purple-500/25";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] border-2 text-white cursor-help",
            getVariantStyles(),
            className
          )}>
            <CardHeader className="pb-3 text-center relative">
              <CardTitle className="text-sm font-bold text-white/90 uppercase tracking-wide flex items-center justify-center gap-2">
                {title}
                {tooltipInfo && <Info className="h-3 w-3 opacity-60" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Número principal centralizado */}
              <div className="text-center">
                <div className="text-5xl font-black tracking-tight text-white">
                  {value}
                </div>
              </div>
              
              {/* Breakdown ou subtitle */}
              {(leftValue && rightValue && leftLabel && rightLabel) ? (
                <div className="flex justify-between items-center text-white/90">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">{leftValue}</div>
                    <div className="text-xs uppercase tracking-wide opacity-80">{leftLabel}</div>
                  </div>
                  <div className="w-px h-8 bg-white/30 mx-3"></div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">{rightValue}</div>
                    <div className="text-xs uppercase tracking-wide opacity-80">{rightLabel}</div>
                  </div>
                </div>
              ) : subtitle && (
                <div className="text-center text-white/90">
                  <div className="text-sm uppercase tracking-wide opacity-80">{subtitle}</div>
                </div>
              )}
              
              {/* Comparativo com ano anterior */}
              {change && (
                <div className="flex items-center justify-center text-sm font-bold text-white border-t border-white/20 pt-3">
                  {change.type === "positive" ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  <span>{change.value} liquidado vs mesmo período 2024</span>
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