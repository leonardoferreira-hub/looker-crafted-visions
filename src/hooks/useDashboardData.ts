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
      { name: 'historico', gid: SHEETS_CONFIG.HISTORICO_GID, headerRowIndex: 1 }, // Header at row 2 (0-based index 1), data starts row 3
      { name: 'pipe', gid: SHEETS_CONFIG.PIPE_GID, headerRowIndex: 6 } // Header at row 7 (0-based index 6), data starts row 8
    ]
  });

  // Verifica se temos dados válidos de pelo menos uma aba
  const hasValidData = (data.historico?.length || 0) > 0 || (data.pipe?.length || 0) > 0;
  const isConnected = hasValidData && !error;

  const processedData = useMemo(() => {
    const historicoData = data.historico || [];
    const pipeData = data.pipe || [];
    
    console.log('=== DADOS BRUTOS ===');
    console.log('Historico Data (raw):', historicoData.length);
    console.log('Pipe Data (raw):', pipeData.length);
    
    // Debug dos índices das colunas
    console.log('📍 ÍNDICES DAS COLUNAS:');
    console.log('OPERACAO (Histórico):', SHEETS_COLUMNS.HISTORICO.OPERACAO);
    console.log('DATA_LIQUIDACAO (Histórico):', SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    console.log('OPERACAO (Pipe):', SHEETS_COLUMNS.PIPE.OPERACAO);
    console.log('PREVISAO_LIQUIDACAO (Pipe):', SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
    
    // Verifica se DATA_LIQUIDACAO realmente é 26
    console.log('🎯 Verificação: DATA_LIQUIDACAO deveria ser coluna AA (índice 26)');
    console.log('Contagem: A=0, B=1, C=2... Z=25, AA=26 ✓');
    
    // Debug das primeiras linhas para verificar estrutura
    if (historicoData.length > 0) {
      console.log('Primeira linha HISTORICO:', historicoData[0]);
      const operacao = getCellValue(historicoData[0], SHEETS_COLUMNS.HISTORICO.OPERACAO);
      const dataLiq = getCellValue(historicoData[0], SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      console.log('Teste HISTORICO - Operação:', operacao, 'Data:', dataLiq);
    }
    
    if (pipeData.length > 0) {
      console.log('Primeira linha PIPE:', pipeData[0]);
      const operacao = getCellValue(pipeData[0], SHEETS_COLUMNS.PIPE.OPERACAO);
      const previsao = getCellValue(pipeData[0], SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
      console.log('Teste PIPE - Operação:', operacao, 'Previsão:', previsao);
    }

  // Debug: Analisa onde estão as datas em todas as linhas
  console.log('=== MAPEAMENTO DE COLUNAS COM DATAS ===');
  const dateColumns = {};
  
  historicoData.forEach((row, index) => {
    Object.entries(row).forEach(([key, value]) => {
      const strValue = String(value);
      if (strValue.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || strValue.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
        if (!dateColumns[key]) dateColumns[key] = 0;
        dateColumns[key]++;
      }
    });
  });
  
  console.log('📊 Colunas que contêm datas (quantidade de ocorrências):');
  Object.entries(dateColumns)
    .sort(([,a], [,b]) => (b as number) - (a as number)) // Ordena por quantidade
    .forEach(([column, count]) => {
      const columnIndex = parseInt(column.replace('col_', ''));
      const letter = columnIndex < 26 ? String.fromCharCode(65 + columnIndex) : 'A' + String.fromCharCode(65 + columnIndex - 26);
      console.log(`${column} (coluna ${letter}): ${count} datas`);
    });
  
  console.log('=== ANÁLISE DETALHADA DO HISTÓRICO ===');
  console.log('Verificando estrutura dos dados...');
  
  // Analisa quantas linhas têm col_26
  let linhasComCol26 = 0;
  let linhasSemCol26 = 0;
  
  historicoData.forEach((row, index) => {
    if ('col_26' in row && row['col_26']) {
      linhasComCol26++;
    } else {
      linhasSemCol26++;
    }
  });
  
  console.log('📊 ESTATÍSTICAS DAS COLUNAS:');
  console.log(`Linhas COM col_26: ${linhasComCol26}`);
  console.log(`Linhas SEM col_26: ${linhasSemCol26}`);
  console.log(`Total de linhas: ${historicoData.length}`);
  
  historicoData.forEach((row, index) => {
    const operacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO);
    const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    
    // Debug específico para Squarelife
    if (operacao && operacao.toLowerCase().includes('squarelife')) {
      console.log('🔍 SQUARELIFE - PROCESSAMENTO FINAL:');
      console.log('Operação:', operacao);
      console.log('col_26 valor:', row['col_26']);
      console.log('col_26 tipo:', typeof row['col_26']);
      console.log('getCellValue(col_26):', dataLiquidacao);
      console.log('isValidHistoricoRow:', isValidHistoricoRow(row));
      console.log('=====================================');
    }
    
    // Debug da estrutura da linha para encontrar onde estão as datas
    if (index < 3) { // Mostra estrutura das primeiras 3 linhas
      console.log(`Estrutura linha ${index + 1}:`, row);
      console.log(`Todas as chaves da linha ${index + 1}:`, Object.keys(row));
      
      // Tenta encontrar valores que parecem datas
      Object.entries(row).forEach(([key, value]) => {
        const strValue = String(value);
        if (strValue.includes('/') || strValue.includes('-') || strValue.match(/\d{2}\/\d{2}\/\d{4}/)) {
          console.log(`POSSÍVEL DATA encontrada em ${key}: "${value}"`);
        }
      });
    }
    
    const hasOperacao = operacao && String(operacao).trim() !== '';
    const hasData = dataLiquidacao && String(dataLiquidacao).trim() !== '' && String(dataLiquidacao) !== 'null';
    const isValid = isValidHistoricoRow(row);
    
    // Debug específico para linhas que têm operação mas não têm data na col_26
    if (hasOperacao && !hasData) {
      console.log(`🔍 DEBUG LINHA ${index + 1} (${operacao}): Data não encontrada na col_26`);
      console.log(`col_26 existe?`, 'col_26' in row);
      console.log(`col_26 valor:`, row['col_26']);
      console.log(`col_26 tipo:`, typeof row['col_26']);
      
      // Verifica especificamente se há data na col_26
      if (row['col_26']) {
        const strValue = String(row['col_26']).trim();
        console.log(`col_26 como string: "${strValue}"`);
        console.log(`É data válida?`, strValue.match(/\d{1,2}\/\d{1,2}\/\d{4}/) !== null);
      }
      
      // Mostra onde realmente estão as datas (apenas para comparação)
      Object.entries(row).forEach(([key, value]) => {
        const strValue = String(value);
        if (strValue.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || strValue.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
          console.log(`📅 DATA EM ${key}: "${value}" (mas queremos col_26)`);
        }
      });
    }
    
    console.log(`Linha ${index + 1}: Operação="${operacao}" | Data="${dataLiquidacao}" | HasOp=${hasOperacao} | HasData=${hasData} | Valid=${isValid}`);
  });

  // Filtra operações liquidadas (histórico)
  let filteredHistorico = historicoData.filter((row, index) => {
    // Primeiro verifica se é uma linha válida (tem OPERACAO e DATA_LIQUIDACAO)
    if (!isValidHistoricoRow(row)) {
      return false;
    }
    
    // Aplica filtro de data se especificado
    if (defaultStartDate || defaultEndDate) {
      const liquidationDate = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      const date = parseDate(liquidationDate);
      
      if (date) {
        if (defaultStartDate && date < defaultStartDate) {
          console.log(`REJEITADA por data: "${getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO)}" - Data: ${date}, Início: ${defaultStartDate}`);
          return false;
        }
        if (defaultEndDate && date > defaultEndDate) {
          console.log(`REJEITADA por data: "${getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO)}" - Data: ${date}, Fim: ${defaultEndDate}`);
          return false;
        }
      }
    }
    
    return true;
  });

  // Filtra operações em estruturação (pipe)
  let filteredPipe = pipeData.filter((row, index) => {
    // Verifica se é uma linha válida (tem OPERACAO e PREVISAO_LIQUIDACAO)
    return isValidPipeRow(row);
  });

  console.log('=== DADOS FILTRADOS ===');
  console.log('Filtered Historico:', filteredHistorico.length);
  console.log('Filtered Pipe:', filteredPipe.length);

  // Log detalhado das operações que serão consideradas no KPI
  console.log('=== OPERAÇÕES LIQUIDADAS (HISTÓRICO) ===');
  console.log('Critério: OPERACAO preenchida E DATA_LIQUIDACAO preenchida (col_26)');
  filteredHistorico.forEach((row, index) => {
    const operacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO);
    const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    console.log(`${index + 1}. "${operacao}" | Data: "${dataLiquidacao}"`);
  });

  console.log('=== OPERAÇÕES EM ESTRUTURAÇÃO (PIPE) ===');
  console.log('Critério: OPERACAO preenchida E (data válida OU "Liquidada")');
  
  // Debug de todas as linhas do Pipe para ver quais são rejeitadas
  console.log('🔍 ANÁLISE DETALHADA DO PIPE:');
  let validCount = 0;
  let rejectedCount = 0;
  
  pipeData.forEach((row, index) => {
    const operacao = getCellValue(row, SHEETS_COLUMNS.PIPE.OPERACAO);
    const previsaoLiquidacao = getCellValue(row, SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
    const isValid = isValidPipeRow(row);
    
    if (operacao && operacao.trim() !== '') {
      if (isValid) {
        validCount++;
      } else {
        rejectedCount++;
        console.log(`❌ REJEITADA: "${operacao}" | Previsão: "${previsaoLiquidacao}" (não é data nem "Liquidada")`);
      }
    }
  });
  
  console.log(`✅ Operações VÁLIDAS: ${validCount}`);
  console.log(`❌ Operações REJEITADAS: ${rejectedCount}`);
  
  filteredPipe.forEach((row, index) => {
    const operacao = getCellValue(row, SHEETS_COLUMNS.PIPE.OPERACAO);
    const previsaoLiquidacao = getCellValue(row, SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
    console.log(`${index + 1}. "${operacao}" | Previsão: "${previsaoLiquidacao}"`);
  });

  console.log('=== RESUMO PARA KPI ===');
  console.log(`Total Operações Liquidadas: ${filteredHistorico.length}`);
  console.log(`Total Operações em Estruturação: ${filteredPipe.length}`);
  console.log(`TOTAL GERAL: ${filteredHistorico.length + filteredPipe.length}`);

    // Calcula dados de 2024 para comparação (ano completo)
    const lastYearStart = new Date(2024, 0, 1); // 01/01/2024
    const lastYearEnd = new Date(2024, 11, 31); // 31/12/2024
    
    const lastYearData = historicoData.filter(row => {
      // Primeiro verifica se é uma linha válida do histórico
      if (!isValidHistoricoRow(row)) {
        return false;
      }
      
      const liquidationDate = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      const date = parseDate(liquidationDate);
      
      if (!date) return false;
      
      return date >= lastYearStart && date <= lastYearEnd;
    });

    return processSheetData(filteredHistorico, filteredPipe, lastYearData);
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
  
  // Vai DIRETO na coluna especificada
  const value = row[`col_${columnIndex}`];
  
  // Agora todas as colunas existem, mas podem estar vazias
  if (value !== null && value !== undefined) {
    const strValue = String(value).trim();
    // Considera vazio se for string vazia, "null" ou "undefined"
    if (strValue === '' || strValue === 'null' || strValue === 'undefined') {
      return null;
    }
    return strValue;
  }
  
  return null;
}

// Função para validar linha do HISTÓRICO (OPERACAO + DATA_LIQUIDACAO)
function isValidHistoricoRow(row: SheetData): boolean {
  const operacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO);
  const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
  
  // Verifica se tem operação preenchida
  const hasOperacao = operacao && String(operacao).trim() !== '';
  
  // Verifica se tem data de liquidação válida na col_26
  const dataStr = dataLiquidacao ? String(dataLiquidacao).trim() : '';
  const hasDataLiquidacao = dataStr !== '' && dataStr !== 'null' && dataStr !== 'undefined';
  
  return hasOperacao && hasDataLiquidacao;
}

// Função para validar linha do PIPE (OPERACAO + data válida OU "Liquidada")
function isValidPipeRow(row: SheetData): boolean {
  const operacao = getCellValue(row, SHEETS_COLUMNS.PIPE.OPERACAO);
  const previsaoLiquidacao = getCellValue(row, SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
  
  // Verifica se tem operação preenchida
  const hasOperacao = operacao && String(operacao).trim() !== '';
  
  // Verifica se tem previsão de liquidação válida
  const previsaoStr = previsaoLiquidacao ? String(previsaoLiquidacao).trim() : '';
  
  if (previsaoStr === '') {
    return false; // Rejeita se vazio
  }
  
  // Aceita "Liquidada" (case insensitive)
  if (previsaoStr.toLowerCase() === 'liquidada') {
    return hasOperacao;
  }
  
  // Aceita apenas datas válidas (padrão DD/MM/YYYY ou DD-MM-YYYY)
  const isValidDate = previsaoStr.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/) !== null;
  
  return hasOperacao && isValidDate;
}

function processSheetData(historicoData: SheetData[], pipeData: SheetData[], lastYearData: SheetData[] = []) {
  console.log('Processing sheet data...');
  console.log('Historico rows:', historicoData.length);
  console.log('Pipe rows:', pipeData.length);
  
  // Os dados já vêm filtrados e validados, então apenas usamos diretamente
  const liquidadas = historicoData; // Já filtrados por data e validação
  const estruturacao = pipeData; // Já filtrados por validação

  console.log('Filtered liquidadas:', liquidadas.length);
  console.log('Filtered estruturacao:', estruturacao.length);

  // Calcula mudanças em relação ao ano anterior
  const lastYearLiquidadas = lastYearData.length; // Já filtrados e validados
  
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

  // Calcula volumes das duas abas
  console.log('=== DEBUG VOLUME CALCULATION ===');
  console.log('Coluna VOLUME Histórico:', SHEETS_COLUMNS.HISTORICO.VOLUME);
  console.log('Coluna VOLUME Pipe:', SHEETS_COLUMNS.PIPE.VOLUME);
  
  const volumeHistorico = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.VOLUME);
  const volumePipe = calculateSumByColumnIndex(estruturacao, SHEETS_COLUMNS.PIPE.VOLUME);
  
  console.log('Volume Histórico calculado:', volumeHistorico);
  console.log('Volume Pipe calculado:', volumePipe);
  
  // Debug valores individuais da coluna VOLUME do Pipe
  console.log('=== VALORES INDIVIDUAIS VOLUME PIPE ===');
  estruturacao.forEach((row, index) => {
    const volumeValue = getCellValue(row, SHEETS_COLUMNS.PIPE.VOLUME);
    const operacao = getCellValue(row, SHEETS_COLUMNS.PIPE.OPERACAO);
    console.log(`${index + 1}. ${operacao}: col_${SHEETS_COLUMNS.PIPE.VOLUME} = "${volumeValue}" (tipo: ${typeof volumeValue})`);
  });
  
  const volumeTotal = volumeHistorico + volumePipe;
  console.log('Volume Total:', volumeTotal);

  // Calcula fee de estruturação das duas abas
  console.log('=== DEBUG FEE ESTRUTURACAO ===');
  console.log('Coluna ESTRUTURACAO Histórico:', SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO);
  console.log('Coluna ESTRUTURACAO Pipe:', SHEETS_COLUMNS.PIPE.ESTRUTURACAO);
  
  const feeEstruturacaoHistorico = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO);
  const feeEstruturacaoPipe = calculateSumByColumnIndex(estruturacao, SHEETS_COLUMNS.PIPE.ESTRUTURACAO);
  
  console.log('Fee Estruturação Histórico (liquidadas):', feeEstruturacaoHistorico);
  console.log('Fee Estruturação Pipe (em estruturação):', feeEstruturacaoPipe);
  
  // Debug valores individuais da coluna ESTRUTURACAO
  console.log('=== VALORES ESTRUTURACAO HISTÓRICO ===');
  liquidadas.slice(0, 3).forEach((row, index) => {
    const feeValue = getCellValue(row, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO);
    const operacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO);
    console.log(`${index + 1}. ${operacao}: col_${SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO} = "${feeValue}"`);
  });
  
  console.log('=== VALORES ESTRUTURACAO PIPE ===');
  estruturacao.slice(0, 3).forEach((row, index) => {
    const feeValue = getCellValue(row, SHEETS_COLUMNS.PIPE.ESTRUTURACAO);
    const operacao = getCellValue(row, SHEETS_COLUMNS.PIPE.OPERACAO);
    console.log(`${index + 1}. ${operacao}: col_${SHEETS_COLUMNS.PIPE.ESTRUTURACAO} = "${feeValue}"`);
  });
  
  const feeEstruturacaoTotal = feeEstruturacaoHistorico + feeEstruturacaoPipe;
  console.log('Fee Estruturação Total:', feeEstruturacaoTotal);

  // Calcula fee de gestão das duas abas
  const feeGestaoHistorico = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.GESTAO);
  const feeGestaoPipe = calculateSumByColumnIndex(estruturacao, SHEETS_COLUMNS.PIPE.GESTAO);
  const feeGestaoTotal = feeGestaoHistorico + feeGestaoPipe;

  // Calcula KPIs usando valores das duas abas
  const kpis: DashboardKPIs = {
    operacoesLiquidadas: currentLiquidadas,
    operacoesEstruturacao: estruturacao.length,
    volumeLiquidado: formatVolume(volumeHistorico), // Volume apenas liquidadas
    volumeEstruturacao: formatVolume(volumePipe), // Volume apenas em estruturação
    feeLiquidado: formatFee(feeEstruturacaoHistorico), // Fee apenas liquidadas
    feeEstruturacao: formatFee(feeEstruturacaoPipe), // Fee apenas estruturação
    feeGestaoLiquidado: formatFee(feeGestaoHistorico), // Fee gestão apenas liquidadas
    feeGestaoEstruturacao: formatFee(feeGestaoPipe), // Fee gestão apenas estruturação
    feeMedio2025: calculateAverageByColumnIndex([...liquidadas, ...estruturacao], SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO), // Estruturação média
    // Comparações com ano anterior
    operacoesLiquidadasChange: getPercentChange(currentLiquidadas, lastYearLiquidadas),
    volumeLiquidadoChange: getPercentChange(volumeTotal, lastYearVolume),
    feeLiquidadoChange: getPercentChange(feeEstruturacaoTotal, lastYearFee)
  };

  console.log('Calculated KPIs:', kpis);

  // Processa dados para gráficos
  const chartData = {
    operacoesPorMes: processMonthlyData(historicoData, estruturacao), // Usa dados históricos completos para comparar 2024 vs 2025
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
                    parseFloat(String(value).replace(/[R$\s]/g, '').replace(/\./g, '').replace(/,/g, '.')) || 0;
    
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

function formatVolume(value: number): string {
  // Converte para bilhões e retorna apenas o número
  const bilhoes = value / 1000000000;
  return bilhoes.toFixed(1);
}

function formatFee(value: number): string {
  // Converte para milhões e retorna apenas o número
  const milhoes = value / 1000000;
  return milhoes.toFixed(1);
}

function processMonthlyData(liquidadas: SheetData[], estruturacoes: SheetData[]) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  console.log('=== DEBUG PROCESSMONTHLYDATA ===');
  console.log('Total dados históricos recebidos:', liquidadas.length);
  
  // Debug: contar operações por ano
  let count2024 = 0;
  let count2025 = 0;
  let countOthers = 0;
  
  liquidadas.forEach(row => {
    if (!isValidHistoricoRow(row)) return;
    
    const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    if (!dataLiquidacao) return;
    
    const date = parseDate(dataLiquidacao);
    if (!date) return;
    
    if (date.getFullYear() === 2024) count2024++;
    else if (date.getFullYear() === 2025) count2025++;
    else countOthers++;
  });
  
  console.log('Operações válidas por ano:');
  console.log('- 2024:', count2024);
  console.log('- 2025:', count2025);
  console.log('- Outros anos:', countOthers);
  
  // Debug: mostrar algumas datas de exemplo
  console.log('=== EXEMPLOS DE DATAS ===');
  let exampleCount = 0;
  liquidadas.forEach((row, index) => {
    if (exampleCount >= 5) return;
    if (!isValidHistoricoRow(row)) return;
    
    const operacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO);
    const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    const date = parseDate(dataLiquidacao);
    
    console.log(`${exampleCount + 1}. ${operacao}: "${dataLiquidacao}" -> ${date ? date.toISOString().split('T')[0] : 'null'} (ano: ${date ? date.getFullYear() : 'null'})`);
    exampleCount++;
  });
  
  // Calcula dados de 2024 e 2025 para comparação
  const monthlyData2024 = months.map((mes, index) => {
    return liquidadas.filter(row => {
      // Verifica se é uma linha válida do histórico
      if (!isValidHistoricoRow(row)) return false;
      
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      if (!dataLiquidacao) return false;
      
      const date = parseDate(dataLiquidacao);
      if (!date) return false;
      
      return date.getMonth() === index && date.getFullYear() === 2024;
    }).length;
  });

  const monthlyData2025 = months.map((mes, index) => {
    return liquidadas.filter(row => {
      // Verifica se é uma linha válida do histórico
      if (!isValidHistoricoRow(row)) return false;
      
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      if (!dataLiquidacao) return false;
      
      const date = parseDate(dataLiquidacao);
      if (!date) return false;
      
      return date.getMonth() === index && date.getFullYear() === 2025;
    }).length;
  });

  console.log('=== DADOS MENSAIS 2024 ===');
  monthlyData2024.forEach((count, index) => {
    if (count > 0) console.log(`${months[index]}/2024: ${count} operações`);
  });
  
  console.log('=== DADOS MENSAIS 2025 ===');
  monthlyData2025.forEach((count, index) => {
    if (count > 0) console.log(`${months[index]}/2025: ${count} operações`);
  });

  // Converte para soma acumulada (running total)
  let acumulado2024 = 0;
  let acumulado2025 = 0;
  
  const result = months.map((mes, index) => {
    acumulado2024 += monthlyData2024[index];
    acumulado2025 += monthlyData2025[index];
    
    return {
      mes,
      acumulado2024,
      acumulado2025,
      // Mantém estruturacoes para outros gráficos
      estruturacoes: 0
    };
  });
  
  console.log('=== DADOS ACUMULADOS FINAIS ===');
  console.log('2024 final:', acumulado2024);
  console.log('2025 final:', acumulado2025);
  console.log('Resultado do gráfico:', result);
  
  return result;
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