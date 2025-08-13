import { useState, useEffect } from 'react';
import { SheetData } from './useGoogleSheets';

interface UseMultipleSheetsProps {
  sheetId: string;
  sheets: { name: string; gid: string }[];
}

export function useMultipleSheets({ sheetId, sheets }: UseMultipleSheetsProps) {
  const [data, setData] = useState<{ [key: string]: SheetData[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheetData = async (gid: string): Promise<SheetData[]> => {
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
      return parseCSV(csvText);
    } catch (err) {
      console.error(`Erro ao buscar dados da aba ${gid}:`, err);
      throw err;
    }
  };

  const parseCSV = (csvText: string): SheetData[] => {
    console.log('CSV Text length:', csvText.length);
    console.log('First 500 chars:', csvText.substring(0, 500));
    
    const lines = csvText.split('\n').filter(line => line.trim());
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

    const headers = parseCSVLine(lines[0]);
    console.log('Headers:', headers);
    
    const rows: SheetData[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Pula linhas vazias
      
      const values = parseCSVLine(lines[i]);
      const row: SheetData = {};
      
      // Usa índices em vez de nomes de headers para mais confiabilidade
      values.forEach((value, index) => {
        const cleanValue = value.replace(/^"|"$/g, '').trim(); // Remove aspas do início e fim
        
        // Tenta converter para número se parecer um número
        const numValue = parseFloat(cleanValue.replace(/[R$\s,]/g, '').replace(/\./g, '').replace(/,/g, '.'));
        
        row[`col_${index}`] = !isNaN(numValue) && cleanValue.match(/[\d,.]/) ? numValue : cleanValue;
      });
      
      if (Object.keys(row).length > 0) {
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
            const sheetData = await fetchSheetData(sheet.gid);
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
  }, [sheetId, sheets]);

  const refetch = async () => {
    if (sheetId && sheets.length > 0) {
      setLoading(true);
      setError(null);
      
      try {
        const results = await Promise.allSettled(
          sheets.map(async (sheet) => {
            const sheetData = await fetchSheetData(sheet.gid);
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