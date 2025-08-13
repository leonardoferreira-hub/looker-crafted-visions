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
        return "bg-gradient-to-br from-primary-blue/10 to-primary-green/10 border-primary-blue/20";
      case "success":
        return "bg-gradient-to-br from-success/10 to-success/5 border-success/20";
      case "warning":
        return "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20";
      default:
        return "bg-card/50 backdrop-blur-sm border-border/50";
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
      getVariantStyles(),
      className
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
        {change && (
          <div className={cn(
            "flex items-center text-xs font-medium",
            change.type === "positive" ? "text-success" : "text-error"
          )}>
            {change.type === "positive" ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            {change.value}
          </div>
        )}
      </CardContent>
    </Card>
  );
}