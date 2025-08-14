import { 
  LineChart,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
        {label && <p className="text-sm font-medium text-foreground mb-2">{label}</p>}
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'acumulado2024' && `Acumulado 2024: ${entry.value} operações`}
            {entry.dataKey === 'acumulado2025' && `Acumulado 2025: ${entry.value} operações`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CombinedBarLineChart({ data, endDate, comparisonEndDate }: { data: any[]; endDate?: Date; comparisonEndDate?: Date }) {
  // Filter data to show 2025 only until the end date from filter period
  const endMonth2025 = endDate ? endDate.getMonth() + 1 : new Date().getMonth() + 1;
  
  // Filter data to show 2024 only until the comparison end date
  const endMonth2024 = comparisonEndDate ? comparisonEndDate.getMonth() + 1 : 12; // Default to December if no comparison filter
  
  const filteredData = data.map((item, index) => {
    // Use month index (0-based) instead of parsing month name
    const monthIndex = index + 1; // Janeiro = 1, Fevereiro = 2, etc.
    
    let filteredItem = { ...item };
    
    // Filter 2025 data based on period filter
    if (monthIndex > endMonth2025) {
      filteredItem.acumulado2025 = undefined;
    }
    
    // Filter 2024 data based on comparison filter
    if (monthIndex > endMonth2024) {
      filteredItem.acumulado2024 = undefined;
    }
    
    return filteredItem;
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={filteredData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
        <XAxis 
          dataKey="mes" 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        
        {/* Linha para acumulado 2024 */}
        <Line 
          type="monotone" 
          dataKey="acumulado2024" 
          stroke="hsl(var(--accent))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7, stroke: 'hsl(var(--accent))', strokeWidth: 2 }}
          name="2024"
        />
        
        {/* Linha para acumulado 2025 */}
        <Line 
          type="monotone" 
          dataKey="acumulado2025" 
          stroke="hsl(var(--primary-blue))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary-blue))', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7, stroke: 'hsl(var(--primary-blue))', strokeWidth: 2 }}
          name="2025"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}