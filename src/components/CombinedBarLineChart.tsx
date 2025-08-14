import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
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
            {entry.dataKey === 'liquidadas' && `Operações do mês: ${entry.value}`}
            {entry.dataKey === 'liquidadasAcumuladas' && `Acumulado ${new Date().getFullYear()}: ${entry.value}`}
            {entry.dataKey === 'liquidadasAcumuladas2024' && `Acumulado 2024: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CombinedBarLineChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart
        data={data}
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
        
        {/* Barras para operações mensais */}
        <Bar 
          dataKey="liquidadas" 
          fill="hsl(var(--primary-blue))"
          radius={[4, 4, 0, 0]}
          opacity={0.8}
        />
        
        {/* Linha para acumulado atual */}
        <Line 
          type="monotone" 
          dataKey="liquidadasAcumuladas" 
          stroke="hsl(var(--primary-green))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary-green))', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7, stroke: 'hsl(var(--primary-green))', strokeWidth: 2 }}
        />
        
        {/* Linha para acumulado 2024 */}
        <Line 
          type="monotone" 
          dataKey="liquidadasAcumuladas2024" 
          stroke="hsl(var(--muted-foreground))" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}