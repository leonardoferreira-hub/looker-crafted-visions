import { useMemo } from 'react';
import { SheetData } from './useGoogleSheets';
import { useMultipleSheets } from './useMultipleSheets';

// Configuração do Google Sheets - EDITE AQUI PARA CONECTAR SEU SHEETS
const SHEETS_CONFIG = {
  SHEET_ID: '1QlDrtv5oPXYH9LsS7GhvvGsSUlSwWDykzVurp7rUAms', // ID do seu Google Sheets
  HISTORICO_GID: '41860490', // GID da aba Histórico (operações liquidadas)
  PIPE_GID: '1585681933' // GID da aba Pipe (operações em estruturação)
};

// Mapeamento das colunas do Google Sheets
// IMPORTANTE: Índices baseados em 0 (coluna A = 0, coluna B = 1, etc.)
const SHEETS_COLUMNS = {
  // Colunas da aba Histórico (operações liquidadas)
  HISTORICO: {
    PMO: 0,                    // Coluna A (índice 0)
    CATEGORIA: 1,              // Coluna B (índice 1)
    OPERACAO: 2,               // Coluna C (índice 2)
    PREVISAO_LIQUIDACAO: 3,    // Coluna D (índice 3)
    VEICULO: 4,                // Coluna E (índice 4)
    EMISSAO: 5,                // Coluna F (índice 5)
    SERIES: 6,                 // Coluna G (índice 6)
    ESTRUTURACAO: 7,           // Coluna H (índice 7)
    GESTAO: 8,                 // Coluna I (índice 8)
    ORIGINACAO: 9,             // Coluna J (índice 9)
    VOLUME: 10,                // Coluna K (índice 10)
    REMUNERACAO: 11,           // Coluna L (índice 11)
    LASTRO: 12,                // Coluna M (índice 12)
    BOLETAGEM: 13,             // Coluna N (índice 13)
    BANCO: 14,                 // Coluna O (índice 14)
    AGENCIA: 15,               // Coluna P (índice 15)
    CONTA_BANCARIA: 16,        // Coluna Q (índice 16)
    MAJORACAO: 17,             // Coluna R (índice 17)
    DATA_ENTRADA_PIPE: 18,     // Coluna S (índice 18)
    PROXIMOS_PASSOS: 19,       // Coluna T (índice 19)
    ALERTAS: 20,               // Coluna U (índice 20)
    STATUS: 21,                // Coluna V (índice 21)
    RESUMO: 22,                // Coluna W (índice 22)
    ANALISTA_GESTAO: 23,       // Coluna X (índice 23)
    INVESTIDORES: 24,          // Coluna Y (índice 24)
    DATA_LIQUIDACAO: 25,       // Coluna Z (índice 25) - CHAVE PARA GRÁFICO
    PRIMEIRA_DATA_PAGAMENTO: 26, // Coluna AA (índice 26)
    MAPA_LIQUIDACAO: 27,       // Coluna AB (índice 27)
    MAPA_REGISTROS: 28,        // Coluna AC (índice 28)
    LO: 29,                    // Coluna AD (índice 29)
    DD: 30,                    // Coluna AE (índice 30)
    EMAIL_PRESTADORES: 31,     // Coluna AF (índice 31)
    PASSAGEM_BASTAO: 32,       // Coluna AG (índice 32)
    KICK_OFF: 33,              // Coluna AH (índice 33)
    HISTORICO: 34              // Coluna AI (índice 34)
  },
  // Colunas da aba Pipe (operações em estruturação)
  PIPE: {
    PMO: 0,                    // Coluna A (índice 0)
    CATEGORIA: 1,              // Coluna B (índice 1)
    OPERACAO: 2,               // Coluna C (índice 2)
    PREVISAO_LIQUIDACAO: 3,    // Coluna D (índice 3)
    VEICULO: 4,                // Coluna E (índice 4)
    EMISSAO: 5,                // Coluna F (índice 5)
    SERIES: 6,                 // Coluna G (índice 6)
    ESTRUTURACAO: 7,           // Coluna H (índice 7)
    GESTAO: 8,                 // Coluna I (índice 8)
    ORIGINACAO: 9,             // Coluna J (índice 9)
    VOLUME: 10,                // Coluna K (índice 10)
    REMUNERACAO: 11,           // Coluna L (índice 11)
    LASTRO: 12,                // Coluna M (índice 12)
    BOLETAGEM: 13,             // Coluna N (índice 13)
    BANCO: 14,                 // Coluna O (índice 14)
    AGENCIA: 15,               // Coluna P (índice 15)
    CONTA_BANCARIA: 16,        // Coluna Q (índice 16)
    MAJORACAO: 17,             // Coluna R (índice 17)
    DATA_ENTRADA_PIPE: 18,     // Coluna S (índice 18)
    PROXIMOS_PASSOS: 19,       // Coluna T (índice 19)
    ALERTAS: 20,               // Coluna U (índice 20)
    STATUS: 21,                // Coluna V (índice 21)
    RESUMO: 22,                // Coluna W (índice 22)
    ANALISTA_GESTAO: 23,       // Coluna X (índice 23)
    INVESTIDORES: 24,          // Coluna Y (índice 24)
    DATA_LIQUIDACAO: 25,       // Coluna Z (índice 25)
    PRIMEIRA_DATA_PAGAMENTO: 26, // Coluna AA (índice 26)
    MAPA_LIQUIDACAO: 27,       // Coluna AB (índice 27)
    MAPA_REGISTROS: 28,        // Coluna AC (índice 28)
    LO: 29,                    // Coluna AD (índice 29)
    DD: 30,                    // Coluna AE (índice 30)
    EMAIL_PRESTADORES: 31,     // Coluna AF (índice 31)
    PASSAGEM_BASTAO: 32,       // Coluna AG (índice 32)
    KICK_OFF: 33,              // Coluna AH (índice 33)
    DIAS: 34                   // Coluna AI (índice 34)
  }
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

    // Filtra operações liquidadas (histórico) por data usando a coluna DATA_LIQUIDACAO
    let filteredHistorico = historicoData;
    if (defaultStartDate || defaultEndDate) {
      filteredHistorico = historicoData.filter(row => {
        const liquidationDate = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
        if (!liquidationDate) return true; // Se não tem data, inclui na consulta
        
        const date = parseDate(liquidationDate);
        if (!date) return true;
        
        if (defaultStartDate && date < defaultStartDate) return false;
        if (defaultEndDate && date > defaultEndDate) return false;
        
        return true;
      });
    }

    // Calcula dados do ano anterior para comparação
    const lastYearStart = new Date(defaultStartDate.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(defaultEndDate.getFullYear() - 1, defaultEndDate.getMonth(), defaultEndDate.getDate());
    
    const lastYearData = historicoData.filter(row => {
      const liquidationDate = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
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

// Função auxiliar para obter valor de célula de forma consistente
function getCellValue(row: SheetData, columnIndex: number): any {
  // Tenta primeiro com a chave col_X, depois com Object.values, depois com índice direto
  return row[`col_${columnIndex}`] || Object.values(row)[columnIndex] || row[columnIndex];
}

// Função auxiliar para verificar se uma linha é válida (não é cabeçalho)
function isValidRow(row: SheetData, operacaoColumnIndex: number): boolean {
  const operacao = getCellValue(row, operacaoColumnIndex);
  if (!operacao) return false;
  
  const operacaoStr = String(operacao).trim();
  
  // Filtros para identificar linhas de cabeçalho ou inválidas
  const invalidPatterns = [
    '', 
    'Operação', 
    'operação',
    'PMO',
    'OPERAÇÃO'
  ];
  
  return !invalidPatterns.some(pattern => 
    operacaoStr.toLowerCase() === pattern.toLowerCase() ||
    operacaoStr.includes('PMO')
  );
}

function processSheetData(historicoData: SheetData[], pipeData: SheetData[], lastYearData: SheetData[] = []) {
  console.log('Processing sheet data...');
  console.log('Historico rows:', historicoData.length);
  console.log('Pipe rows:', pipeData.length);
  
  // Operações liquidadas vêm do histórico
  const liquidadas = historicoData.filter(row => 
    isValidRow(row, SHEETS_COLUMNS.HISTORICO.OPERACAO)
  );
  
  // Operações em estruturação vêm do pipe
  const estruturacao = pipeData.filter(row => 
    isValidRow(row, SHEETS_COLUMNS.PIPE.OPERACAO)
  );

  console.log('Filtered liquidadas:', liquidadas.length);
  console.log('Filtered estruturacao:', estruturacao.length);

  // Calcula mudanças em relação ao ano anterior
  const lastYearLiquidadas = lastYearData.filter(row => 
    isValidRow(row, SHEETS_COLUMNS.HISTORICO.OPERACAO)
  ).length;
  
  const lastYearVolume = calculateSumByColumnIndex(lastYearData, SHEETS_COLUMNS.HISTORICO.VOLUME);
  const lastYearFee = calculateSumByColumnIndex(lastYearData, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO);

  const currentLiquidadas = liquidadas.length;
  const currentVolume = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.VOLUME);
  const currentFee = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO);

  // Calcula percentuais de mudança
  const getPercentChange = (current: number, previous: number) => {
    if (previous === 0) return { value: "+100%", type: "positive" as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
      type: change >= 0 ? "positive" as const : "negative" as const
    };
  };

  // Calcula KPIs usando mapeamento de colunas correto
  const kpis: DashboardKPIs = {
    operacoesLiquidadas: currentLiquidadas,
    operacoesEstruturacao: estruturacao.length,
    volumeLiquidado: (currentVolume / 1000000000).toFixed(1), // Volume em bilhões
    volumeEstruturacao: (calculateSumByColumnIndex(estruturacao, SHEETS_COLUMNS.PIPE.VOLUME) / 1000000000).toFixed(1), // Volume em bilhões
    feeLiquidado: (currentFee / 1000000).toFixed(1), // Estruturação em milhões
    feeEstruturacao: (calculateSumByColumnIndex(estruturacao, SHEETS_COLUMNS.PIPE.ESTRUTURACAO) / 1000000).toFixed(1), // Estruturação em milhões
    feeGestaoLiquidado: (calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.GESTAO) / 1000).toFixed(0), // Gestão em milhares
    feeGestaoEstruturacao: (calculateSumByColumnIndex(estruturacao, SHEETS_COLUMNS.PIPE.GESTAO) / 1000).toFixed(0), // Gestão em milhares
    feeMedio2025: calculateAverageByColumnIndex([...liquidadas, ...estruturacao], SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO), // Estruturação média
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

  // Processa dados para tabelas
  const proximasLiquidacoes = estruturacao.slice(0, 5).map(row => ({
    categoria: String(getCellValue(row, SHEETS_COLUMNS.PIPE.CATEGORIA) || ''),
    operacao: String(getCellValue(row, SHEETS_COLUMNS.PIPE.OPERACAO) || ''),
    previsaoLiquidacao: String(getCellValue(row, SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO) || ''),
    estruturacao: formatCurrency(getCellValue(row, SHEETS_COLUMNS.PIPE.ESTRUTURACAO) || 0)
  }));

  const ultimasLiquidacoes = liquidadas.slice(-5).map(row => ({
    categoria: String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.CATEGORIA) || ''),
    operacao: String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO) || ''),
    estruturacao: formatCurrency(getCellValue(row, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO) || 0),
    dataLiquidacao: String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO) || '')
  }));

  return {
    kpis,
    chartData,
    proximasLiquidacoes,
    ultimasLiquidacoes
  };
}

function calculateSumByColumnIndex(data: SheetData[], columnIndex: number): number {
  return data.reduce((sum, row) => {
    const value = getCellValue(row, columnIndex);
    
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
    // Para operações liquidadas, usar a coluna DATA_LIQUIDACAO
    const liquidadasCount = liquidadas.filter(row => {
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      return dataLiquidacao && String(dataLiquidacao).includes(mes);
    }).length;
    
    // Para operações em estruturação, usar a coluna DATA_ENTRADA_PIPE
    const estruturacoesCount = estruturacoes.filter(row => {
      const dataEntrada = getCellValue(row, SHEETS_COLUMNS.PIPE.DATA_ENTRADA_PIPE);
      return dataEntrada && String(dataEntrada).includes(mes);
    }).length;
    
    return { mes, liquidadas: liquidadasCount, estruturacoes: estruturacoesCount };
  });
}

function processCategoryData(data: SheetData[]) {
  const categories: { [key: string]: number } = {};
  
  data.forEach(row => {
    // Determinar qual conjunto de colunas usar baseado na presença de dados
    const categoria = String(
      getCellValue(row, SHEETS_COLUMNS.HISTORICO.CATEGORIA) || 
      getCellValue(row, SHEETS_COLUMNS.PIPE.CATEGORIA) || 
      'Outros'
    );
    
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
    /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, // DD/MM/YY
  ];
  
  for (const format of formats) {
    const match = str.match(format);
    if (match) {
      let day, month, year;
      
      if (format === formats[1]) { // YYYY-MM-DD
        [, year, month, day] = match;
      } else { // DD/MM/YYYY, DD-MM-YYYY ou DD/MM/YY
        [, day, month, year] = match;
        // Ajusta anos de 2 dígitos
        if (year.length === 2) {
          const currentYear = new Date().getFullYear();
          const currentCentury = Math.floor(currentYear / 100) * 100;
          year = String(currentCentury + parseInt(year));
        }
      }
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  return null;
}