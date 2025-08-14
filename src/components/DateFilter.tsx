import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface DateFilterProps {
  // Período principal
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  
  // Período de comparação
  comparisonStartDate: Date | null;
  comparisonEndDate: Date | null;
  onComparisonStartDateChange: (date: Date | null) => void;
  onComparisonEndDateChange: (date: Date | null) => void;
  
  onClear: () => void;
}

export function DateFilter({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  comparisonStartDate,
  comparisonEndDate,
  onComparisonStartDateChange,
  onComparisonEndDateChange,
  onClear 
}: DateFilterProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);
  const [isCompStartOpen, setIsCompStartOpen] = useState(false);
  const [isCompEndOpen, setIsCompEndOpen] = useState(false);

  // Default dates
  const defaultStartDate = new Date(2025, 0, 1); // 01/01/2025
  const defaultEndDate = new Date(); // Today
  const defaultCompStartDate = new Date(2024, 0, 1); // 01/01/2024
  const defaultCompEndDate = new Date(2024, 11, 31); // 31/12/2024

  return (
    <div className="space-y-4">
      {/* Período Principal */}
      <div>
        <h5 className="text-sm font-medium mb-2 text-foreground">Período</h5>
        <div className="flex items-center gap-2">
          <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[140px] opacity-80 hover:opacity-100",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yy", { locale: ptBR }) : format(defaultStartDate, "dd/MM/yy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border border-border shadow-lg z-50" align="start">
              <Calendar
                mode="single"
                selected={startDate || undefined}
                onSelect={(date) => {
                  onStartDateChange(date || null);
                  setIsStartOpen(false);
                }}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground text-sm">até</span>

          <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[140px] opacity-80 hover:opacity-100",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yy", { locale: ptBR }) : format(defaultEndDate, "dd/MM/yy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border border-border shadow-lg z-50" align="start">
              <Calendar
                mode="single"
                selected={endDate || undefined}
                onSelect={(date) => {
                  onEndDateChange(date || null);
                  setIsEndOpen(false);
                }}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Separator />

      {/* Período de Comparação */}
      <div>
        <h5 className="text-sm font-medium mb-2 text-foreground">Comparação</h5>
        <div className="flex items-center gap-2">
          <Popover open={isCompStartOpen} onOpenChange={setIsCompStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[140px] opacity-60 hover:opacity-100",
                  !comparisonStartDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {comparisonStartDate ? format(comparisonStartDate, "dd/MM/yy", { locale: ptBR }) : format(defaultCompStartDate, "dd/MM/yy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border border-border shadow-lg z-50" align="start">
              <Calendar
                mode="single"
                selected={comparisonStartDate || undefined}
                onSelect={(date) => {
                  onComparisonStartDateChange(date || null);
                  setIsCompStartOpen(false);
                }}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          <span className="text-muted-foreground text-sm">até</span>

          <Popover open={isCompEndOpen} onOpenChange={setIsCompEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[140px] opacity-60 hover:opacity-100",
                  !comparisonEndDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {comparisonEndDate ? format(comparisonEndDate, "dd/MM/yy", { locale: ptBR }) : format(defaultCompEndDate, "dd/MM/yy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-background border border-border shadow-lg z-50" align="start">
              <Calendar
                mode="single"
                selected={comparisonEndDate || undefined}
                onSelect={(date) => {
                  onComparisonEndDateChange(date || null);
                  setIsCompEndOpen(false);
                }}
                initialFocus
                className="p-3 pointer-events-auto"
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Botão Limpar */}
      {(startDate || endDate || comparisonStartDate || comparisonEndDate) && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="opacity-70 hover:opacity-100"
          >
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}