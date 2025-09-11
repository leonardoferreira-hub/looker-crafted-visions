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
  const filteredData = data.map((item) => {
    let filtered2024 = item.acumulado2024;
    let filtered2025 = item.acumulado2025;
    
    if (endDate) {
      const currentMonth = endDate.getMonth();
      const itemMonth = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].indexOf(item.mes);
      if (itemMonth > currentMonth) {
        filtered2025 = 0;
      }
    }
    
    if (comparisonEndDate) {
      const comparisonMonth = comparisonEndDate.getMonth();
      const itemMonth = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].indexOf(item.mes);
      if (itemMonth > comparisonMonth) {
        filtered2024 = 0;
      }
    }
    
    return {
      ...item,
      acumulado2024: filtered2024,
      acumulado2025: filtered2025,
    };
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="category-select" className="text-sm font-medium">
          Categoria:
        </Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filteredData}
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