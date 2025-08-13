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
const SHEETS_COLUMNS = {
  // Colunas da aba Histórico (operações liquidadas)
  HISTORICO: {
    PMO: 1,                    // Coluna B (índice 1)
    CATEGORIA: 2,              // Coluna C (índice 2)
    OPERACAO: 3,               // Coluna D (índice 3)
    PREVISAO_LIQUIDACAO: 4,    // Coluna E (índice 4)
    VEICULO: 5,                // Coluna F (índice 5)
    EMISSAO: 6,                // Coluna G (índice 6)
    SERIES: 7,                 // Coluna H (índice 7)
    ESTRUTURACAO: 8,           // Coluna I (índice 8)
    GESTAO: 9,                 // Coluna J (índice 9)
    ORIGINACAO: 10,            // Coluna K (índice 10)
    VOLUME: 11,                // Coluna L (índice 11)
    REMUNERACAO: 12,           // Coluna M (índice 12)
    LASTRO: 13,                // Coluna N (índice 13)
    BOLETAGEM: 14,             // Coluna O (índice 14)
    BANCO: 15,                 // Coluna P (índice 15)
    AGENCIA: 16,               // Coluna Q (índice 16)
    CONTA_BANCARIA: 17,        // Coluna R (índice 17)
    MAJORACAO: 18,             // Coluna S (índice 18)
    DATA_ENTRADA_PIPE: 19,     // Coluna T (índice 19)
    PROXIMOS_PASSOS: 20,       // Coluna U (índice 20)
    ALERTAS: 21,               // Coluna V (índice 21)
    STATUS: 22,                // Coluna W (índice 22)
    RESUMO: 23,                // Coluna X (índice 23)
    ANALISTA_GESTAO: 24,       // Coluna Y (índice 24)
    INVESTIDORES: 25,          // Coluna Z (índice 25)
    DATA_LIQUIDACAO: 26,       // Coluna AA (índice 26) - CHAVE PARA GRÁFICO
    // Nota: A=0, B=1, C=2... Z=25, AA=26. Mas pode ser que API use 1-based indexing
    PRIMEIRA_DATA_PAGAMENTO: 27, // Coluna AB (índice 27)
    MAPA_LIQUIDACAO: 28,       // Coluna AC (índice 28)
    MAPA_REGISTROS: 29,        // Coluna AD (índice 29)
    LO: 30,                    // Coluna AE (índice 30)
    DD: 31,                    // Coluna AF (índice 31)
    EMAIL_PRESTADORES: 32,     // Coluna AG (índice 32)
    PASSAGEM_BASTAO: 33,       // Coluna AH (índice 33)
    KICK_OFF: 34,              // Coluna AI (índice 34)
    HISTORICO: 35              // Coluna AJ (índice 35)
  },
  // Colunas da aba Pipe (operações em estruturação)
  PIPE: {
    PMO: 1,                    // Coluna B (índice 1)
    CATEGORIA: 2,              // Coluna C (índice 2)
    OPERACAO: 3,               // Coluna D (índice 3)
    PREVISAO_LIQUIDACAO: 4,    // Coluna E (índice 4)
    VEICULO: 5,                // Coluna F (índice 5)
    EMISSAO: 6,                // Coluna G (índice 6)
    SERIES: 7,                 // Coluna H (índice 7)
    ESTRUTURACAO: 8,           // Coluna I (índice 8)
    GESTAO: 9,                 // Coluna J (índice 9)
    ORIGINACAO: 10,            // Coluna K (índice 10)
    VOLUME: 11,                // Coluna L (índice 11)
    REMUNERACAO: 12,           // Coluna M (índice 12)
    LASTRO: 13,                // Coluna N (índice 13)
    BOLETAGEM: 14,             // Coluna O (índice 14)
    BANCO: 15,                 // Coluna P (índice 15)
    AGENCIA: 16,               // Coluna Q (índice 16)
    CONTA_BANCARIA: 17,        // Coluna R (índice 17)
    MAJORACAO: 18,             // Coluna S (índice 18)
    DATA_ENTRADA_PIPE: 19,     // Coluna T (índice 19)
    PROXIMOS_PASSOS: 20,       // Coluna U (índice 20)
    ALERTAS: 21,               // Coluna V (índice 21)
    STATUS: 22,                // Coluna W (índice 22)
    RESUMO: 23,                // Coluna X (índice 23)
    ANALISTA_GESTAO: 24,       // Coluna Y (índice 24)
    INVESTIDORES: 25,          // Coluna Z (índice 25)
    DATA_LIQUIDACAO: 26,       // Coluna AA (índice 26)
    PRIMEIRA_DATA_PAGAMENTO: 27, // Coluna AB (índice 27)
    MAPA_LIQUIDACAO: 28,       // Coluna AC (índice 28)
    MAPA_REGISTROS: 29,        // Coluna AD (índice 29)
    LO: 30,                    // Coluna AE (índice 30)
    DD: 31,                    // Coluna AF (índice 31)
    EMAIL_PRESTADORES: 32,     // Coluna AG (índice 32)
    PASSAGEM_BASTAO: 33,       // Coluna AH (índice 33)
    KICK_OFF: 34,              // Coluna AI (índice 34)
    DIAS: 35                   // Coluna AJ (índice 35)
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
  // Define período padrão: 1º de janeiro de 2025 até hoje
  const defaultStartDate = startDate || new Date(2025, 0, 1);
  const defaultEndDate = endDate || new Date();
  
  const { data, loading, error, refetch } = useMultipleSheets({
    sheetId: SHEETS_CONFIG.SHEET_ID,
    sheets: [
      { name: 'historico', gid: SHEETS_CONFIG.HISTORICO_GID, headerRowIndex: 2 }, // Header starts at row 3 (0-based index 2)
      { name: 'pipe', gid: SHEETS_CONFIG.PIPE_GID, headerRowIndex: 7 } // Header starts at row 8 (0-based index 7)
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

  // Filtra operações liquidadas (histórico) por data usando a coluna correta
  let filteredHistorico = historicoData;
  if (defaultStartDate || defaultEndDate) {
    filteredHistorico = historicoData.filter(row => {
      // Usar a coluna DATA_LIQUIDACAO (coluna 26) para filtrar por data
      const liquidationDate = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      
      // Debug apenas se o valor estiver vazio ou inválido
      if (!liquidationDate || liquidationDate === '') {
        console.log('DATA_LIQUIDACAO vazia para linha:', row);
        return true; // Se não tem data, inclui na consulta
      }
      
      const date = parseDate(liquidationDate);
      if (!date) {
        console.log('Data inválida após parseDate:', liquidationDate);
        return true;
      }
      
      if (defaultStartDate && date < defaultStartDate) return false;
      if (defaultEndDate && date > defaultEndDate) return false;
      
      return true;
    });
  }

    // Calcula dados de 2024 para comparação (mesmo período)
    const lastYearStart = new Date(2024, defaultStartDate.getMonth(), defaultStartDate.getDate());
    const lastYearEnd = new Date(2024, defaultEndDate.getMonth(), defaultEndDate.getDate());
    
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
  if (!row) return null;
  
  // Debug mais limpo para verificar se está pegando a data corretamente
  if (columnIndex === 26 && row[`col_${columnIndex}`]) {
    console.log(`DATA_LIQUIDACAO encontrada:`, row[`col_${columnIndex}`]);
  }
  
  // Tenta diferentes métodos para acessar o valor da célula
  let value = row[`col_${columnIndex}`] || 
              Object.values(row)[columnIndex] || 
              row[columnIndex];
  
  // Limpa valores vazios ou apenas espaços
  if (value !== null && value !== undefined) {
    const strValue = String(value).trim();
    if (strValue === '' || strValue === 'null' || strValue === 'undefined') {
      return null;
    }
    return strValue;
  }
  
  return null;
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
  
  // Operações liquidadas vêm do histórico - usar mapeamento de colunas
  const liquidadas = historicoData.filter(row => {
    const operacao = row[`col_${SHEETS_COLUMNS.HISTORICO.OPERACAO}`] || Object.values(row)[SHEETS_COLUMNS.HISTORICO.OPERACAO];
    return operacao && 
           String(operacao).trim() !== '' && 
           String(operacao).trim() !== 'Operação' &&
           String(operacao).trim().toLowerCase() !== 'operação' &&
           !String(operacao).includes('PMO');
  });
  
  // Operações em estruturação vêm do pipe - usar mapeamento de colunas
  const estruturacao = pipeData.filter(row => {
    const operacao = row[`col_${SHEETS_COLUMNS.PIPE.OPERACAO}`] || Object.values(row)[SHEETS_COLUMNS.PIPE.OPERACAO];
    return operacao && 
           String(operacao).trim() !== '' && 
           String(operacao).trim() !== 'Operação' &&
           String(operacao).trim().toLowerCase() !== 'operação' &&
           !String(operacao).includes('PMO');
  });

  console.log('Filtered liquidadas:', liquidadas.length);
  console.log('Filtered estruturacao:', estruturacao.length);

  // Calcula mudanças em relação ao ano anterior
  const lastYearLiquidadas = lastYearData.filter(row => {
    const operacao = row[`col_${SHEETS_COLUMNS.HISTORICO.OPERACAO}`] || Object.values(row)[SHEETS_COLUMNS.HISTORICO.OPERACAO];
    return operacao && String(operacao).trim() !== '' && String(operacao).trim() !== 'Operação';
  }).length;
  
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

  // Calcula KPIs usando mapeamento de colunas
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

  // Processa dados para tabelas usando mapeamento de colunas
  const proximasLiquidacoes = estruturacao.slice(0, 5).map(row => {
    return {
      categoria: String(row[`col_${SHEETS_COLUMNS.PIPE.CATEGORIA}`] || Object.values(row)[SHEETS_COLUMNS.PIPE.CATEGORIA] || ''),
      operacao: String(row[`col_${SHEETS_COLUMNS.PIPE.OPERACAO}`] || Object.values(row)[SHEETS_COLUMNS.PIPE.OPERACAO] || ''),
      previsaoLiquidacao: String(row[`col_${SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO}`] || Object.values(row)[SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO] || ''),
      estruturacao: formatCurrency(row[`col_${SHEETS_COLUMNS.PIPE.ESTRUTURACAO}`] || Object.values(row)[SHEETS_COLUMNS.PIPE.ESTRUTURACAO] || 0)
    };
  });

  const ultimasLiquidacoes = liquidadas.slice(-5).map(row => {
    const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    return {
      categoria: String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.CATEGORIA) || ''),
      operacao: String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO) || ''),
      estruturacao: formatCurrency(getCellValue(row, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO) || 0),
      dataLiquidacao: formatDate(dataLiquidacao)
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

function formatDate(value: any): string {
  if (!value) return '';
  
  const date = parseDate(value);
  if (!date) return String(value); // Retorna o valor original se não conseguir fazer parse
  
  // Formata a data no padrão brasileiro DD/MM/YYYY
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function processMonthlyData(liquidadas: SheetData[], estruturacoes: SheetData[]) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthNumbers = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  
  return months.map((mes, index) => {
    // Para operações liquidadas, usar a coluna DATA_LIQUIDACAO (coluna 26)
    const liquidadasCount = liquidadas.filter(row => {
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      if (!dataLiquidacao) return false;
      
      const date = parseDate(dataLiquidacao);
      if (!date) {
        // Fallback: procura por padrões de mês no texto
        return String(dataLiquidacao).includes(mes) || String(dataLiquidacao).includes(monthNumbers[index]);
      }
      
      return date.getMonth() === index;
    }).length;
    
    // Para operações em estruturação, usar a coluna DATA_ENTRADA_PIPE (coluna 19)
    const estruturacoesCount = estruturacoes.filter(row => {
      const dataEntrada = getCellValue(row, SHEETS_COLUMNS.PIPE.DATA_ENTRADA_PIPE);
      if (!dataEntrada) return false;
      
      const date = parseDate(dataEntrada);
      if (!date) {
        // Fallback: procura por padrões de mês no texto
        return String(dataEntrada).includes(mes) || String(dataEntrada).includes(monthNumbers[index]);
      }
      
      return date.getMonth() === index;
    }).length;
    
    return { mes, liquidadas: liquidadasCount, estruturacoes: estruturacoesCount };
  });
}

function processCategoryData(data: SheetData[]) {
  const categories: { [key: string]: number } = {};
  
  data.forEach(row => {
    // Usar mapeamento de colunas para categoria
    const categoria = String(row[`col_${SHEETS_COLUMNS.HISTORICO.CATEGORIA}`] || Object.values(row)[SHEETS_COLUMNS.HISTORICO.CATEGORIA] || 'Outros');
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
  if (!str || str === '') return null;
  
  // Primeiro, tenta converter diretamente se for um timestamp ou já uma data válida
  const directDate = new Date(str);
  if (!isNaN(directDate.getTime()) && str.includes('-') && str.length >= 8) {
    return directDate;
  }
  
  // Tenta diferentes formatos de data brasileiros e internacionais
  const formats = [
    { pattern: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, order: 'dmy' }, // DD/MM/YYYY
    { pattern: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, order: 'dmy' }, // DD-MM-YYYY
    { pattern: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, order: 'ymd' }, // YYYY-MM-DD
    { pattern: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, order: 'dmy' }, // DD/MM/YY
    { pattern: /^(\d{1,2})-(\d{1,2})-(\d{2})$/, order: 'dmy' }, // DD-MM-YY
    { pattern: /^(\d{4})(\d{2})(\d{2})$/, order: 'ymd' }, // YYYYMMDD
  ];
  
  for (const { pattern, order } of formats) {
    const match = str.match(pattern);
    if (match) {
      let day: string, month: string, year: string;
      
      if (order === 'ymd') {
        [, year, month, day] = match;
      } else { // 'dmy'
        [, day, month, year] = match;
      }
      
      // Ajusta anos de 2 dígitos para assumir século 21
      if (year.length === 2) {
        const yearNum = parseInt(year);
        // Anos 00-30 assumimos 2000-2030, 31-99 assumimos 1931-1999
        year = yearNum <= 30 ? `20${year}` : `19${year}`;
      }
      
      // Valida se dia e mês são válidos
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
        continue;
      }
      
      const date = new Date(yearNum, monthNum - 1, dayNum);
      
      // Verifica se a data é válida (não houve overflow, ex: 31/02)
      if (date.getFullYear() === yearNum && 
          date.getMonth() === monthNum - 1 && 
          date.getDate() === dayNum) {
        return date;
      }
    }
  }
  
  // Log para debug quando não conseguir fazer parse
  console.warn('Não foi possível fazer parse da data:', str);
  return null;
}