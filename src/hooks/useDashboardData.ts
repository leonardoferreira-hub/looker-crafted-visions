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

export function useDashboardData(startDate?: Date | null, endDate?: Date | null) {
  const { data, loading, error, refetch } = useGoogleSheets({
    sheetId: SHEETS_CONFIG.SHEET_ID,
    gid: SHEETS_CONFIG.GID
  });

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return getMockData();
    }

    // Filtra dados por data se fornecidas
    let filteredData = data;
    if (startDate || endDate) {
      filteredData = data.filter(row => {
        const liquidationDate = row['Data Liquidação'] || row['Data de Liquidação'];
        if (!liquidationDate) return false;
        
        const date = parseDate(liquidationDate);
        if (!date) return false;
        
        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;
        
        return true;
      });
    }

    return processSheetData(filteredData);
  }, [data, startDate, endDate]);

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