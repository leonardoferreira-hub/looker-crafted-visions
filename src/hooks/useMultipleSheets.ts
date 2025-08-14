import { useState, useEffect } from 'react';
import { SheetData } from './useGoogleSheets';

interface UseMultipleSheetsProps {
  sheetId: string;
  sheets: { name: string; gid: string; headerRowIndex?: number }[];
}

export function useMultipleSheets({ sheetId, sheets }: UseMultipleSheetsProps) {
  const [data, setData] = useState<{ [key: string]: SheetData[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheetData = async (gid: string, headerRowIndex?: number): Promise<SheetData[]> => {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      const response = await fetch(csvUrl, {
        mode: 'cors',
        headers: {
          'Accept': 'text/csv,text/plain,*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Erro ao carregar aba ${gid}`);
      }
      
      const csvText = await response.text();
      return parseCSV(csvText, headerRowIndex);
    } catch (err) {
      console.error(`Erro ao buscar dados da aba ${gid}:`, err);
      throw err;
    }
  };

  // Função para dividir CSV em linhas considerando quebras dentro de células
  const parseCSVLines = (csvText: string): string[] => {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
        // Nova linha fora de aspas = fim da linha CSV
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
          currentLine = '';
        }
        // Pula \r\n
        if (char === '\r' && nextChar === '\n') {
          i++; // Pula o \n
        }
      } else {
        // Dentro de aspas, substitui quebras de linha por espaço
        if ((char === '\n' || char === '\r') && insideQuotes) {
          currentLine += ' ';
        } else {
          currentLine += char;
        }
      }
    }
    
    // Adiciona a última linha se existir
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines;
  };

  const parseCSV = (csvText: string, predefinedHeaderRowIndex?: number): SheetData[] => {
    console.log('CSV Text length:', csvText.length);
    console.log('First 500 chars:', csvText.substring(0, 500));
    
    // Parse CSV considerando quebras de linha dentro de células entre aspas
    const lines = parseCSVLines(csvText);
    if (lines.length === 0) return [];

    console.log('Total lines:', lines.length);
    console.log('First line (headers):', lines[0]);

    // Melhor parsing de CSV que lida com vírgulas dentro de aspas
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    // Use predefined header row index if provided, otherwise find it automatically
    let headerRowIndex = -1;
    
    if (predefinedHeaderRowIndex !== undefined) {
      // Use the predefined header row index (0-based)
      headerRowIndex = predefinedHeaderRowIndex;
      console.log('Using predefined header row index:', headerRowIndex);
    } else {
      // Find the header row (the one with actual column names like "Categoria", "Operação", etc.)
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i];
        if (line.includes('Categoria') && line.includes('Operação') && line.includes('Volume')) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        console.log('Header row not found, using first line');
        headerRowIndex = 0;
      }
    }

    console.log('Header row found at index:', headerRowIndex);
    console.log('Header line:', lines[headerRowIndex]);
    
    const headers = parseCSVLine(lines[headerRowIndex]);
    console.log('Headers:', headers);
    
    const rows: SheetData[] = [];

    // Parse data rows starting from header + 1
    for (let i = headerRowIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      
      // Skip empty rows or rows with only empty values
      if (values.every(val => !val || val.trim() === '')) continue;
      
      const row: SheetData = {};
      
      // Garante que todas as colunas até pelo menos 30 sejam criadas
      const maxColumns = Math.max(30, values.length);
      
      for (let index = 0; index < maxColumns; index++) {
        const value = values[index] || ''; // Se não existir valor, usa string vazia
        const cleanValue = String(value).replace(/^"|"$/g, '').trim(); // Remove aspas do início e fim
        
        // Verifica se é uma data (contém / ou -) para não converter para número
        const isDate = cleanValue.includes('/') || cleanValue.includes('-');
        
        if (cleanValue === '') {
          // Se vazio, mantém como string vazia
          row[`col_${index}`] = '';
        } else if (isDate) {
          // Se for data, mantém como string
          row[`col_${index}`] = cleanValue;
        } else {
          // Tenta converter para número se parecer um número E não for data
          const numValue = parseFloat(cleanValue.replace(/[R$\s,]/g, '').replace(/\./g, '').replace(/,/g, '.'));
          row[`col_${index}`] = !isNaN(numValue) && cleanValue.match(/^[\d,.\s$R]*$/) ? numValue : cleanValue;
        }
      }
      
      if (Object.keys(row).length > 0 && !values.every(val => !val || val.trim() === '')) {
        // Debug específico para linhas importantes
        if (values.some(val => String(val).includes('Squarelife'))) {
          console.log('🔍 PARSING CSV - LINHA SQUARELIFE (APÓS CORREÇÃO):');
          console.log('Número de colunas encontradas:', values.length);
          console.log('Values originais do CSV:', values);
          console.log('Row criado com', Object.keys(row).length, 'colunas');
          console.log('Valor na col_26:', row['col_26']);
          console.log('Últimas 5 colunas:', values.slice(-5));
        }
        
        // Debug para primeira linha do Pipe (verificar estrutura)
        if (values.some(val => String(val).includes('BRA Agroquimica') || String(val).includes('Travessia'))) {
          console.log('🔍 PARSING CSV - PRIMEIRA LINHA PIPE:');
          console.log('Número de colunas:', values.length);
          console.log('Col_4 (PREVISAO_LIQUIDACAO):', values[4]);
          console.log('Primeiras 10 colunas:', values.slice(0, 10));
        }
        
        rows.push(row);
      }
    }

    console.log('Parsed rows:', rows.length);
    console.log('Sample row:', rows[0]);
    return rows;
  };

  useEffect(() => {
    const fetchAllSheets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const results = await Promise.allSettled(
          sheets.map(async (sheet) => {
            console.log(`Buscando dados da aba ${sheet.name} (gid: ${sheet.gid})`);
            const sheetData = await fetchSheetData(sheet.gid, sheet.headerRowIndex);
            console.log(`Dados carregados da aba ${sheet.name}:`, sheetData.length, 'linhas');
            return { name: sheet.name, data: sheetData };
          })
        );

        const newData: { [key: string]: SheetData[] } = {};
        let successCount = 0;
        
        results.forEach((result, index) => {
          const sheetName = sheets[index].name;
          if (result.status === 'fulfilled') {
            newData[sheetName] = result.value.data;
            successCount++;
          } else {
            console.error(`Erro ao carregar aba ${sheetName}:`, result.reason);
            newData[sheetName] = [];
          }
        });

        setData(newData);
        
        // Se nenhuma aba carregou, definimos erro
        if (successCount === 0) {
          setError('Falha ao conectar com Google Sheets. Verifique sua conexão.');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Erro geral ao carregar planilhas:', err);
        setError('Erro inesperado ao carregar dados');
        setData({});
      } finally {
        setLoading(false);
      }
    };

    if (sheetId && sheets.length > 0) {
      fetchAllSheets();
    }
  }, [sheetId, JSON.stringify(sheets)]);

  const refetch = async () => {
    if (sheetId && sheets.length > 0) {
      setLoading(true);
      setError(null);
      
      try {
        const results = await Promise.allSettled(
          sheets.map(async (sheet) => {
            const sheetData = await fetchSheetData(sheet.gid, sheet.headerRowIndex);
            return { name: sheet.name, data: sheetData };
          })
        );

        const newData: { [key: string]: SheetData[] } = {};
        let successCount = 0;
        
        results.forEach((result, index) => {
          const sheetName = sheets[index].name;
          if (result.status === 'fulfilled') {
            newData[sheetName] = result.value.data;
            successCount++;
          } else {
            newData[sheetName] = [];
          }
        });

        setData(newData);
        
        if (successCount === 0) {
          setError('Falha ao reconectar com Google Sheets');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Erro ao recarregar planilhas:', err);
        setError('Erro ao recarregar dados');
        setData({});
      } finally {
        setLoading(false);
      }
    }
  };

  return { data, loading, error, refetch };
}