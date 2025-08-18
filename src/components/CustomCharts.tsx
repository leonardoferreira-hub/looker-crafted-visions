import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

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
        {payload.map((entry, index) => {
          const data = entry.payload;
          return (
            <div key={index} className="text-sm" style={{ color: entry.color }}>
              <p>{`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}</p>
              {data.count && <p className="text-xs opacity-80">{`${data.count} operações`}</p>}
            </div>
          );
        })}
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
  // Paleta de cores mais diversa e contrastante por categoria
  const CATEGORY_COLORS: Record<string, string> = {
    CRI: 'hsl(142, 76%, 55%)',      // Verde vibrante
    CRA: 'hsl(25, 95%, 55%)',       // Laranja vibrante  
    DEB: 'hsl(217, 91%, 55%)',      // Azul vibrante
    'Debênture': 'hsl(217, 91%, 55%)', // Azul vibrante (mesmo que DEB)
    CR: 'hsl(340, 82%, 52%)',       // Rosa/Magenta vibrante
    NC: 'hsl(173, 58%, 45%)',       // Teal
  };
  const DEFAULT_COLORS = [
    'hsl(217, 91%, 55%)', // Azul
    'hsl(142, 76%, 55%)', // Verde  
    'hsl(25, 95%, 55%)',  // Laranja
    'hsl(340, 82%, 52%)', // Rosa/Magenta
    'hsl(173, 58%, 45%)', // Teal
    'hsl(0, 84%, 60%)',   // Vermelho
  ];

  const CustomLegend = (props: any) => {
    const { payload } = props;    
    return (
      <div 
        className="flex flex-col space-y-2 text-sm font-medium" 
        style={{ 
          minWidth: '120px'
        }}
      >
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground text-sm flex-1 min-w-0">{entry.value}</span>
            <span className="text-muted-foreground font-semibold text-sm">
              {data.find(item => item[nameKey] === entry.value)?.[dataKey]}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-[350px] flex items-center justify-center">
      {/* Container centralizado para gráfico + legenda */}
      <div className="flex items-center justify-center gap-4">
        {/* Gráfico de Pizza */}
        <div className="w-[220px] h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" // Centralizado no seu container
                cy="50%"
                innerRadius={45}
                outerRadius={90}
                paddingAngle={2}
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((item, index) => {
                  const key = item[nameKey];
                  const color = CATEGORY_COLORS[key] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Pie>
              <Tooltip 
                content={<CustomTooltip formatter={(value) => `${value}%`} />}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legenda - Ao lado da pizza */}
        <div className="flex flex-col justify-center">
          <CustomLegend payload={data.map((item, index) => {
            const key = item[nameKey];
            const color = CATEGORY_COLORS[key] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
            return { value: key, color };
          })} />
        </div>
      </div>
    </div>
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
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
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
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.6} />
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