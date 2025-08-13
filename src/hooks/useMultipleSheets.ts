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
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados da aba ${gid}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
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
        
        const results: { [key: string]: SheetData[] } = {};
        
        await Promise.all(
          sheets.map(async (sheet) => {
            try {
              const sheetData = await fetchSheetData(sheet.gid);
              results[sheet.name] = sheetData;
            } catch (err) {
              console.error(`Erro ao carregar aba ${sheet.name}:`, err);
              results[sheet.name] = [];
            }
          })
        );
        
        setData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
      try {
        setLoading(true);
        const results: { [key: string]: SheetData[] } = {};
        
        await Promise.all(
          sheets.map(async (sheet) => {
            try {
              const sheetData = await fetchSheetData(sheet.gid);
              results[sheet.name] = sheetData;
            } catch (err) {
              console.error(`Erro ao atualizar aba ${sheet.name}:`, err);
              results[sheet.name] = [];
            }
          })
        );
        
        setData(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar dados');
      } finally {
        setLoading(false);
      }
    }
  };

  return { data, loading, error, refetch };
}