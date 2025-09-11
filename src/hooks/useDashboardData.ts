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
  feeGestaoLiquidadoRaw: number;
  feeGestaoEstruturacaoRaw: number;
  feeColocacaoLiquidado: string;
  feeColocacaoEstruturacao: string;
  feeColocacaoLiquidadoRaw: number;
  feeColocacaoEstruturacaoRaw: number;
  feeMedio2025: string;
  // Valores de comparação (mesmo período do ano anterior)
  lastYearOperacoes?: number;
  lastYearVolume?: number;
  lastYearFee?: number;
  // Comparações com ano anterior
  operacoesLiquidadasChange?: { value: string; type: 'positive' | 'negative' };
  volumeLiquidadoChange?: { value: string; type: 'positive' | 'negative' };
  feeLiquidadoChange?: { value: string; type: 'positive' | 'negative' };
}

export function useDashboardData(startDate?: Date | null, endDate?: Date | null, comparisonStartDate?: Date | null, comparisonEndDate?: Date | null) {
  // Define período padrão: 1º de janeiro de 2025 até hoje
  const defaultStartDate = startDate || new Date(2025, 0, 1);
  const defaultEndDate = endDate || new Date();
  
  // Define período de comparação padrão: 1º de janeiro de 2024 até 31 de dezembro de 2024
  const defaultComparisonStartDate = comparisonStartDate || new Date(2024, 0, 1);
  const defaultComparisonEndDate = comparisonEndDate || new Date(2024, 11, 31);
  
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

    // Calcula dados de 2024 para comparação (baseado no filtro de comparação)
    const lastYearStart = defaultComparisonStartDate;
    const lastYearEnd = defaultComparisonEndDate;
    
    // Para comparação dos cards, usa o mesmo período relativo em 2024
    const cardComparisonStart = new Date(2024, defaultStartDate.getMonth(), defaultStartDate.getDate());
    const cardComparisonEnd = new Date(2024, defaultEndDate.getMonth(), defaultEndDate.getDate());
    
    console.log('=== DEBUG COMPARAÇÃO DOS CARDS ===');
    console.log('Período 2025:', defaultStartDate.toISOString().split('T')[0], 'até', defaultEndDate.toISOString().split('T')[0]);
    console.log('Período 2024 equivalente:', cardComparisonStart.toISOString().split('T')[0], 'até', cardComparisonEnd.toISOString().split('T')[0]);
    
    const lastYearData = historicoData.filter(row => {
      // Primeiro verifica se é uma linha válida do histórico
      if (!isValidHistoricoRow(row)) {
        return false;
      }
      
      const liquidationDate = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      const date = parseDate(liquidationDate);
      
      if (!date) return false;
      
      return date >= cardComparisonStart && date <= cardComparisonEnd;
    });
    
    console.log('Operações 2024 para comparação dos cards:', lastYearData.length);

    // Para o gráfico, filtra dados de 2025 (período atual) e 2024 (período de comparação)
    const filtered2025 = historicoData.filter(row => {
      if (!isValidHistoricoRow(row)) return false;
      
      const liquidationDate = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      const date = parseDate(liquidationDate);
      
      if (!date) return false;
      
      // Filtra pelo período selecionado em 2025
      if (date.getFullYear() !== 2025) return false;
      
      if (defaultStartDate && date < defaultStartDate) return false;
      if (defaultEndDate && date > defaultEndDate) return false;
      
      return true;
    });
    
    const filtered2024 = historicoData.filter(row => {
      if (!isValidHistoricoRow(row)) return false;
      
      const liquidationDate = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      const date = parseDate(liquidationDate);
      
      if (!date) return false;
      
      // Filtra pelo período de comparação em 2024
      if (date.getFullYear() !== 2024) return false;
      
      if (defaultComparisonStartDate && date < defaultComparisonStartDate) return false;
      if (defaultComparisonEndDate && date > defaultComparisonEndDate) return false;
      
      return true;
    });
    
    console.log('=== DEBUG DADOS PARA GRÁFICO ===');
    console.log('Dados históricos brutos:', historicoData.length);
    console.log('Dados 2025 filtrados:', filtered2025.length);
    console.log('Dados 2024 filtrados:', filtered2024.length);
    console.log('Dados KPIs (2025):', filteredHistorico.length);

    const result = processSheetData(filteredHistorico, filteredPipe, lastYearData, { filtered2024, filtered2025 });
    return {
      ...result,
      rawPipeData: filteredPipe // Include raw pipe data for projections
    };
  }, [data, defaultStartDate, defaultEndDate, defaultComparisonStartDate, defaultComparisonEndDate]);

  return {
    ...processedData,
    loading,
    error,
    refetch,
    isConnected,
    defaultStartDate,
    defaultEndDate,
    defaultComparisonStartDate,
    defaultComparisonEndDate
  };
}

// Função auxiliar para obter valor de célula de forma consistente
function getCellValue(row: SheetData, columnIndex: number): any {
  if (!row) return null;
  
  // Vai DIRETO na coluna especificada
  const value = row[`col_${columnIndex}`];
  
  // Se o valor não existe ou é nulo/indefinido
  if (value === null || value === undefined) {
    return null;
  }
  
  // Se é um número, retorna o número original
  if (typeof value === 'number') {
    return value;
  }
  
  // Se é string, verifica se está vazia
  const strValue = String(value).trim();
  if (strValue === '' || strValue === 'null' || strValue === 'undefined') {
    return null;
  }
  
  // Retorna o valor original (preserva strings e números)
  return value;
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

function processSheetData(historicoData: SheetData[], pipeData: SheetData[], lastYearData: SheetData[] = [], chartData?: { filtered2024: SheetData[], filtered2025: SheetData[] }) {
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
  
  // Para Volume Total e Fee Total, precisa somar histórico + pipe de 2024
  // Mas como pipe tem datas de previsão, não de liquidação, vamos usar apenas histórico para comparação justa
  const lastYearVolumeHistorico = calculateSumByColumnIndex(lastYearData, SHEETS_COLUMNS.HISTORICO.VOLUME);
  const lastYearFeeHistorico = calculateSumByColumnIndex(lastYearData, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO);

  const currentLiquidadas = liquidadas.length;
  const currentVolumeHistorico = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.VOLUME);
  const currentFeeHistorico = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO);
  
  console.log('=== DEBUG COMPARAÇÃO CARDS ===');
  console.log('Volume 2024 (histórico):', lastYearVolumeHistorico);
  console.log('Volume 2025 (histórico):', currentVolumeHistorico);
  console.log('Fee 2024 (histórico):', lastYearFeeHistorico);
  console.log('Fee 2025 (histórico):', currentFeeHistorico);

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
  console.log('Volume Total 2025 (para comparação):', volumeTotal, '/ Volume Histórico 2024:', lastYearVolumeHistorico);

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
  console.log('Fee Total 2025 (para comparação):', feeEstruturacaoTotal, '/ Fee Histórico 2024:', lastYearFeeHistorico);
  console.log('Fee Liquidado 2025 (para comparação):', feeEstruturacaoHistorico, '/ Fee Histórico 2024:', lastYearFeeHistorico);

  // Calcula fee de gestão das duas abas
  console.log('=== DEBUG FEE GESTÃO ===');
  console.log('Coluna GESTAO Histórico:', SHEETS_COLUMNS.HISTORICO.GESTAO);
  console.log('Coluna GESTAO Pipe:', SHEETS_COLUMNS.PIPE.GESTAO);
  
  // Debug detalhado dos valores de gestão
  console.log('=== VALORES GESTÃO HISTÓRICO (2025) ===');
  liquidadas.forEach((row, index) => {
    const gestaoValue = getCellValue(row, SHEETS_COLUMNS.HISTORICO.GESTAO);
    const operacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO);
    const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    if (gestaoValue && gestaoValue !== 0) {
      console.log(`${index + 1}. ${operacao} (${dataLiquidacao}): col_${SHEETS_COLUMNS.HISTORICO.GESTAO} = "${gestaoValue}" (tipo: ${typeof gestaoValue})`);
    }
  });
  
  console.log('=== VALORES GESTÃO PIPE (EM ESTRUTURAÇÃO) ===');
  estruturacao.forEach((row, index) => {
    const gestaoValue = getCellValue(row, SHEETS_COLUMNS.PIPE.GESTAO);
    const operacao = getCellValue(row, SHEETS_COLUMNS.PIPE.OPERACAO);
    const previsao = getCellValue(row, SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
    if (gestaoValue && gestaoValue !== 0) {
      console.log(`${index + 1}. ${operacao} (${previsao}): col_${SHEETS_COLUMNS.PIPE.GESTAO} = "${gestaoValue}" (tipo: ${typeof gestaoValue})`);
    }
  });
  
  const feeGestaoHistorico = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.GESTAO);
  const feeGestaoPipe = calculateSumByColumnIndex(estruturacao, SHEETS_COLUMNS.PIPE.GESTAO);
  const feeGestaoTotal = feeGestaoHistorico + feeGestaoPipe;
  
  console.log('Fee Gestão Histórico (liquidadas 2025):', feeGestaoHistorico);
  console.log('Fee Gestão Pipe (em estruturação):', feeGestaoPipe);
  console.log('Fee Gestão Total:', feeGestaoTotal);
  
  // Verificar se os valores batem com o esperado
  console.log('ESPERADO: Histórico = 166.900, Pipe = 329.000');
  console.log('REAL: Histórico =', feeGestaoHistorico, ', Pipe =', feeGestaoPipe);

  // Calcula Fee de Colocação (ORIGINACAO)
  const feeColocacaoHistorico = calculateSumByColumnIndex(liquidadas, SHEETS_COLUMNS.HISTORICO.ORIGINACAO);
  const feeColocacaoPipe = calculateSumByColumnIndex(estruturacao, SHEETS_COLUMNS.PIPE.ORIGINACAO);
  const feeColocacaoTotal = feeColocacaoHistorico + feeColocacaoPipe;
  
  console.log('Fee Colocação Histórico (liquidadas 2025):', feeColocacaoHistorico);
  console.log('Fee Colocação Pipe (em estruturação):', feeColocacaoPipe);
  console.log('Fee Colocação Total:', feeColocacaoTotal);

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
    feeGestaoLiquidadoRaw: feeGestaoHistorico,
    feeGestaoEstruturacaoRaw: feeGestaoPipe,
    feeColocacaoLiquidado: formatFee(feeColocacaoHistorico), // Fee colocação apenas liquidadas
    feeColocacaoEstruturacao: formatFee(feeColocacaoPipe), // Fee colocação apenas estruturação
    feeColocacaoLiquidadoRaw: feeColocacaoHistorico,
    feeColocacaoEstruturacaoRaw: feeColocacaoPipe,
    feeMedio2025: calculateAverageByColumnIndex([...liquidadas, ...estruturacao], SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO), // Estruturação média
    // Valores de comparação (mesmo período do ano anterior)
    lastYearOperacoes: lastYearLiquidadas,
    lastYearVolume: lastYearVolumeHistorico,
    lastYearFee: lastYearFeeHistorico,
    // Comparações com ano anterior (mesmo período relativo)
    operacoesLiquidadasChange: getPercentChange(currentLiquidadas, lastYearLiquidadas),
    volumeLiquidadoChange: getPercentChange(currentVolumeHistorico, lastYearVolumeHistorico), // Compara volume liquidado 2025 vs volume liquidado 2024
    feeLiquidadoChange: getPercentChange(feeEstruturacaoHistorico, lastYearFeeHistorico) // Compara fee liquidado 2025 vs fee liquidado 2024
  };


  // Processa dados para tabelas usando mapeamento de colunas
  // Ordena próximas liquidações por data de previsão e pega as 5 primeiras
  const estruturacaoOrdenada = [...estruturacao].sort((a, b) => {
    const previsaoA = getCellValue(a, SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
    const previsaoB = getCellValue(b, SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
    
    const dateA = parseDate(previsaoA);
    const dateB = parseDate(previsaoB);
    
    // Se ambas são datas válidas, ordena por data
    if (dateA && dateB) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // Se uma é "Liquidada" e outra não, "Liquidada" vai para o final
    if (String(previsaoA).toLowerCase() === 'liquidada' && String(previsaoB).toLowerCase() !== 'liquidada') {
      return 1;
    }
    if (String(previsaoB).toLowerCase() === 'liquidada' && String(previsaoA).toLowerCase() !== 'liquidada') {
      return -1;
    }
    
    // Mantém ordem original para outros casos
    return 0;
  });

  const proximasLiquidacoes = estruturacaoOrdenada.slice(0, 5).map((row, index) => {
    const previsao = getCellValue(row, SHEETS_COLUMNS.PIPE.PREVISAO_LIQUIDACAO);
    const estruturacao = getCellValue(row, SHEETS_COLUMNS.PIPE.ESTRUTURACAO);
    const operacao = getCellValue(row, SHEETS_COLUMNS.PIPE.OPERACAO);
    const resumo = getCellValue(row, SHEETS_COLUMNS.PIPE.RESUMO);
    
    console.log(`=== PROXIMAS LIQUIDACOES ROW ${index} ===`);
    console.log('Operacao:', operacao);
    console.log('Resumo raw (col_23):', row['col_23']);
    console.log('Resumo getCellValue:', resumo);
    console.log('Resumo final:', String(resumo || ''));
    
    return {
      categoria: String(getCellValue(row, SHEETS_COLUMNS.PIPE.CATEGORIA) || ''),
      operacao: String(operacao || ''),
      previsaoLiquidacao: formatDate(previsao),
      analistaGestao: String(getCellValue(row, SHEETS_COLUMNS.PIPE.ANALISTA_GESTAO) || ''),
      estruturacao: formatCurrency(estruturacao || 0),
      resumo: String(resumo || '')
    };
  });

  const ultimasLiquidacoes = liquidadas.slice(-5).map((row, index) => {
    const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    const estruturacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.ESTRUTURACAO);
    const operacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.OPERACAO);
    const resumo = getCellValue(row, SHEETS_COLUMNS.HISTORICO.RESUMO);
    
    console.log(`=== ULTIMAS LIQUIDACOES ROW ${index} ===`);
    console.log('Operacao:', operacao);
    console.log('Resumo raw (col_23):', row['col_23']);
    console.log('Resumo getCellValue:', resumo);
    console.log('Resumo final:', String(resumo || ''));
    
    return {
      categoria: String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.CATEGORIA) || ''),
      operacao: String(operacao || ''),
      dataLiquidacao: formatDate(dataLiquidacao),
      analistaGestao: String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.ANALISTA_GESTAO) || ''),
      estruturacao: formatCurrency(estruturacao || 0),
      resumo: String(resumo || '')
    };
  });

  // Extrai categorias únicas dos dados históricos
  const categories = extractUniqueCategories(liquidadas);
  
  // Processa dados para gráficos usando dados filtrados por ano
  const graphData = {
    operacoesPorMes: chartData ? processMonthlyDataWithYears(chartData.filtered2024, chartData.filtered2025, estruturacao) : processMonthlyData(liquidadas, estruturacao),
    operacoesPorMesPorCategoria: chartData ? 
      (category: string) => processMonthlyDataWithYearsByCategory(chartData.filtered2024, chartData.filtered2025, category) :
      (category: string) => processMonthlyDataByCategory(liquidadas, category),
    categorias: processCategoryData([...liquidadas, ...estruturacao]),
    lastros: processLastroData(estruturacao),
    categories
  };

  return {
    kpis,
    chartData: graphData,
    proximasLiquidacoes,
    ultimasLiquidacoes
  };
}

function calculateSumByColumnIndex(data: SheetData[], columnIndex: number): number {
  let total = 0;
  console.log(`=== CALCULANDO SOMA COLUNA ${columnIndex} ===`);
  
  data.forEach((row, index) => {
    const value = getCellValue(row, columnIndex);
    
    if (!value) return;
    
    const numValue = typeof value === 'number' ? value : 
                    parseFloat(String(value).replace(/[R$\s]/g, '').replace(/\./g, '').replace(/,/g, '.')) || 0;
    
    if (numValue > 0) {
      console.log(`Linha ${index + 1}: "${value}" -> ${numValue}`);
      total += numValue;
    }
  });
  
  console.log(`Total coluna ${columnIndex}: ${total}`);
  return total;
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
  if (!value || value === 0 || value === '0' || value === '') {
    return 'R$ 0,00';
  }
  
  let num: number;
  if (typeof value === 'number') {
    num = value;
  } else {
    const valueStr = String(value).trim();
    
    // Se está vazio ou é nulo, retorna R$ 0,00
    if (valueStr === '' || valueStr === 'null' || valueStr === 'undefined') {
      return 'R$ 0,00';
    }
    
    // Remove símbolos monetários e converte para número
    // Formato brasileiro: 8.004.592.000,00 -> remove R$, pontos (milhares), vírgula vira ponto
    const cleanStr = valueStr
      .replace(/[R$\s]/g, '')         // Remove R$, espaços
      .replace(/\./g, '')             // Remove pontos (separadores de milhares)
      .replace(/,/g, '.');            // Converte vírgula para ponto decimal
    
    num = parseFloat(cleanStr) || 0;
  }
  
  // Se o número é 0, retorna R$ 0,00
  if (num === 0) {
    return 'R$ 0,00';
  }
  
  // Formata no padrão brasileiro com símbolo de moeda e 2 casas decimais
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function formatDate(value: any): string {
  if (!value) return '';
  
  const valueStr = String(value).trim();
  
  // Se já está no formato "Liquidada", retorna como está
  if (valueStr.toLowerCase() === 'liquidada') {
    return 'Liquidada';
  }
  
  // Se está vazio ou é apenas espaços, retorna vazio
  if (valueStr === '' || valueStr === 'null' || valueStr === 'undefined') {
    return '';
  }
  
  // Primeiro, tenta parsing da data
  const date = parseDate(value);
  if (date && !isNaN(date.getTime())) {
    // Se conseguiu fazer parse, formata no padrão brasileiro DD/MM/YYYY
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  // Se não conseguiu fazer parse mas parece uma data (tem / ou -), retorna como está
  if (valueStr.includes('/') || valueStr.includes('-')) {
    return valueStr;
  }
  
  // Para outros valores que não parecem datas, retorna como está
  return valueStr;
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

function processMonthlyDataWithYears(filtered2024: SheetData[], filtered2025: SheetData[], estruturacoes: SheetData[]) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  console.log('=== DEBUG PROCESSMONTHLYDATA WITH YEARS ===');
  console.log('Dados 2024 recebidos:', filtered2024.length);
  console.log('Dados 2025 recebidos:', filtered2025.length);
  
  // Calcula dados mensais para cada ano
  const monthlyData2024 = months.map((mes, index) => {
    return filtered2024.filter(row => {
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      if (!dataLiquidacao) return false;
      
      const date = parseDate(dataLiquidacao);
      if (!date) return false;
      
      return date.getMonth() === index;
    }).length;
  });

  const monthlyData2025 = months.map((mes, index) => {
    return filtered2025.filter(row => {
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      if (!dataLiquidacao) return false;
      
      const date = parseDate(dataLiquidacao);
      if (!date) return false;
      
      return date.getMonth() === index;
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
      estruturacoes: 0
    };
  });
  
  console.log('=== DADOS ACUMULADOS FINAIS (NEW FUNCTION) ===');
  console.log('2024 final:', acumulado2024);
  console.log('2025 final:', acumulado2025);
  console.log('Resultado do gráfico:', result);
  
  return result;
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
  console.log('🎯 processCategoryData chamada com:', data.length, 'itens');
  
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

function extractUniqueCategories(data: SheetData[]): string[] {
  console.log('🏷️ extractUniqueCategories chamada com:', data.length, 'itens');
  
  const categories = new Set<string>();
  
  data.forEach(row => {
    const categoria = String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.CATEGORIA) || '').trim();
    if (categoria && categoria !== '' && categoria !== 'null' && categoria !== 'undefined') {
      categories.add(categoria);
    }
  });
  
  const uniqueCategories = Array.from(categories).sort();
  console.log('Categorias únicas encontradas:', uniqueCategories);
  
  return uniqueCategories;
}

function processMonthlyDataWithYearsByCategory(filtered2024: SheetData[], filtered2025: SheetData[], selectedCategory: string) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  console.log('=== DEBUG PROCESSMONTHLYDATA WITH YEARS BY CATEGORY ===');
  console.log('Dados 2024 recebidos:', filtered2024.length);
  console.log('Dados 2025 recebidos:', filtered2025.length);
  console.log('Categoria selecionada:', selectedCategory);
  
  // Filtra por categoria se não for "Todas"
  const filterByCategory = (data: SheetData[]) => {
    if (selectedCategory === 'Todas') return data;
    return data.filter(row => {
      const categoria = String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.CATEGORIA) || '').trim();
      return categoria === selectedCategory;
    });
  };
  
  const categoryFiltered2024 = filterByCategory(filtered2024);
  const categoryFiltered2025 = filterByCategory(filtered2025);
  
  console.log('Dados 2024 após filtro categoria:', categoryFiltered2024.length);
  console.log('Dados 2025 após filtro categoria:', categoryFiltered2025.length);
  
  // Calcula dados mensais para cada ano
  const monthlyData2024 = months.map((mes, index) => {
    return categoryFiltered2024.filter(row => {
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      if (!dataLiquidacao) return false;
      
      const date = parseDate(dataLiquidacao);
      if (!date) return false;
      
      return date.getMonth() === index;
    }).length;
  });

  const monthlyData2025 = months.map((mes, index) => {
    return categoryFiltered2025.filter(row => {
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      if (!dataLiquidacao) return false;
      
      const date = parseDate(dataLiquidacao);
      if (!date) return false;
      
      return date.getMonth() === index;
    }).length;
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
      estruturacoes: 0
    };
  });
  
  console.log('=== DADOS ACUMULADOS FINAIS BY CATEGORY ===');
  console.log('2024 final:', acumulado2024);
  console.log('2025 final:', acumulado2025);
  
  return result;
}

function processMonthlyDataByCategory(liquidadas: SheetData[], selectedCategory: string) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  console.log('=== DEBUG PROCESSMONTHLYDATA BY CATEGORY ===');
  console.log('Total dados históricos recebidos:', liquidadas.length);
  console.log('Categoria selecionada:', selectedCategory);
  
  // Filtra por categoria se não for "Todas"
  const filterByCategory = (data: SheetData[]) => {
    if (selectedCategory === 'Todas') return data;
    return data.filter(row => {
      const categoria = String(getCellValue(row, SHEETS_COLUMNS.HISTORICO.CATEGORIA) || '').trim();
      return categoria === selectedCategory;
    });
  };
  
  const categoryFilteredData = filterByCategory(liquidadas);
  console.log('Dados após filtro categoria:', categoryFilteredData.length);
  
  // Separar por ano
  const data2024: SheetData[] = [];
  const data2025: SheetData[] = [];
  
  categoryFilteredData.forEach(row => {
    if (!isValidHistoricoRow(row)) return;
    
    const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
    if (!dataLiquidacao) return;
    
    const date = parseDate(dataLiquidacao);
    if (!date) return;
    
    if (date.getFullYear() === 2024) data2024.push(row);
    else if (date.getFullYear() === 2025) data2025.push(row);
  });
  
  // Processa mensalmente
  const monthlyData2024 = months.map((mes, index) => {
    return data2024.filter(row => {
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      const date = parseDate(dataLiquidacao);
      return date && date.getMonth() === index;
    }).length;
  });

  const monthlyData2025 = months.map((mes, index) => {
    return data2025.filter(row => {
      const dataLiquidacao = getCellValue(row, SHEETS_COLUMNS.HISTORICO.DATA_LIQUIDACAO);
      const date = parseDate(dataLiquidacao);
      return date && date.getMonth() === index;
    }).length;
  });

  // Converte para soma acumulada
  let acumulado2024 = 0;
  let acumulado2025 = 0;
  
  return months.map((mes, index) => {
    acumulado2024 += monthlyData2024[index];
    acumulado2025 += monthlyData2025[index];
    
    return {
      mes,
      acumulado2024,
      acumulado2025,
      estruturacoes: 0
    };
  });
}

function processLastroData(data: SheetData[]) {
  console.log('🎯 processLastroData chamada com:', data.length, 'itens');
  
  const lastros: { [key: string]: number } = {};
  
  data.forEach(row => {
    // Usar mapeamento de colunas para lastro da aba PIPE
    const lastro = String(getCellValue(row, SHEETS_COLUMNS.PIPE.LASTRO) || 'Não informado').trim();
    
    // Se o lastro está vazio, classifica como "Não informado"
    const lastroKey = lastro === '' || lastro === 'null' || lastro === 'undefined' ? 'Não informado' : lastro;
    
    lastros[lastroKey] = (lastros[lastroKey] || 0) + 1;
  });
  
  console.log('Lastros processados:', lastros);
  
  return Object.entries(lastros).map(([name, value]) => ({
    name,
    value
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