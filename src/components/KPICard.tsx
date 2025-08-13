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
        return "bg-gradient-to-br from-primary-blue/20 to-primary-green/20 border-primary-blue/30 shadow-lg";
      case "success":
        return "bg-gradient-to-br from-success/20 to-success/10 border-success/30 shadow-lg";
      case "warning":
        return "bg-gradient-to-br from-warning/20 to-warning/10 border-warning/30 shadow-lg";
      default:
        return "bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-md";
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground font-medium">
            {subtitle}
          </p>
        )}
        {change && (
          <div className={cn(
            "flex items-center text-sm font-semibold",
            change.type === "positive" ? "text-success" : "text-error"
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