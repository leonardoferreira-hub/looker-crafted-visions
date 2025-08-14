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

export function CombinedBarLineChart({ data }: { data: any[] }) {
  // Filter data to show 2025 only until current month
  const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-based index
  const filteredData = data.map(item => {
    const monthNumber = parseInt(item.mes.split('/')[0]); // Extract month from "MM/YYYY" format
    if (monthNumber > currentMonth) {
      return { ...item, acumulado2025: null }; // Remove future months for 2025
    }
    return item;
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