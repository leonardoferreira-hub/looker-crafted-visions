import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DataTableProps {
  title?: string;
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
  }>;
  className?: string;
}

export function DataTable({ title, data, columns, className }: DataTableProps) {
  const getCategoryBadge = (category: string) => {
    // Usando as mesmas cores exatas do gráfico CustomPieChart
    const variants: Record<string, string> = {
      "CRI": "border border-opacity-30 text-sm font-medium" + " " + "bg-[hsl(142,76%,36%)] bg-opacity-20 text-[hsl(142,76%,26%)] border-[hsl(142,76%,36%)]",
      "CRA": "border border-opacity-30 text-sm font-medium" + " " + "bg-[hsl(25,95%,53%)] bg-opacity-20 text-[hsl(25,95%,43%)] border-[hsl(25,95%,53%)]", 
      "DEB": "border border-opacity-30 text-sm font-medium" + " " + "bg-[hsl(217,91%,59%)] bg-opacity-20 text-[hsl(217,91%,49%)] border-[hsl(217,91%,59%)]",
      "Debênture": "border border-opacity-30 text-sm font-medium" + " " + "bg-[hsl(217,91%,59%)] bg-opacity-20 text-[hsl(217,91%,49%)] border-[hsl(217,91%,59%)]",
      "CR": "border border-opacity-30 text-sm font-medium" + " " + "bg-[hsl(262,83%,58%)] bg-opacity-20 text-[hsl(262,83%,48%)] border-[hsl(262,83%,58%)]",
      "NC": "border border-opacity-30 text-sm font-medium" + " " + "bg-[hsl(173,58%,39%)] bg-opacity-20 text-[hsl(173,58%,29%)] border-[hsl(173,58%,39%)]",
    };
    
    return variants[category] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  const formatCurrency = (value: number | string) => {
    // Se já está formatado como moeda, retorna como está
    if (typeof value === 'string' && value.startsWith('R$')) {
      return value;
    }
    
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'null' || dateString === '') return '-';
    
    // Se já está no formato DD/MM/YYYY ou é "Liquidada", retorna como está
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/) || dateString.toLowerCase() === 'liquidada') {
      return dateString;
    }
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={cn("bg-card border-border/50 shadow-lg", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn("text-muted-foreground font-medium", column.className)}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  key={index}
                  className="border-border/50 hover:bg-muted/30 transition-colors"
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn("text-sm", column.className)}
                    >
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : column.key === 'categoria' ? (
                        <Badge 
                          variant="outline" 
                          className={getCategoryBadge(row[column.key])}
                        >
                          {row[column.key]}
                        </Badge>
                      ) : column.key.toLowerCase().includes('estruturacao') || 
                          column.key.toLowerCase().includes('volume') ||
                          column.key.toLowerCase().includes('remuneracao') ? (
                        <span className="font-medium">
                          {formatCurrency(row[column.key])}
                        </span>
                      ) : column.key.toLowerCase().includes('data') ||
                          column.key.toLowerCase().includes('previsao') ? (
                        formatDate(row[column.key])
                      ) : (
                        row[column.key] || '-'
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}