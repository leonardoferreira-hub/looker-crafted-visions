import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";
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
  Settings,
  LogOut,
  User
} from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("resumo");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [comparisonStartDate, setComparisonStartDate] = useState<Date | null>(null);
  const [comparisonEndDate, setComparisonEndDate] = useState<Date | null>(null);
  const { kpis, chartData, proximasLiquidacoes, ultimasLiquidacoes, loading, error, refetch, isConnected, defaultStartDate, defaultEndDate, defaultComparisonEndDate } = useDashboardData(startDate, endDate, comparisonStartDate, comparisonEndDate);
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to auth
  }

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
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              {user?.email}
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
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
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
            <TabsTrigger 
              value="resumo" 
              className="text-xs sm:text-sm hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-400/50 hover:shadow-blue-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600"
            >
              Resumo
            </TabsTrigger>
            <TabsTrigger 
              value="estruturacao" 
              className="text-xs sm:text-sm hover:bg-orange-500/20 hover:text-orange-400 hover:border-orange-400/50 hover:shadow-orange-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600"
            >
              Estruturação
            </TabsTrigger>
            <TabsTrigger 
              value="liquidadas" 
              className="text-xs sm:text-sm hover:bg-green-500/20 hover:text-green-400 hover:border-green-400/50 hover:shadow-green-500/30 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600"
            >
              Liquidadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-8">
            {/* Main KPIs - Top Row */}
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
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
                tooltipInfo={{
                  currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                  comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                  currentValue: `R$ ${kpis.volumeLiquidado} bilhões liquidado`,
                  comparisonValue: `R$ ${((kpis.lastYearVolume || 0) / 1000000000).toFixed(1)} bilhões`,
                  calculation: "Comparação do volume liquidado no período atual vs volume liquidado no mesmo período do ano anterior"
                }}
              />
            </div>

            {/* Bottom Row - 3 Fee Cards */}
            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
               <KPICard
                title="Fee de Estruturação"
                value={`${(parseFloat(kpis.feeLiquidado) + parseFloat(kpis.feeEstruturacao)).toFixed(1)} mi`}
                leftValue={kpis.feeLiquidado}
                leftLabel="Liquidado"
                rightValue={kpis.feeEstruturacao}
                rightLabel="Estruturação"
                change={kpis.feeLiquidadoChange}
                requiresAdminAccess={true}
                tooltipInfo={{
                  currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                  comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                  currentValue: `R$ ${kpis.feeLiquidado} milhões liquidado`,
                  comparisonValue: `R$ ${((kpis.lastYearFee || 0) / 1000000).toFixed(1)} milhões`,
                  calculation: "Comparação do fee de estruturação liquidado no período atual vs fee liquidado no mesmo período do ano anterior"
                }}
              />
               <KPICard
                title="Fee de Colocação"
                value={`${Math.round((kpis.feeColocacaoLiquidadoRaw || 0) + (kpis.feeColocacaoEstruturacaoRaw || 0)).toLocaleString('pt-BR')}`}
                leftValue={`${Math.round(kpis.feeColocacaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`}
                leftLabel="Liquidado"
                rightValue={`${Math.round(kpis.feeColocacaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`}
                rightLabel="Estruturação"
                change={kpis.feeLiquidadoChange}
                requiresAdminAccess={true}
                tooltipInfo={{
                  currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                  comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                  currentValue: `R$ ${Math.round((kpis.feeColocacaoLiquidadoRaw || 0) + (kpis.feeColocacaoEstruturacaoRaw || 0)).toLocaleString('pt-BR')} (em milhares)`,
                  comparisonValue: `Dados de colocação não disponíveis para comparação histórica`,
                  calculation: "Soma dos fees de colocação (originação) da aba Histórico (2025) + aba Pipe (em estruturação). Valores originalmente em R$ convertidos para milhares."
                }}
              />
               <KPICard
                title="Fee de Gestão"
                value={`${Math.round((kpis.feeGestaoLiquidadoRaw || 0) + (kpis.feeGestaoEstruturacaoRaw || 0)).toLocaleString('pt-BR')}`}
                leftValue={`${Math.round(kpis.feeGestaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`}
                leftLabel="Liquidado"
                rightValue={`${Math.round(kpis.feeGestaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`}
                rightLabel="Estruturação"
                subtitle={`Fee médio 2025: ${kpis.feeMedio2025}`}
                change={kpis.feeLiquidadoChange}
                requiresAdminAccess={true}
                tooltipInfo={{
                  currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                  comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                  currentValue: `R$ ${Math.round((kpis.feeGestaoLiquidadoRaw || 0) + (kpis.feeGestaoEstruturacaoRaw || 0)).toLocaleString('pt-BR')} (em milhares)`,
                  comparisonValue: `Dados de gestão não disponíveis para comparação histórica`,
                  calculation: "Soma dos fees de gestão da aba Histórico (2025) + aba Pipe (em estruturação). Valores originalmente em R$ convertidos para milhares."
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <KPICard
                title="Operações em Estruturação"
                leftValue={kpis.operacoesEstruturacao.toString()}
                leftLabel="Operações"
                rightValue={`${kpis.volumeEstruturacao} bi`}
                rightLabel="Volume"
                variant="primary"
              />
              <KPICard
                title="Fee Estruturação"
                value={`${kpis.feeEstruturacao} mi`}
                leftValue={`${Math.round(kpis.feeColocacaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`}
                leftLabel="Fee Colocação"
                rightValue={kpis.feeEstruturacao}
                rightLabel="Fee Estruturação"
                variant="success"
                requiresAdminAccess={true}
              />
              <KPICard
                title="Fee de Gestão"
                value={`${Math.round(kpis.feeGestaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`}
                subtitle={`Fee médio 2025: ${kpis.feeMedio2025}`}
                variant="warning"
                requiresAdminAccess={true}
              />
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              <ChartCard title="% dos Lastros em Estruturação" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <CustomPieChart 
                    data={chartData.categorias}
                    dataKey="value"
                    nameKey="name"
                  />
                </div>
              </ChartCard>

              <ChartCard title="Investidores em Estruturação" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <CustomPieChart 
                    data={chartData.categorias}
                    dataKey="value"
                    nameKey="name"
                  />
                </div>
              </ChartCard>

              <ChartCard title="Prestadores de Serviço em Estruturação" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <CustomPieChart 
                    data={chartData.categorias}
                    dataKey="value"
                    nameKey="name"
                  />
                </div>
              </ChartCard>
            </div>

            <div className="grid gap-4 sm:gap-6">
              <DataTable
                title="Próximas liquidações"
                data={proximasLiquidacoesLimitadas}
                columns={proximasColumns}
              />
            </div>
          </TabsContent>

          <TabsContent value="liquidadas" className="space-y-6">
            {/* Liquidadas KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <KPICard
                title="Operações Liquidadas"
                leftValue={kpis.operacoesLiquidadas.toString()}
                leftLabel="Operações"
                rightValue={`${kpis.volumeLiquidado} bi`}
                rightLabel="Volume"
                variant="success"
              />
              <KPICard
                title="Fee Liquidado"
                value={`${kpis.feeLiquidado} mi`}
                leftValue={`${Math.round(kpis.feeColocacaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`}
                leftLabel="Fee Colocação"
                rightValue={kpis.feeLiquidado}
                rightLabel="Fee Liquidado"
                variant="primary"
                requiresAdminAccess={true}
              />
              <KPICard
                title="Fee de Gestão"
                value={`${Math.round(kpis.feeGestaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`}
                subtitle={`Fee médio 2025: ${kpis.feeMedio2025}`}
                variant="warning"
                requiresAdminAccess={true}
              />
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <ChartCard title="Volume liquidado por mês" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <CustomLineChart 
                    data={chartData.operacoesPorMes}
                    xKey="mes"
                    yKey="acumulado2025"
                  />
                </div>
              </ChartCard>
              
              <ChartCard title="Performance mensal" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <CustomLineChart 
                    data={chartData.operacoesPorMes}
                    xKey="mes"
                    yKey="estruturacoes"
                  />
                </div>
              </ChartCard>
            </div>

            <div className="grid gap-4 sm:gap-6">
              <DataTable
                title="Todas as liquidações"
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