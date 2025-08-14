import { useState } from "react";
import { KPICard } from "@/components/KPICard";
import { OperationsCard } from "@/components/OperationsCard";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { CustomPieChart, CustomLineChart } from "@/components/CustomCharts";
import { CombinedBarLineChart } from "@/components/CombinedBarLineChart";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { ConfigPanel } from "@/components/ConfigPanel";
import { DateFilter } from "@/components/DateFilter";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Filter,
  Download,
  RefreshCw,
  Settings
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("resumo");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [comparisonStartDate, setComparisonStartDate] = useState<Date | null>(null);
  const [comparisonEndDate, setComparisonEndDate] = useState<Date | null>(null);
  const { kpis, chartData, proximasLiquidacoes, ultimasLiquidacoes, loading, error, refetch, isConnected, defaultStartDate, defaultEndDate } = useDashboardData(startDate, endDate);

  // Mostra o período sendo usado

  const proximasColumns = [
    { key: "categoria", label: "Categoria" },
    { key: "operacao", label: "Operação" },
    { key: "previsaoLiquidacao", label: "Previsão de Liquidação" },
    { key: "estruturacao", label: "Estruturação" }
  ];

  const ultimasColumns = [
    { key: "categoria", label: "Categoria" },
    { key: "operacao", label: "Operação" },
    { key: "estruturacao", label: "Estruturação" },
    { key: "dataLiquidacao", label: "Data de Liquidação" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/b46458cc-55a4-4a1a-a98e-f6f80b5c6a30.png" 
                alt="Travessia Logo" 
                className="h-8 w-auto"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {defaultStartDate.toLocaleDateString('pt-BR')} - {defaultEndDate.toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectionStatus
              isConnected={isConnected}
              loading={loading}
              error={error}
              onRefresh={refetch}
            />
            
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="opacity-80 hover:opacity-100">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-background border border-border shadow-lg z-50" align="start">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filtros de Data</h4>
                    <DateFilter
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={setStartDate}
                      onEndDateChange={setEndDate}
                      comparisonStartDate={comparisonStartDate}
                      comparisonEndDate={comparisonEndDate}
                      onComparisonStartDateChange={setComparisonStartDate}
                      onComparisonEndDateChange={setComparisonEndDate}
                      onClear={() => {
                        setStartDate(null);
                        setEndDate(null);
                        setComparisonStartDate(null);
                        setComparisonEndDate(null);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Configurações do Dashboard</SheetTitle>
                    <SheetDescription>
                      Configure a conexão com Google Sheets e personalize os KPIs
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <ConfigPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="estruturacao">Estruturação</TabsTrigger>
            <TabsTrigger value="liquidadas">Liquidadas</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            {/* Main KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <OperationsCard
                totalOperations={kpis.operacoesLiquidadas + kpis.operacoesEstruturacao}
                liquidadas={kpis.operacoesLiquidadas}
                estruturacao={kpis.operacoesEstruturacao}
                change={kpis.operacoesLiquidadasChange}
              />
              <KPICard
                title="Volume Total"
                value={`${(parseFloat(kpis.volumeLiquidado) + parseFloat(kpis.volumeEstruturacao)).toFixed(1)} bi`}
                leftValue={`${kpis.volumeLiquidado} bi`}
                leftLabel="Liquidado"
                rightValue={`${kpis.volumeEstruturacao} bi`}
                rightLabel="Estruturação"
                change={kpis.volumeLiquidadoChange}
                variant="success"
              />
              <KPICard
                title="Fee de Estruturação"
                value={`${(parseFloat(kpis.feeLiquidado) + parseFloat(kpis.feeEstruturacao)).toFixed(1)} mi`}
                leftValue={kpis.feeLiquidado}
                leftLabel="Liquidado"
                rightValue={kpis.feeEstruturacao}
                rightLabel="Estruturação"
                change={kpis.feeLiquidadoChange}
                variant="warning"
              />
              <KPICard
                title="Fee de Gestão"
                value={`${(parseFloat(kpis.feeGestaoLiquidado) + parseFloat(kpis.feeGestaoEstruturacao)).toFixed(0)} mil`}
                subtitle={`Fee médio 2025: ${kpis.feeMedio2025}`}
                change={kpis.feeLiquidadoChange}
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Operações liquidadas por mês">
                <CombinedBarLineChart 
                  data={chartData.operacoesPorMes}
                  endDate={defaultEndDate}
                />
              </ChartCard>
              
              <ChartCard title="Distribuição por categoria">
                <CustomPieChart 
                  data={chartData.categorias}
                  dataKey="value"
                  nameKey="name"
                />
              </ChartCard>
            </div>

            {/* Tables Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <DataTable
                title="Próximas liquidações"
                data={proximasLiquidacoes}
                columns={proximasColumns}
              />
              
              <DataTable
                title="Últimas liquidações"
                data={ultimasLiquidacoes}
                columns={ultimasColumns}
              />
            </div>
          </TabsContent>

          <TabsContent value="estruturacao" className="space-y-6">
            {/* Estruturação KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Em Estruturação"
                value={kpis.operacoesEstruturacao.toString()}
                subtitle="operações ativas"
                variant="primary"
              />
              <KPICard
                title="Volume"
                value={`${kpis.volumeEstruturacao} bi`}
                subtitle="em estruturação"
                variant="success"
              />
              <KPICard
                title="Fee Estruturação"
                value={`${kpis.feeEstruturacao} mi`}
                subtitle="previsto"
                variant="warning"
              />
              <KPICard
                title="Tempo Médio"
                value="7,0"
                subtitle="dias para estruturação"
                change={{ value: "-15%", type: "positive" }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Fee de Estruturação por mês">
                <CustomLineChart 
                  data={chartData.operacoesPorMes}
                  xKey="mes"
                  yKey="estruturacoes"
                />
              </ChartCard>
              
              <DataTable
                title="Próximas liquidações"
                data={proximasLiquidacoes}
                columns={proximasColumns}
              />
            </div>
          </TabsContent>

          <TabsContent value="liquidadas" className="space-y-6">
            {/* Liquidadas KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Liquidadas"
                value={kpis.operacoesLiquidadas.toString()}
                subtitle="operações concluídas"
                variant="success"
                change={kpis.operacoesLiquidadasChange}
              />
              <KPICard
                title="Volume Liquidado"
                value={`${kpis.volumeLiquidado} bi`}
                subtitle="total realizado"
                variant="primary"
              />
              <KPICard
                title="Fee Realizado"
                value={`${kpis.feeLiquidado} mi`}
                subtitle="estruturação liquidada"
                variant="warning"
                change={kpis.feeLiquidadoChange}
              />
              <KPICard
                title="Fee de Gestão"
                value={`${kpis.feeGestaoLiquidado} mil`}
                subtitle="gestão liquidada"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Distribuição por categoria">
                <CustomPieChart 
                  data={chartData.categorias}
                  dataKey="value"
                  nameKey="name"
                />
              </ChartCard>
              
              <DataTable
                title="Últimas liquidações"
                data={ultimasLiquidacoes}
                columns={ultimasColumns}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}