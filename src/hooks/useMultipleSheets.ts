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
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
    const rows: SheetData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.replace(/"/g, '').trim());
      const row: SheetData = {};
      
      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to convert to number if possible
        const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
        row[header] = !isNaN(numValue) && value !== '' ? numValue : value;
      });
      
      rows.push(row);
    }

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