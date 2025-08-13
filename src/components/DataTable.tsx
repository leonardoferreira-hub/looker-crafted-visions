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
    const variants: Record<string, string> = {
      "CRI": "bg-chart-1/20 text-chart-1 border-chart-1/30",
      "CRA": "bg-chart-2/20 text-chart-2 border-chart-2/30",
      "DEB": "bg-chart-3/20 text-chart-3 border-chart-3/30",
      "Debênture": "bg-chart-3/20 text-chart-3 border-chart-3/30",
      "CR": "bg-chart-4/20 text-chart-4 border-chart-4/30",
      "NC": "bg-chart-5/20 text-chart-5 border-chart-5/30",
    };
    
    return variants[category] || "bg-muted/20 text-muted-foreground border-muted/30";
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'null') return '-';
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