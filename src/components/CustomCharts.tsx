import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any) => string;
}

const CustomTooltip = ({ active, payload, label, formatter }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
        {label && <p className="text-sm font-medium text-foreground mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function CustomPieChart({ data, dataKey, nameKey }: {
  data: any[];
  dataKey: string;
  nameKey: string;
}) {
  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey={dataKey}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip formatter={(value) => `${value}%`} />}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CustomLineChart({ data, xKey, yKey, title }: {
  data: any[];
  xKey: string;
  yKey: string;
  title?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey={xKey} 
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
        <Line 
          type="monotone" 
          dataKey={yKey} 
          stroke="hsl(var(--primary-blue))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary-blue))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: 'hsl(var(--primary-blue))', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CustomBarChart({ data, xKey, yKey }: {
  data: any[];
  xKey: string;
  yKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey={xKey} 
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
        <Bar 
          dataKey={yKey} 
          fill="hsl(var(--primary-green))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}