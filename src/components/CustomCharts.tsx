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
  // LOG DEBUG: Verificando renderização do CustomPieChart
  console.log('🎨 CustomPieChart renderizado:', { data, dataKey, nameKey });
  console.log('📊 Configuração atual - cx: 45%, outerRadius: 100, marginLeft: -20px');
  
  // Cores mais distintas para evitar confusão entre DEB e CR
  const COLORS = [
    'hsl(217, 91%, 59%)',  // Azul vibrante (DEB)
    'hsl(142, 76%, 36%)',  // Verde (CCI) 
    'hsl(25, 95%, 53%)',   // Laranja (CRA)
    'hsl(262, 83%, 58%)',  // Roxo (CR) - mudou de azul para roxo
    'hsl(173, 58%, 39%)',  // Teal/Verde-azulado
    'hsl(0, 84%, 60%)',    // Vermelho
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
    <ResponsiveContainer width="100%" height={350}>
      <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <Pie
          data={data}
          cx="50%"  // Movido ainda mais para a direita
          cy="50%"
          innerRadius={45}  // Reduzido ainda mais
          outerRadius={90}   // Reduzido para dar mais espaço à legenda
          paddingAngle={2}
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          content={<CustomTooltip formatter={(value) => `${value}%`} />}
        />
        <Legend 
          content={<CustomLegend />}
          wrapperStyle={{
            paddingLeft: '0px',   // Removido padding para aproximar ao máximo
            paddingRight: '10px', // Reduzido ainda mais
            fontSize: '14px',     // Reduzido tamanho da fonte
            marginLeft: '-30px',  // Margem negativa ainda maior
            transform: 'translateX(-10px)' // Transformação adicional para mover para esquerda
          }}
          layout="vertical"
          align="right"
          verticalAlign="middle"
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