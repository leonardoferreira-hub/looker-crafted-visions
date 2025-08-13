import { useState } from "react";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { DataTable } from "@/components/DataTable";
import { CustomPieChart, CustomLineChart } from "@/components/CustomCharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

// Mock data based on your Looker dashboard
const mockData = {
  kpis: {
    operacoesLiquidadas: 26,
    operacoesEstruturacao: 33,
    volumeLiquidado: "5.3",
    volumeEstruturacao: "8.0",
    feeLiquidado: "1.4",
    feeEstruturacao: "1.7",
    feeGestaoLiquidado: "152.9",
    feeGestaoEstruturacao: "196.5",
    feeMedio2025: "61.565,22"
  },
  chartData: {
    operacoesPorMes: [
      { mes: "Jan", liquidadas: 10, estruturacoes: 15 },
      { mes: "Fev", liquidadas: 15, estruturacoes: 17 },
      { mes: "Mar", liquidadas: 20, estruturacoes: 25 },
      { mes: "Abr", liquidadas: 25, estruturacoes: 30 },
      { mes: "Mai", liquidadas: 30, estruturacoes: 31 },
      { mes: "Jun", liquidadas: 31, estruturacoes: 34 },
      { mes: "Jul", liquidadas: 30, estruturacoes: 38 },
      { mes: "Ago", liquidadas: 25, estruturacoes: 40 },
      { mes: "Set", liquidadas: 38, estruturacoes: 45 },
      { mes: "Out", liquidadas: 40, estruturacoes: 49 },
      { mes: "Nov", liquidadas: 45, estruturacoes: 50 }
    ],
    categorias: [
      { name: "CRI", value: 50, count: 15 },
      { name: "Debênture", value: 27, count: 8 },
      { name: "CRA", value: 15, count: 4 },
      { name: "CR", value: 8, count: 2 }
    ]
  },
  proximasLiquidacoes: [
    { categoria: "Debênture", operacao: "Projeto Seed", previsaoLiquidacao: null, estruturacao: null },
    { categoria: "NC", operacao: "Acreditar", previsaoLiquidacao: null, estruturacao: "15.000,00" },
    { categoria: "CRA", operacao: "BRA Agroquímica", previsaoLiquidacao: "2025-08-12", estruturacao: "80.000,00" },
    { categoria: "Debênture", operacao: "Galicia", previsaoLiquidacao: "2025-08-13", estruturacao: "60.000,00" },
    { categoria: "CRI", operacao: "Vetter", previsaoLiquidacao: "2025-08-14", estruturacao: "45.000,00" }
  ],
  ultimasLiquidacoes: [
    { categoria: "CRI", operacao: "Supera - Ciano", estruturacao: "60000", dataLiquidacao: "2025-07-22" },
    { categoria: "CRI", operacao: "Salto - Mariana Maria", estruturacao: "80000", dataLiquidacao: "2025-07-01" },
    { categoria: "DEB", operacao: "NPL EMSO II - nova série", estruturacao: "70000", dataLiquidacao: "2025-06-30" },
    { categoria: "DEB", operacao: "PINE", estruturacao: "80000", dataLiquidacao: "2025-06-27" },
    { categoria: "CRA", operacao: "Atlas Agro II", estruturacao: "45000", dataLiquidacao: "2025-06-26" }
  ]
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("resumo");

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
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Travessia</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              1 de jan. de 2025 - 12 de ago.
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
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
              <KPICard
                title="Operações"
                value={`${mockData.kpis.operacoesLiquidadas + mockData.kpis.operacoesEstruturacao}`}
                subtitle={`${mockData.kpis.operacoesLiquidadas} liquidadas • ${mockData.kpis.operacoesEstruturacao} em estruturação`}
                variant="primary"
              />
              <KPICard
                title="Volume Total"
                value={`${(parseFloat(mockData.kpis.volumeLiquidado) + parseFloat(mockData.kpis.volumeEstruturacao)).toFixed(1)} bi`}
                subtitle={`${mockData.kpis.volumeLiquidado} bi liquidado • ${mockData.kpis.volumeEstruturacao} bi em estruturação`}
                variant="success"
              />
              <KPICard
                title="Fee de Estruturação"
                value={`${(parseFloat(mockData.kpis.feeLiquidado) + parseFloat(mockData.kpis.feeEstruturacao)).toFixed(1)} mi`}
                subtitle={`${mockData.kpis.feeLiquidado} mi liquidado • ${mockData.kpis.feeEstruturacao} mi em estruturação`}
                variant="warning"
              />
              <KPICard
                title="Fee de Gestão"
                value={`${(parseFloat(mockData.kpis.feeGestaoLiquidado) + parseFloat(mockData.kpis.feeGestaoEstruturacao)).toFixed(1)} mil`}
                subtitle={`Fee médio 2025: R$ ${mockData.kpis.feeMedio2025}`}
                change={{ value: "+0.4%", type: "positive" }}
              />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Operações liquidadas por mês">
                <CustomLineChart 
                  data={mockData.chartData.operacoesPorMes}
                  xKey="mes"
                  yKey="liquidadas"
                />
              </ChartCard>
              
              <ChartCard title="Distribuição por categoria">
                <CustomPieChart 
                  data={mockData.chartData.categorias}
                  dataKey="value"
                  nameKey="name"
                />
              </ChartCard>
            </div>

            {/* Tables Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <DataTable
                title="Próximas liquidações"
                data={mockData.proximasLiquidacoes}
                columns={proximasColumns}
              />
              
              <DataTable
                title="Últimas liquidações"
                data={mockData.ultimasLiquidacoes}
                columns={ultimasColumns}
              />
            </div>
          </TabsContent>

          <TabsContent value="estruturacao" className="space-y-6">
            {/* Estruturação KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Em Estruturação"
                value={mockData.kpis.operacoesEstruturacao.toString()}
                subtitle="operações ativas"
                variant="primary"
              />
              <KPICard
                title="Volume"
                value={`${mockData.kpis.volumeEstruturacao} bi`}
                subtitle="em estruturação"
                variant="success"
              />
              <KPICard
                title="Fee Estruturação"
                value={`${mockData.kpis.feeEstruturacao} mi`}
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
                  data={mockData.chartData.operacoesPorMes}
                  xKey="mes"
                  yKey="estruturacoes"
                />
              </ChartCard>
              
              <DataTable
                title="Próximas liquidações"
                data={mockData.proximasLiquidacoes}
                columns={proximasColumns}
              />
            </div>
          </TabsContent>

          <TabsContent value="liquidadas" className="space-y-6">
            {/* Liquidadas KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Liquidadas"
                value={mockData.kpis.operacoesLiquidadas.toString()}
                subtitle="operações concluídas"
                variant="success"
                change={{ value: "-10.3%", type: "negative" }}
              />
              <KPICard
                title="Volume Liquidado"
                value={`${mockData.kpis.volumeLiquidado} bi`}
                subtitle="total realizado"
                variant="primary"
              />
              <KPICard
                title="Fee Realizado"
                value={`${mockData.kpis.feeLiquidado} mi`}
                subtitle="estruturação liquidada"
                variant="warning"
                change={{ value: "-17.5%", type: "negative" }}
              />
              <KPICard
                title="Fee de Gestão"
                value={`${mockData.kpis.feeGestaoLiquidado} mil`}
                subtitle="gestão liquidada"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Distribuição por categoria">
                <CustomPieChart 
                  data={mockData.chartData.categorias}
                  dataKey="value"
                  nameKey="name"
                />
              </ChartCard>
              
              <DataTable
                title="Últimas liquidações"
                data={mockData.ultimasLiquidacoes}
                columns={ultimasColumns}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}