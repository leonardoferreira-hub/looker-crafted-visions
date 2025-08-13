import { useMemo } from 'react';
import { SheetData } from './useGoogleSheets';
import { useMultipleSheets } from './useMultipleSheets';

// Configuração do Google Sheets - EDITE AQUI PARA CONECTAR SEU SHEETS
const SHEETS_CONFIG = {
  SHEET_ID: '1QlDrtv5oPXYH9LsS7GhvvGsSUlSwWDykzVurp7rUAms', // ID do seu Google Sheets
  HISTORICO_GID: '41860490', // GID da aba Histórico (operações liquidadas)
  PIPE_GID: '0' // GID da aba Pipe (operações em estruturação)
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
  // Comparações com ano anterior
  operacoesLiquidadasChange?: { value: string; type: 'positive' | 'negative' };
  volumeLiquidadoChange?: { value: string; type: 'positive' | 'negative' };
  feeLiquidadoChange?: { value: string; type: 'positive' | 'negative' };
}

export function useDashboardData(startDate?: Date | null, endDate?: Date | null) {
  // Define período padrão: 1º de janeiro do ano atual até hoje
  const defaultStartDate = startDate || new Date(new Date().getFullYear(), 0, 1);
  const defaultEndDate = endDate || new Date();
  
  const { data, loading, error, refetch } = useMultipleSheets({
    sheetId: SHEETS_CONFIG.SHEET_ID,
    sheets: [
      { name: 'historico', gid: SHEETS_CONFIG.HISTORICO_GID },
      { name: 'pipe', gid: SHEETS_CONFIG.PIPE_GID }
    ]
  });

  const processedData = useMemo(() => {
    const historicoData = data.historico || [];
    const pipeData = data.pipe || [];
    
    if (historicoData.length === 0 && pipeData.length === 0) {
      return getMockData();
    }

    // Filtra operações liquidadas (histórico) por data
    let filteredHistorico = historicoData;
    if (defaultStartDate || defaultEndDate) {
      filteredHistorico = historicoData.filter(row => {
        const liquidationDate = row['Data Liquidação'] || row['Data de Liquidação'] || row['Data'];
        if (!liquidationDate) return false;
        
        const date = parseDate(liquidationDate);
        if (!date) return false;
        
        if (defaultStartDate && date < defaultStartDate) return false;
        if (defaultEndDate && date > defaultEndDate) return false;
        
        return true;
      });
    }

    // Calcula dados do ano anterior para comparação
    const lastYearStart = new Date(defaultStartDate.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(defaultEndDate.getFullYear() - 1, defaultEndDate.getMonth(), defaultEndDate.getDate());
    
    const lastYearData = historicoData.filter(row => {
      const liquidationDate = row['Data Liquidação'] || row['Data de Liquidação'] || row['Data'];
      if (!liquidationDate) return false;
      
      const date = parseDate(liquidationDate);
      if (!date) return false;
      
      return date >= lastYearStart && date <= lastYearEnd;
    });

    return processSheetData(filteredHistorico, pipeData, lastYearData);
  }, [data, defaultStartDate, defaultEndDate]);

  return {
    ...processedData,
    loading,
    error,
    refetch,
    isConnected: (data.historico?.length || 0) + (data.pipe?.length || 0) > 0,
    defaultStartDate,
    defaultEndDate
  };
}

function processSheetData(historicoData: SheetData[], pipeData: SheetData[], lastYearData: SheetData[] = []) {
  // Operações liquidadas vêm do histórico
  const liquidadas = historicoData;
  
  // Operações em estruturação vêm do pipe
  const estruturacao = pipeData;

  // Calcula mudanças em relação ao ano anterior
  const lastYearLiquidadas = lastYearData.length;
  const lastYearVolume = calculateSum(lastYearData, 'Volume') || calculateSum(lastYearData, 'Valor') || 0;
  const lastYearFee = calculateSum(lastYearData, 'Fee Estruturação') || calculateSum(lastYearData, 'Fee') || 0;

  const currentLiquidadas = liquidadas.length;
  const currentVolume = calculateSum(liquidadas, 'Volume') || calculateSum(liquidadas, 'Valor') || 0;
  const currentFee = calculateSum(liquidadas, 'Fee Estruturação') || calculateSum(liquidadas, 'Fee') || 0;

  // Calcula percentuais de mudança
  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return { value: "+100%", type: "positive" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      type: change >= 0 ? "positive" as const : "negative" as const
    };
  };

  // Calcula KPIs
  const kpis: DashboardKPIs = {
    operacoesLiquidadas: currentLiquidadas,
    operacoesEstruturacao: estruturacao.length,
    volumeLiquidado: currentVolume.toFixed(1),
    volumeEstruturacao: (calculateSum(estruturacao, 'Volume') || calculateSum(estruturacao, 'Valor') || 0).toFixed(1),
    feeLiquidado: currentFee.toFixed(1),
    feeEstruturacao: (calculateSum(estruturacao, 'Fee Estruturação') || calculateSum(estruturacao, 'Fee') || 0).toFixed(1),
    feeGestaoLiquidado: (calculateSum(liquidadas, 'Fee Gestão') || calculateSum(liquidadas, 'Fee de Gestão') || 0).toFixed(1),
    feeGestaoEstruturacao: (calculateSum(estruturacao, 'Fee Gestão') || calculateSum(estruturacao, 'Fee de Gestão') || 0).toFixed(1),
    feeMedio2025: calculateAverageFormat([...liquidadas, ...estruturacao], 'Fee Estruturação') || calculateAverageFormat([...liquidadas, ...estruturacao], 'Fee'),
    // Comparações com ano anterior
    operacoesLiquidadasChange: getPercentChange(currentLiquidadas, lastYearLiquidadas),
    volumeLiquidadoChange: getPercentChange(currentVolume, lastYearVolume),
    feeLiquidadoChange: getPercentChange(currentFee, lastYearFee)
  };

  // Processa dados para gráficos
  const chartData = {
    operacoesPorMes: processMonthlyData(liquidadas, estruturacao),
    categorias: processCategoryData([...liquidadas, ...estruturacao])
  };

  // Processa dados para tabelas
  const proximasLiquidacoes = estruturacao.slice(0, 5).map(row => ({
    categoria: row['Categoria'] || row['Tipo'] || '',
    operacao: row['Operação'] || row['Nome'] || row['Projeto'] || '',
    previsaoLiquidacao: row['Previsão Liquidação'] || row['Data Previsão'] || row['Previsão'] || null,
    estruturacao: formatCurrency(row['Estruturação'] || row['Fee Estruturação'] || row['Fee'])
  }));

  const ultimasLiquidacoes = liquidadas.slice(-5).map(row => ({
    categoria: row['Categoria'] || row['Tipo'] || '',
    operacao: row['Operação'] || row['Nome'] || row['Projeto'] || '',
    estruturacao: formatCurrency(row['Estruturação'] || row['Fee Estruturação'] || row['Fee']),
    dataLiquidacao: row['Data Liquidação'] || row['Data de Liquidação'] || row['Data'] || ''
  }));

  return {
    kpis,
    chartData,
    proximasLiquidacoes,
    ultimasLiquidacoes
  };
}

function calculateSum(data: SheetData[], field: string): number {
  const possibleFields = [field, field.toLowerCase(), field.toUpperCase()];
  
  return data.reduce((sum, row) => {
    let value = 0;
    
    // Tenta encontrar o campo com diferentes variações de nome
    for (const fieldName of possibleFields) {
      if (row[fieldName] !== undefined) {
        value = typeof row[fieldName] === 'number' ? row[fieldName] : 
               parseFloat(String(row[fieldName]).replace(/[^\d.-]/g, '')) || 0;
        break;
      }
    }
    
    return sum + value;
  }, 0);
}

function calculateAverageFormat(data: SheetData[], field: string): string {
  if (data.length === 0) return "R$ 0,00";
  
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

function processMonthlyData(liquidadas: SheetData[], estruturacoes: SheetData[]) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months.map(mes => {
    const liquidadasCount = liquidadas.filter(row => {
      const date = row['Data Liquidação'] || row['Data de Liquidação'] || row['Data'];
      return date && String(date).includes(mes);
    }).length;
    
    const estruturacoesCount = estruturacoes.filter(row => {
      const date = row['Data Início'] || row['Data'] || row['Data de Criação'];
      return date && String(date).includes(mes);
    }).length;
    
    return { mes, liquidadas: liquidadasCount, estruturacoes: estruturacoesCount };
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

function parseDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  
  const str = String(dateStr).trim();
  if (!str) return null;
  
  // Tenta diferentes formatos de data
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
  ];
  
  for (const format of formats) {
    const match = str.match(format);
    if (match) {
      let day, month, year;
      if (format === formats[1]) { // YYYY-MM-DD
        [, year, month, day] = match;
      } else { // DD/MM/YYYY ou DD-MM-YYYY
        [, day, month, year] = match;
      }
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  return null;
}

function getMockData() {
  // Dados vazios se não conseguir carregar do Sheets
  const kpis: DashboardKPIs = {
    operacoesLiquidadas: 0,
    operacoesEstruturacao: 0,
    volumeLiquidado: "0.0",
    volumeEstruturacao: "0.0",
    feeLiquidado: "0.0",
    feeEstruturacao: "0.0",
    feeGestaoLiquidado: "0.0",
    feeGestaoEstruturacao: "0.0",
    feeMedio2025: "0,00"
  };

  const chartData = {
    operacoesPorMes: [],
    categorias: []
  };

  return {
    kpis,
    chartData,
    proximasLiquidacoes: [],
    ultimasLiquidacoes: []
  };
}