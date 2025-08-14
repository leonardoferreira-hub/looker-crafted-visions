import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VolumeCardProps {
  totalVolume: string;
  liquidadas: string;
  estruturacao: string;
  change?: {
    value: string;
    type: "positive" | "negative";
  };
  className?: string;
}

export function VolumeCard({ 
  totalVolume, 
  liquidadas, 
  estruturacao, 
  change,
  className 
}: VolumeCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] border-2 text-white",
      "bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-xl shadow-green-500/25",
      className
    )}>
      <CardHeader className="pb-3 text-center">
        <CardTitle className="text-sm font-bold text-white/90 uppercase tracking-wide">
          Volume Total (R$ bi)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Número principal centralizado */}
        <div className="text-center">
          <div className="text-5xl font-black tracking-tight text-white">
            {totalVolume}
          </div>
        </div>
        
        {/* Breakdown liquidadas/estruturação */}
        <div className="flex justify-between items-center text-white/90">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold">{liquidadas}</div>
            <div className="text-xs uppercase tracking-wide opacity-80">Liquidadas</div>
          </div>
          <div className="w-px h-8 bg-white/30 mx-3"></div>
          <div className="text-center flex-1">
            <div className="text-2xl font-bold">{estruturacao}</div>
            <div className="text-xs uppercase tracking-wide opacity-80">Estruturação</div>
          </div>
        </div>
        
        {/* Comparativo com 2024 */}
        {change && (
          <div className="flex items-center justify-center text-sm font-bold text-white border-t border-white/20 pt-3">
            {change.type === "positive" ? (
              <TrendingUp className="mr-1 h-4 w-4" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4" />
            )}
            <span>{change.value} vs mesmo período 2024</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}