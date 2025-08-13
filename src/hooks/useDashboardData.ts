
import { useMemo } from 'react';
import { SheetData } from './useGoogleSheets';
import { useMultipleSheets } from './useMultipleSheets';

// Configuração do Google Sheets - EDITE AQUI PARA CONECTAR SEU SHEETS
const SHEETS_CONFIG = {
  SHEET_ID: '1QlDrtv5oPXYH9LsS7GhvvGsSUlSwWDykzVurp7rUAms', // ID do seu Google Sheets
  HISTORICO_GID: '41860490', // GID da aba Histórico (operações liquidadas)
  PIPE_GID: '1585681933' // GID da aba Pipe (operações em estruturação)
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

  // Verifica se temos dados válidos de pelo menos uma aba
  const hasValidData = (data.historico?.length || 0) > 0 || (data.pipe?.length || 0) > 0;
  const isConnected = hasValidData && !error;

  const processedData = useMemo(() => {
    const historicoData = data.historico || [];
    const pipeData = data.pipe || [];
    
    console.log('Historico Data:', historicoData);
    console.log('Pipe Data:', pipeData);

    // Filtra operações liquidadas (histórico) por data
    let filteredHistorico = historicoData;
    if (defaultStartDate || defaultEndDate) {
      filteredHistorico = historicoData.filter(row => {
        // Tenta primeiro com a chave col_X (Data de Liquidação na coluna Z - índice 25)
        const liquidationDate = row.col_25 || Object.values(row)[25] || Object.values(row)[0];
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
      const liquidationDate = Object.values(row)[0]; // Coluna A
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
    isConnected,
    defaultStartDate,
    defaultEndDate
  };
}

function processSheetData(historicoData: SheetData[], pipeData: SheetData[], lastYearData: SheetData[] = []) {
  console.log('Processing sheet data...');
  console.log('Historico rows:', historicoData.length);
  console.log('Pipe rows:', pipeData.length);
  
  // Operações liquidadas vêm do histórico - Coluna D (Operação)
  const liquidadas = historicoData.filter(row => {
    const operacao = row.col_3 || Object.values(row)[3]; // Coluna D (índice 3)
    return operacao && String(operacao).trim() !== '' && 
           String(operacao).trim() !== 'Operação' &&
           String(operacao).trim().toLowerCase() !== 'operação';
  });
  
  // Operações em estruturação vêm do pipe - Coluna D (Operação)  
  const estruturacao = pipeData.filter(row => {
    const operacao = row.col_3 || Object.values(row)[3]; // Coluna D (índice 3)
    return operacao && String(operacao).trim() !== '' && 
           String(operacao).trim() !== 'Operação' &&
           String(operacao).trim().toLowerCase() !== 'operação';
  });

  console.log('Filtered liquidadas:', liquidadas.length);
  console.log('Filtered estruturacao:', estruturacao.length);

  // Calcula mudanças em relação ao ano anterior
  const lastYearLiquidadas = lastYearData.filter(row => {
    const valores = Object.values(row);
    const operacao = valores[3]; // Coluna D - Operação
    return operacao && String(operacao).trim() !== '' && String(operacao).trim() !== 'Operação';
  }).length;
  
  const lastYearVolume = calculateSumByColumnIndex(lastYearData, 11); // Coluna L - Volume
  const lastYearFee = calculateSumByColumnIndex(lastYearData, 8); // Coluna I - Estruturação

  const currentLiquidadas = liquidadas.length;
  const currentVolume = calculateSumByColumnIndex(liquidadas, 11); // Coluna L - Volume
  const currentFee = calculateSumByColumnIndex(liquidadas, 8); // Coluna I - Estruturação

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
    volumeLiquidado: (currentVolume / 1000000000).toFixed(1), // Coluna L - Volume em bilhões
    volumeEstruturacao: (calculateSumByColumnIndex(estruturacao, 11) / 1000000000).toFixed(1), // Coluna L - Volume em bilhões
    feeLiquidado: (currentFee / 1000000).toFixed(1), // Coluna I - Estruturação em milhões
    feeEstruturacao: (calculateSumByColumnIndex(estruturacao, 8) / 1000000).toFixed(1), // Coluna I - Estruturação em milhões
    feeGestaoLiquidado: (calculateSumByColumnIndex(liquidadas, 9) / 1000).toFixed(1), // Coluna J - Gestão em milhares
    feeGestaoEstruturacao: (calculateSumByColumnIndex(estruturacao, 9) / 1000).toFixed(1), // Coluna J - Gestão em milhares
    feeMedio2025: calculateAverageByColumnIndex([...liquidadas, ...estruturacao], 8), // Coluna I - Estruturação
    // Comparações com ano anterior
    operacoesLiquidadasChange: getPercentChange(currentLiquidadas, lastYearLiquidadas),
    volumeLiquidadoChange: getPercentChange(currentVolume, lastYearVolume),
    feeLiquidadoChange: getPercentChange(currentFee, lastYearFee)
  };

  console.log('Calculated KPIs:', kpis);

  // Processa dados para gráficos
  const chartData = {
    operacoesPorMes: processMonthlyData(liquidadas, estruturacao),
    categorias: processCategoryData([...liquidadas, ...estruturacao])
  };

  // Processa dados para tabelas (usando primeiras colunas disponíveis)
  const proximasLiquidacoes = estruturacao.slice(0, 5).map(row => {
    const valores = Object.values(row);
    return {
      categoria: String(valores[1] || ''), // Coluna B
      operacao: String(valores[3] || ''), // Coluna D
      previsaoLiquidacao: String(valores[5] || ''), // Coluna F
      estruturacao: formatCurrency(valores[8] || 0) // Coluna I
    };
  });

  const ultimasLiquidacoes = liquidadas.slice(-5).map(row => {
    const valores = Object.values(row);
    return {
      categoria: String(valores[1] || ''), // Coluna B
      operacao: String(valores[3] || ''), // Coluna D
      estruturacao: formatCurrency(valores[8] || 0), // Coluna I
      dataLiquidacao: String(valores[0] || '') // Coluna A
    };
  });

  return {
    kpis,
    chartData,
    proximasLiquidacoes,
    ultimasLiquidacoes
  };
}

function calculateSumByColumnIndex(data: SheetData[], columnIndex: number): number {
  return data.reduce((sum, row) => {
    // Tenta primeiro com a chave col_X, depois com Object.values
    const value = row[`col_${columnIndex}`] || Object.values(row)[columnIndex];
    
    if (!value) return sum;
    
    const numValue = typeof value === 'number' ? value : 
                    parseFloat(String(value).replace(/[R$\s,]/g, '').replace(/\./g, '').replace(/,/g, '.')) || 0;
    
    return sum + numValue;
  }, 0);
}

function calculateAverageByColumnIndex(data: SheetData[], columnIndex: number): string {
  if (data.length === 0) return "R$ 0,00";
  
  const sum = calculateSumByColumnIndex(data, columnIndex);
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
      const date = Object.values(row)[0]; // Coluna A
      return date && String(date).includes(mes);
    }).length;
    
    const estruturacoesCount = estruturacoes.filter(row => {
      const date = Object.values(row)[0]; // Coluna A
      return date && String(date).includes(mes);
    }).length;
    
    return { mes, liquidadas: liquidadasCount, estruturacoes: estruturacoesCount };
  });
}

function processCategoryData(data: SheetData[]) {
  const categories: { [key: string]: number } = {};
  
  data.forEach(row => {
    const valores = Object.values(row);
    const categoria = String(valores[1] || 'Outros'); // Coluna B
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
