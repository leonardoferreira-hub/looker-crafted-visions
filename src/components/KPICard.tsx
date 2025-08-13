import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    value: string;
    type: "positive" | "negative";
  };
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  change, 
  variant = "default",
  className 
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
    <Card className={cn(
      "transition-all duration-300 hover:shadow-2xl hover:scale-[1.05] border-2 text-white",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-white/90 uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-4xl font-black tracking-tight text-white">
          {value}
        </div>
        {subtitle && (
          <p className="text-sm font-medium text-white/80">
            {subtitle}
          </p>
        )}
        {change && (
          <div className="flex items-center text-sm font-bold text-white">
            {change.type === "positive" ? (
              <TrendingUp className="mr-1 h-4 w-4" />
            ) : (
              <TrendingDown className="mr-1 h-4 w-4" />
            )}
            {change.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}