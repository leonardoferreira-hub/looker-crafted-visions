import { useState, useEffect } from 'react';

export interface SheetData {
  [key: string]: string | number | null;
}

interface UseGoogleSheetsProps {
  sheetId: string;
  gid?: string;
}

export function useGoogleSheets({ sheetId, gid = '0' }: UseGoogleSheetsProps) {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
        
        const response = await fetch(csvUrl);
        if (!response.ok) {
          throw new Error('Erro ao carregar dados do Google Sheets');
        }
        
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setData(parsedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (sheetId) {
      fetchSheetData();
    }
  }, [sheetId, gid]);

  const refetch = () => {
    if (sheetId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
          const response = await fetch(csvUrl);
          const csvText = await response.text();
          const parsedData = parseCSV(csvText);
          setData(parsedData);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao atualizar dados');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  };

  return { data, loading, error, refetch };
}

function parseCSV(csvText: string): SheetData[] {
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
}