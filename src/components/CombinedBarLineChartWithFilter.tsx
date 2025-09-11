import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-2">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}: </span>
            <span>{entry.value} operações</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface CombinedBarLineChartWithFilterProps {
  data: any[];
  endDate?: Date;
  comparisonEndDate?: Date;
  categories: string[];
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}

export function CombinedBarLineChartWithFilter({ 
  data, 
  endDate, 
  comparisonEndDate, 
  categories, 
  onCategoryChange, 
  selectedCategory 
}: CombinedBarLineChartWithFilterProps) {
  // Debug para verificar dados recebidos
  console.log('🔍 CombinedBarLineChartWithFilter dados:', {
    data,
    dataLength: data?.length,
    firstItem: data?.[0],
    categories,
    selectedCategory
  });

  // Verificação de segurança para dados
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('❌ Dados inválidos ou vazios:', data);
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p>Nenhum dado disponível para exibir o gráfico</p>
          <p className="text-sm mt-1">Verifique a conexão com o Google Sheets</p>
        </div>
      </div>
    );
  }

  // Processamento simples dos dados (sem filtro por enquanto)
  const processedData = data.map((item) => {
    return {
      mes: item.mes || '',
      acumulado2024: item.acumulado2024 || 0,
      acumulado2025: item.acumulado2025 || 0,
    };
  });

  console.log('✅ Dados processados:', processedData);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))" 
            opacity={0.3}
          />
          <XAxis 
            dataKey="mes" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="acumulado2024" 
            stroke="hsl(var(--muted-foreground))" 
            strokeWidth={2}
            name="Acumulado 2024"
            strokeDasharray="5 5"
            dot={{ fill: "hsl(var(--muted-foreground))", strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="acumulado2025" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Acumulado 2025"
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}