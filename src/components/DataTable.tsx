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
    // Mesmas cores do gráfico (com alpha visível) — usando sintaxe Tailwind segura com underscores
    const variants: Record<string, string> = {
      CRI: "border-2 font-semibold bg-[hsl(142_76%_36%/0.32)] text-[hsl(142_76%_18%)] border-[hsl(142_76%_36%/0.65)] shadow-[0_0_12px_hsl(142_76%_36%/0.35)]",
      CRA: "border-2 font-semibold bg-[hsl(262_83%_58%/0.28)] text-[hsl(262_83%_30%)] border-[hsl(262_83%_58%/0.65)] shadow-[0_0_12px_hsl(262_83%_58%/0.35)]",
      DEB: "border-2 font-semibold bg-[hsl(217_91%_59%/0.28)] text-[hsl(217_91%_32%)] border-[hsl(217_91%_59%/0.65)] shadow-[0_0_12px_hsl(217_91%_59%/0.35)]",
      "Debênture": "border-2 font-semibold bg-[hsl(217_91%_59%/0.28)] text-[hsl(217_91%_32%)] border-[hsl(217_91%_59%/0.65)] shadow-[0_0_12px_hsl(217_91%_59%/0.35)]",
      CR: "border-2 font-semibold bg-[hsl(262_83%_58%/0.28)] text-[hsl(262_83%_30%)] border-[hsl(262_83%_58%/0.65)] shadow-[0_0_12px_hsl(262_83%_58%/0.35)]",
      NC: "border-2 font-semibold bg-[hsl(173_58%_39%/0.28)] text-[hsl(173_58%_22%)] border-[hsl(173_58%_39%/0.65)] shadow-[0_0_12px_hsl(173_58%_39%/0.35)]",
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
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="hidden sm:table-header-group">
              <TableRow className="border-border/50">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn("text-muted-foreground font-medium text-xs sm:text-sm", column.className)}
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
                  {/* Mobile Card Layout */}
                  <TableCell className="block sm:hidden p-4 space-y-2" colSpan={columns.length}>
                    <div className="grid grid-cols-1 gap-2">
                      {columns.map((column) => (
                        <div key={column.key} className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground font-medium">
                            {column.label}:
                          </span>
                          <div className="text-sm">
                            {column.render ? (
                              column.render(row[column.key], row)
                            ) : column.key === 'categoria' ? (
                              <Badge 
                                variant="outline" 
                                className={`${getCategoryBadge(row[column.key])} text-xs`}
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  
                  {/* Desktop Table Layout */}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn("hidden sm:table-cell text-xs sm:text-sm", column.className)}
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