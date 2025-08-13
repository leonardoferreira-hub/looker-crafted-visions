import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function ConnectionStatus({ isConnected, loading, error, onRefresh }: ConnectionStatusProps) {
  const getStatusColor = () => {
    if (error) return "destructive";
    if (isConnected) return "default";
    return "secondary";
  };

  const getStatusIcon = () => {
    if (error) return <AlertTriangle className="h-3 w-3" />;
    if (isConnected) return <Wifi className="h-3 w-3" />;
    return <WifiOff className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (error) return "Erro na conexão";
    if (isConnected) return "Google Sheets conectado";
    return "Dados offline";
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={getStatusColor()} className="flex items-center space-x-1">
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </Badge>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={loading}
        className={cn(
          "h-8",
          loading && "opacity-50"
        )}
      >
        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      </Button>
    </div>
  );
}