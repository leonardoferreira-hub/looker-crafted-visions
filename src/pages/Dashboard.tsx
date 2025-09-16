import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KPICard } from "@/components/KPICard";
import { OperationsCard } from "@/components/OperationsCard";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { CustomPieChart, CustomLineChart } from "@/components/CustomCharts";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CombinedBarLineChartWithFilter } from '@/components/CombinedBarLineChartWithFilter';
import { SimpleLineChartWithFilter } from '@/components/SimpleLineChartWithFilter';
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { ConfigPanel } from "@/components/ConfigPanel";
import { DateFilter } from "@/components/DateFilter";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [comparisonStartDate, setComparisonStartDate] = useState<Date | null>(null);
  const [comparisonEndDate, setComparisonEndDate] = useState<Date | null>(null);
  const { kpis, chartData, proximasLiquidacoes, ultimasLiquidacoes, rawPipeData, loading, error, refetch, isConnected, defaultStartDate, defaultEndDate, defaultComparisonEndDate } = useDashboardData(startDate, endDate, comparisonStartDate, comparisonEndDate);
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();

  const navigate = useNavigate();

  // Filtrar dados por categoria
  const filteredChartData = React.useMemo(() => {
    let baseData = [];
    
    if (!chartData.operacoesPorMes || selectedCategory === 'Todas') {
      baseData = chartData.operacoesPorMes || [];
    } else {
      // Se há função de filtro por categoria, usa ela
      if (chartData.operacoesPorMesPorCategoria) {
        try {
          const result = chartData.operacoesPorMesPorCategoria(selectedCategory);
          baseData = result && Array.isArray(result) && result.length > 0 ? result : chartData.operacoesPorMes;
        } catch (error) {
          console.warn('Erro ao filtrar por categoria:', error);
          baseData = chartData.operacoesPorMes;
        }
      } else {
        baseData = chartData.operacoesPorMes;
      }
    }
    
    // Garantir que sempre temos 12 meses (Jan-Dez)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const ensureFullYear = months.map((mes, index) => {
      const existingData = baseData.find(item => item.mes === mes);
      if (existingData) {
        return existingData;
      }
      
      // Se não existe, criar com valores baseados no mês anterior (para manter acumulado)
      const previousData = index > 0 ? ensureFullYear[index - 1] : null;
      return {
        mes,
        acumulado2024: previousData?.acumulado2024 || 0,
        acumulado2025: previousData?.acumulado2025 || 0,
        estruturacoes: 0
      };
    });
    
    return ensureFullYear;
  }, [chartData, selectedCategory]);

  // Função para calcular projeções de liquidação baseadas no pipe por categoria
  const calculatePipeProjections = React.useMemo(() => {
    if (!rawPipeData || rawPipeData.length === 0) return {};
    
    console.log('=== DEBUG PIPE PROJECTIONS ===');
    console.log('Total operações no pipe:', rawPipeData.length);
    
    const projectionsByMonth: Record<number, number> = {};
    let validProjections2025 = 0;
    let otherYears = 0;
    let invalidDates = 0;
    let liquidadas = 0;
    
    rawPipeData.forEach((row, index) => {
      // Get previsao liquidacao from pipe data (column E = index 4)
      const previsaoLiquidacao = row[`col_4`]; 
      const categoria = String(row[`col_2`] || '').trim(); // CATEGORIA column (column C = index 2)
      const operacao = String(row[`col_3`] || '').trim(); // OPERACAO column (column D = index 3)
      
      if (index < 5) {
        console.log(`${index + 1}. ${operacao}: previsão = "${previsaoLiquidacao}"`);
      }
      
      if (!previsaoLiquidacao) return;
      
      // Check for "Liquidada"
      const dateStr = String(previsaoLiquidacao).trim();
      if (dateStr.toLowerCase() === 'liquidada') {
        liquidadas++;
        if (index < 5) console.log(`  ✅ Já liquidada`);
        return;
      }
      
      // Filter by selected category if not "Todas"
      if (selectedCategory !== 'Todas' && categoria !== selectedCategory) return;
      
      // Simple date parsing - try multiple approaches
      let date: Date | null = null;
      
      // Try direct parsing first
      date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // Try DD/MM/YYYY format
        const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) {
          date = new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
        }
      }
      
      if (!date || isNaN(date.getTime())) {
        invalidDates++;
        if (index < 5) console.log(`  ❌ Data inválida: "${dateStr}"`);
        return;
      }
      
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (index < 5) {
        console.log(`  📅 Data: ${date.toISOString().split('T')[0]} (ano: ${year}, mês: ${month})`);
      }
      
      // Only consider 2025 projections
      if (year !== 2025) {
        otherYears++;
        if (index < 5) console.log(`  ❌ Ano ${year} != 2025`);
        return;
      }
      
      projectionsByMonth[month] = (projectionsByMonth[month] || 0) + 1;
      validProjections2025++;
      
      if (index < 5) {
        console.log(`  ✅ Válida para 2025, mês ${month} (total: ${projectionsByMonth[month]})`);
      }
    });
    
    console.log('=== RESUMO PROJEÇÕES ===');
    console.log('Operações já liquidadas:', liquidadas);
    console.log('Projeções válidas para 2025:', validProjections2025);
    console.log('Projeções para outros anos:', otherYears);
    console.log('Datas inválidas:', invalidDates);
    console.log('Projeções por mês 2025:', projectionsByMonth);
    
    return projectionsByMonth;
  }, [rawPipeData, selectedCategory]);

  // Processar dados para separar realizado vs projetado 2025
  const processedChartData = React.useMemo(() => {
    if (!filteredChartData || filteredChartData.length === 0) return [];
    
    const currentMonth = new Date().getMonth(); // 0 = Janeiro, 8 = Setembro
    
    return filteredChartData.map((item, index) => {
      // Realizado: janeiro até setembro (mês atual) + outubro para conexão
      // Projetado: outubro em diante (mês seguinte)
      const isRealizado = index <= currentMonth || index === currentMonth + 1; // 0-8 + 9 = Jan-Out
      const isProjetado = index >= currentMonth + 1; // 9-11 = Out-Dez
      
      // Linha realizada: vai até setembro + outubro para conexão
      let realizedValue = null;
      if (isRealizado) {
        if (index <= currentMonth) {
          // Meses de janeiro a setembro: usar dados reais
          realizedValue = item.acumulado2025 || 0;
        } else if (index === currentMonth + 1) {
          // Outubro: usar valor de setembro para conexão
          const setembroValue = filteredChartData[currentMonth]?.acumulado2025 || 0;
          realizedValue = setembroValue;
        }
      }
      
      // Linha projetada: outubro em diante
      let projectedValue = null;
      if (isProjetado) {
        if (index === currentMonth + 1) {
          // Outubro: começar com valor de setembro
          const baseValue = filteredChartData[currentMonth]?.acumulado2025 || 0;
          projectedValue = baseValue;
        } else {
          // Novembro em diante: aplicar projeções
          const baseValue = filteredChartData[currentMonth]?.acumulado2025 || 0;
          let accumulatedProjections = 0;
          for (let i = currentMonth + 1; i <= index; i++) {
            accumulatedProjections += calculatePipeProjections[i] || 0;
          }
          projectedValue = baseValue + accumulatedProjections;
        }
      }
      
      return {
        ...item,
        acumulado2025_realizado: realizedValue,
        acumulado2025_projetado: projectedValue,
      };
    });
  }, [filteredChartData, calculatePipeProjections]);


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
                variant="primary"
                change={kpis.volumeLiquidadoChange}
                 tooltipInfo={{
                   currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                   comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                   currentValue: `R$ ${kpis.volumeLiquidado} bilhões liquidado (do total ${(parseFloat(kpis.volumeLiquidado) + parseFloat(kpis.volumeEstruturacao)).toFixed(1)} bi)`,
                   comparisonValue: `R$ ${((kpis.lastYearVolume || 0) / 1000000000).toFixed(1)} bilhões liquidado em 2024`,
                   calculation: "Comparação do volume liquidado no período atual vs volume liquidado no mesmo período do ano anterior (comparação justa: liquidado vs liquidado)"
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
                 variant="success"
                 change={kpis.feeLiquidadoChange}
                 requiresAdminAccess={true}
                 tooltipInfo={{
                   currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                   comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                   currentValue: `R$ ${kpis.feeLiquidado} milhões liquidado (do total ${(parseFloat(kpis.feeLiquidado) + parseFloat(kpis.feeEstruturacao)).toFixed(1)} mi)`,
                   comparisonValue: `R$ ${((kpis.lastYearFee || 0) / 1000000).toFixed(1)} milhões liquidado em 2024`,
                   calculation: "Comparação do fee de estruturação liquidado no período atual vs fee liquidado no mesmo período do ano anterior (comparação justa: liquidado vs liquidado)"
                 }}
               />
                 <KPICard
                  title="Fee de Colocação"
                  value={`${Math.round((kpis.feeColocacaoLiquidadoRaw || 0) + (kpis.feeColocacaoEstruturacaoRaw || 0)).toLocaleString('pt-BR')}`}
                  leftValue={`${Math.round(kpis.feeColocacaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`}
                  leftLabel="Liquidado"
                  rightValue={`${Math.round(kpis.feeColocacaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`}
                  rightLabel="Estruturação"
                  variant="secondary"
                  requiresAdminAccess={true}
                 tooltipInfo={{
                   currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                   comparisonPeriod: "Dados históricos não disponíveis",
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
                 variant="warning"
                 requiresAdminAccess={true}
                 tooltipInfo={{
                   currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                   comparisonPeriod: "Dados históricos não disponíveis",
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
                  <div className="w-full h-full flex flex-col">
                    <div className="flex items-center space-x-2 mb-4">
                      <label className="text-sm font-medium text-foreground">Categoria:</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48 bg-background border-border text-foreground">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="Todas" className="text-foreground hover:bg-accent">Todas as categorias</SelectItem>
                          {(chartData.categories || []).map((category) => (
                            <SelectItem key={category} value={category} className="text-foreground hover:bg-accent">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                          <XAxis 
                            dataKey="mes" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="acumulado2024" 
                            stroke="#22c55e" 
                            strokeWidth={2}
                            name="Acumulado 2024"
                            dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="acumulado2025_realizado" 
                            stroke="#2563eb"
                            strokeWidth={2}
                            name="2025 Realizado"
                            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                            connectNulls={true}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="acumulado2025_projetado" 
                            stroke="#2563eb"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="2025 Projetado"
                            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                            connectNulls={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
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
                  variant="primary" showComparison={false}
                 tooltipInfo={{
                   currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                   comparisonPeriod: "Dados atuais em estruturação",
                   currentValue: `${kpis.operacoesEstruturacao} operações em estruturação`,
                   comparisonValue: `Volume total: R$ ${kpis.volumeEstruturacao} bilhões`,
                   calculation: "Operações e volume total das estruturações em andamento no pipeline atual"
                 }}
               />
               <KPICard
                 title="Fee Estruturação"
                 value={`${kpis.feeEstruturacao} mi`}
                 leftValue={`${Math.round(kpis.feeColocacaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`}
                 leftLabel="Fee Colocação"
                 rightValue={kpis.feeEstruturacao}
                 rightLabel="Fee Estruturação"
                  variant="success" showComparison={false}
                 requiresAdminAccess={true}
                 tooltipInfo={{
                   currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                   comparisonPeriod: "Fees projetados em estruturação",
                   currentValue: `R$ ${kpis.feeEstruturacao} milhões em estruturação`,
                   comparisonValue: `Fee colocação: R$ ${Math.round(kpis.feeColocacaoEstruturacaoRaw || 0).toLocaleString('pt-BR')} mil`,
                   calculation: "Soma dos fees de estruturação e colocação projetados para as operações em pipeline"
                 }}
               />
               <KPICard
                 title="Fee de Gestão"
                 value={`${Math.round(kpis.feeGestaoEstruturacaoRaw || 0).toLocaleString('pt-BR')}`}
                 subtitle={`Fee médio 2025: ${kpis.feeMedio2025}`}
                  variant="warning" showComparison={false}
                 requiresAdminAccess={true}
                 tooltipInfo={{
                   currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                   comparisonPeriod: "Fees de gestão projetados",
                   currentValue: `R$ ${Math.round(kpis.feeGestaoEstruturacaoRaw || 0).toLocaleString('pt-BR')} mil em estruturação`,
                   comparisonValue: `Fee médio 2025: ${kpis.feeMedio2025}`,
                   calculation: "Fees de gestão projetados para as operações em estruturação, baseados no fee médio de 2025"
                 }}
               />
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
              <ChartCard title="% dos Lastros em Estruturação" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <CustomPieChart 
                    data={chartData.lastros}
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
                    variant="primary" showComparison={false}
                   tooltipInfo={{
                     currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                     comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                     currentValue: `${kpis.operacoesLiquidadas} operações liquidadas`,
                     comparisonValue: `${kpis.lastYearOperacoes || 0} operações no mesmo período de 2024`,
                     calculation: "Total de operações já liquidadas no período atual comparado com o mesmo período do ano anterior"
                   }}
                 />
                 <KPICard
                   title="Fee Liquidado"
                   value={`${kpis.feeLiquidado} mi`}
                   leftValue={`${Math.round(kpis.feeColocacaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`}
                   leftLabel="Fee Colocação"
                   rightValue={kpis.feeLiquidado}
                   rightLabel="Fee Liquidado"
                    variant="success" showComparison={false}
                   requiresAdminAccess={true}
                   tooltipInfo={{
                     currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                     comparisonPeriod: `01/01/2024 - ${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}/2024`,
                     currentValue: `R$ ${kpis.feeLiquidado} milhões liquidado`,
                     comparisonValue: `R$ ${((kpis.lastYearFee || 0) / 1000000).toFixed(1)} milhões no mesmo período de 2024`,
                     calculation: "Total de fees de estruturação liquidados no período atual comparado com o mesmo período do ano anterior"
                   }}
                 />
              <KPICard
                title="Fee de Gestão"
                value={`${Math.round(kpis.feeGestaoLiquidadoRaw || 0).toLocaleString('pt-BR')}`}
                subtitle={`Fee médio 2025: ${kpis.feeMedio2025}`}
                 variant="warning" showComparison={false}
                requiresAdminAccess={true}
                tooltipInfo={{
                  currentPeriod: `01/01/2025 - ${new Date().toLocaleDateString('pt-BR')}`,
                  comparisonPeriod: "Fees de gestão liquidados",
                  currentValue: `R$ ${Math.round(kpis.feeGestaoLiquidadoRaw || 0).toLocaleString('pt-BR')} mil liquidado`,
                  comparisonValue: `Fee médio 2025: ${kpis.feeMedio2025}`,
                  calculation: "Fees de gestão já liquidados das operações finalizadas, baseados no fee médio de 2025"
                }}
              />
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <ChartCard title="Operações liquidadas por mês" className="min-h-[300px] sm:min-h-[400px]">
                <div className="h-[250px] sm:h-[350px]">
                  <div className="w-full h-full flex flex-col">
                    <div className="flex items-center space-x-2 mb-4">
                      <label className="text-sm font-medium text-foreground">Categoria:</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48 bg-background border-border text-foreground">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                          <SelectItem value="Todas" className="text-foreground hover:bg-accent">Todas as categorias</SelectItem>
                          {(chartData.categories || []).map((category) => (
                            <SelectItem key={category} value={category} className="text-foreground hover:bg-accent">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={processedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
                          <XAxis 
                            dataKey="mes" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="acumulado2024" 
                            stroke="#22c55e" 
                            strokeWidth={2}
                            name="Acumulado 2024"
                            dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="acumulado2025_realizado" 
                            stroke="#2563eb"
                            strokeWidth={2}
                            name="2025 Realizado"
                            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                            connectNulls={true}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="acumulado2025_projetado" 
                            stroke="#2563eb"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            name="2025 Projetado"
                            dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                            connectNulls={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
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