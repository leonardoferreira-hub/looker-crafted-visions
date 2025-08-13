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
        return "bg-gradient-to-br from-primary-blue/80 to-primary-blue/60 border-primary-blue/50 shadow-xl text-white";
      case "success":
        return "bg-gradient-to-br from-primary-green/80 to-primary-green/60 border-primary-green/50 shadow-xl text-white";
      case "warning":
        return "bg-gradient-to-br from-primary-orange/80 to-primary-orange/60 border-primary-orange/50 shadow-xl text-white";
      default:
        return "bg-gradient-to-br from-muted/80 to-muted/60 backdrop-blur-sm border-border/50 shadow-lg";
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className={cn(
          "text-sm font-semibold uppercase tracking-wide",
          variant === "default" ? "text-muted-foreground" : "text-white/90"
        )}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className={cn(
          "text-3xl font-bold tracking-tight",
          variant === "default" ? "text-foreground" : "text-white"
        )}>
          {value}
        </div>
        {subtitle && (
          <p className={cn(
            "text-sm font-medium",
            variant === "default" ? "text-muted-foreground" : "text-white/80"
          )}>
            {subtitle}
          </p>
        )}
        {change && (
          <div className={cn(
            "flex items-center text-sm font-semibold",
            variant === "default" 
              ? (change.type === "positive" ? "text-success" : "text-error")
              : "text-white"
          )}>
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