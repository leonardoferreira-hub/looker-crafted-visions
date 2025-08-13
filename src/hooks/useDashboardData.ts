import { useMemo } from 'react';
import { useGoogleSheets, SheetData } from './useGoogleSheets';

// Configuração do Google Sheets - EDITE AQUI PARA CONECTAR SEU SHEETS
const SHEETS_CONFIG = {
  SHEET_ID: '1QlDrtv5oPXYH9LsS7GhvvGsSUlSwWDykzVurp7rUAms', // ID do seu Google Sheets
  GID: '41860490' // GID da aba específica
};

export interface DashboardKPIs {
  operacoesLiquidadas: number;
  operacoesEstruturacao: number;
  volumeLiquidado: string;
  volumeEstruturacao: string;
  feeLiquidado: string;
  feeEstruturacao: string;
  feeGestaoLiquidado: string;
  feeGestaoEstruturacao: string;
  feeMedio2025: string;
}

export function useDashboardData() {
  const { data, loading, error, refetch } = useGoogleSheets({
    sheetId: SHEETS_CONFIG.SHEET_ID,
    gid: SHEETS_CONFIG.GID
  });

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      // Retorna dados mock se não conseguir carregar do Sheets
      return getMockData();
    }

    // Processa os dados do Google Sheets
    return processSheetData(data);
  }, [data]);

  return {
    ...processedData,
    loading,
    error,
    refetch,
    isConnected: data.length > 0
  };
}

function processSheetData(data: SheetData[]) {
  // Filtra operações liquidadas e em estruturação
  const liquidadas = data.filter(row => 
    row['Status'] === 'Liquidada' || 
    row['Liquidação'] || 
    (row['Data Liquidação'] && row['Data Liquidação'] !== '')
  );
  
  const estruturacao = data.filter(row => 
    row['Status'] === 'Estruturação' || 
    row['Status'] === 'Em Estruturação' ||
    (!row['Data Liquidação'] || row['Data Liquidação'] === '')
  );

  // Calcula KPIs
  const kpis: DashboardKPIs = {
    operacoesLiquidadas: liquidadas.length,
    operacoesEstruturacao: estruturacao.length,
    volumeLiquidado: calculateSum(liquidadas, 'Volume').toFixed(1),
    volumeEstruturacao: calculateSum(estruturacao, 'Volume').toFixed(1),
    feeLiquidado: calculateSum(liquidadas, 'Fee Estruturação').toFixed(1),
    feeEstruturacao: calculateSum(estruturacao, 'Fee Estruturação').toFixed(1),
    feeGestaoLiquidado: calculateSum(liquidadas, 'Fee Gestão').toFixed(1),
    feeGestaoEstruturacao: calculateSum(estruturacao, 'Fee Gestão').toFixed(1),
    feeMedio2025: calculateAverageFormat(data, 'Fee Estruturação')
  };

  // Processa dados para gráficos
  const chartData = {
    operacoesPorMes: processMonthlyData(data),
    categorias: processCategoryData(data)
  };

  // Processa dados para tabelas
  const proximasLiquidacoes = estruturacao.slice(0, 5).map(row => ({
    categoria: row['Categoria'] || '',
    operacao: row['Operação'] || row['Nome'] || '',
    previsaoLiquidacao: row['Previsão Liquidação'] || row['Data Previsão'] || null,
    estruturacao: formatCurrency(row['Estruturação'] || row['Fee Estruturação'])
  }));

  const ultimasLiquidacoes = liquidadas.slice(-5).map(row => ({
    categoria: row['Categoria'] || '',
    operacao: row['Operação'] || row['Nome'] || '',
    estruturacao: formatCurrency(row['Estruturação'] || row['Fee Estruturação']),
    dataLiquidacao: row['Data Liquidação'] || ''
  }));

  return {
    kpis,
    chartData,
    proximasLiquidacoes,
    ultimasLiquidacoes
  };
}

function calculateSum(data: SheetData[], field: string): number {
  return data.reduce((sum, row) => {
    const value = typeof row[field] === 'number' ? row[field] : 
                 parseFloat(String(row[field]).replace(/[^\d.-]/g, '')) || 0;
    return sum + value;
  }, 0);
}

function calculateAverageFormat(data: SheetData[], field: string): string {
  const sum = calculateSum(data, field);
  const avg = sum / data.length;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(avg);
}

function formatCurrency(value: any): string {
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0;
  return new Intl.NumberFormat('pt-BR').format(num);
}

function processMonthlyData(data: SheetData[]) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months.map(mes => {
    const liquidadas = data.filter(row => {
      const date = row['Data Liquidação'];
      return date && String(date).includes(mes);
    }).length;
    
    const estruturacoes = data.filter(row => {
      const date = row['Data Início'] || row['Data'];
      return date && String(date).includes(mes);
    }).length;
    
    return { mes, liquidadas, estruturacoes };
  });
}

function processCategoryData(data: SheetData[]) {
  const categories: { [key: string]: number } = {};
  
  data.forEach(row => {
    const categoria = String(row['Categoria'] || 'Outros');
    categories[categoria] = (categories[categoria] || 0) + 1;
  });
  
  return Object.entries(categories).map(([name, count]) => ({
    name,
    value: Math.round((count / data.length) * 100),
    count
  }));
}

function getMockData() {
  // Dados mock originais como fallback
  const kpis: DashboardKPIs = {
    operacoesLiquidadas: 26,
    operacoesEstruturacao: 33,
    volumeLiquidado: "5.3",
    volumeEstruturacao: "8.0",
    feeLiquidado: "1.4",
    feeEstruturacao: "1.7",
    feeGestaoLiquidado: "152.9",
    feeGestaoEstruturacao: "196.5",
    feeMedio2025: "61.565,22"
  };

  const chartData = {
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
  };

  const proximasLiquidacoes = [
    { categoria: "Debênture", operacao: "Projeto Seed", previsaoLiquidacao: null, estruturacao: null },
    { categoria: "NC", operacao: "Acreditar", previsaoLiquidacao: null, estruturacao: "15.000,00" },
    { categoria: "CRA", operacao: "BRA Agroquímica", previsaoLiquidacao: "2025-08-12", estruturacao: "80.000,00" },
    { categoria: "Debênture", operacao: "Galicia", previsaoLiquidacao: "2025-08-13", estruturacao: "60.000,00" },
    { categoria: "CRI", operacao: "Vetter", previsaoLiquidacao: "2025-08-14", estruturacao: "45.000,00" }
  ];

  const ultimasLiquidacoes = [
    { categoria: "CRI", operacao: "Supera - Ciano", estruturacao: "60000", dataLiquidacao: "2025-07-22" },
    { categoria: "CRI", operacao: "Salto - Mariana Maria", estruturacao: "80000", dataLiquidacao: "2025-07-01" },
    { categoria: "DEB", operacao: "NPL EMSO II - nova série", estruturacao: "70000", dataLiquidacao: "2025-06-30" },
    { categoria: "DEB", operacao: "PINE", estruturacao: "80000", dataLiquidacao: "2025-06-27" },
    { categoria: "CRA", operacao: "Atlas Agro II", estruturacao: "45000", dataLiquidacao: "2025-06-26" }
  ];

  return {
    kpis,
    chartData,
    proximasLiquidacoes,
    ultimasLiquidacoes
  };
}