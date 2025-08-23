import { useState } from "react";
import { KPICard } from "@/components/KPICard";
import { OperationsCard } from "@/components/OperationsCard";
import { RevenueCard } from "@/components/RevenueCard";
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
  const { kpis, chartData, proximasLiquidacoes, ultimasLiquidacoes, loading, error, refetch, isConnected, defaultStartDate, defaultEndDate, defaultComparisonEndDate } = useDashboardData(startDate, endDate, comparisonStartDate, comparisonEndDate);

  // Mostra o período sendo usado

  const proximasColumns = [
    { key: "categoria", label: "Categoria" },
    { key: "operacao", label: "Operação" },
    { key: "previsaoLiquidacao", label: "Previsão de Liquidação" },
    { key: "analistaGestao", label: "Analista Gestão" },
    { key: "estruturacao", label: "Estruturação" }
  ];

  const ultimasColumns = [
    { key: "categoria", label: "Categoria" },
    { key: "operacao", label: "Operação" },
    { key: "dataLiquidacao", label: "Data de Liquidação" },
    { key: "analistaGestao", label: "Analista Gestão" },
    { key: "estruturacao", label: "Estruturação" }
  ];

  // Limitar próximas liquidações às 5 mais próximas
  const proximasLiquidacoesLimitadas = proximasLiquidacoes.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:h-16 items-start sm:items-center justify-between gap-3 p-4 sm:px-6">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/b46458cc-55a4-4a1a-a98e-f6f80b5c6a30.png" 
                alt="Travessia Logo" 
                className="h-6 sm:h-8 w-auto"
              />
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              {defaultStartDate.toLocaleDateString('pt-BR')} - {defaultEndDate.toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
            <ConnectionStatus
              isConnected={isConnected}
              loading={loading}
              error={error}
              onRefresh={refetch}
            />
            
            <div className="flex items-center space-x-2 flex-1 sm:flex-none">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="opacity-80 hover:opacity-100 flex-1 sm:flex-none">
                    <Filter className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Filtros</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 bg-background border border-border shadow-lg z-50" align="end">
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
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Settings className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-[400px] md:w-[540px]">
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

      <div className="p-4 sm:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="resumo" className="text-xs sm:text-sm">Resumo</TabsTrigger>
            <TabsTrigger value="estruturacao" className="text-xs sm:text-sm">Estruturação</TabsTrigger>
            <TabsTrigger value="liquidadas" className="text-xs sm:text-sm">Liquidadas</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            {/* Main KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <OperationsCard
                totalOperations={kpis.operacoesLiquidadas + kpis.operacoesEstruturacao}
                liquidadas={kpis.operacoesLiquidadas}
                estruturacao={kpis.operacoesEstruturacao}
                change={kpis.operacoesLiquidadasChange}
                tooltipInfo={{
                  currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                  comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                  currentValue: `${kpis.operacoesLiquidadas} operações liquidadas`,
                  comparisonValue: `${kpis.lastYearOperacoes || 0} operações`,
                  calculation: "Comparação de operações liquidadas no período atual vs operações liquidadas no mesmo período do ano anterior"
                }}
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
                tooltipInfo={{
                  currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                  comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                  currentValue: `R$ ${kpis.volumeLiquidado} bilhões liquidado`,
                  comparisonValue: `R$ ${((kpis.lastYearVolume || 0) / 1000000000).toFixed(1)} bilhões`,
                  calculation: "Comparação do volume liquidado no período atual vs volume liquidado no mesmo período do ano anterior"
                }}
              />
              <RevenueCard
                data={{
                  estruturacao: {
                    liquidado: kpis.feeLiquidado,
                    estruturacao: kpis.feeEstruturacao,
                    liquidadoRaw: parseFloat(kpis.feeLiquidado) * 1000000,
                    estruturacaoRaw: parseFloat(kpis.feeEstruturacao) * 1000000,
                    change: kpis.feeLiquidadoChange
                  },
                  gestao: {
                    liquidado: `${Math.round(kpis.feeGestaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`,
                    estruturacao: `${Math.round(kpis.feeGestaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`,
                    liquidadoRaw: kpis.feeGestaoLiquidadoRaw || 0,
                    estruturacaoRaw: kpis.feeGestaoEstruturacaoRaw || 0
                  },
                  colocacao: {
                    liquidado: `${Math.round(kpis.feeColocacaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`,
                    estruturacao: `${Math.round(kpis.feeColocacaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`,
                    liquidadoRaw: kpis.feeColocacaoLiquidadoRaw || 0,
                    estruturacaoRaw: kpis.feeColocacaoEstruturacaoRaw || 0
                  }
                }}
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <ChartCard title="Operações liquidadas por mês" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <CombinedBarLineChart 
                    data={chartData.operacoesPorMes}
                    endDate={defaultEndDate}
                    comparisonEndDate={defaultComparisonEndDate}
                  />
                </div>
              </ChartCard>
              
              <ChartCard title="Distribuição por categoria" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <CustomPieChart 
                    data={chartData.categorias}
                    dataKey="value"
                    nameKey="name"
                  />
                </div>
              </ChartCard>
            </div>

            {/* Tables Row */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <DataTable
                title="Próximas liquidações"
                data={proximasLiquidacoesLimitadas}
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
                data={proximasLiquidacoesLimitadas}
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
                value={`${Math.round(kpis.feeGestaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`}
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