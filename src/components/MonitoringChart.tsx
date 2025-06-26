
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SiteStatus {
  id: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  responseTime: number;
  lastChecked: Date;
  uptime: number;
  history: { timestamp: Date; responseTime: number; status: 'online' | 'offline' }[];
}

interface MonitoringChartProps {
  sites: SiteStatus[];
}

export const MonitoringChart = ({ sites }: MonitoringChartProps) => {
  // Preparar dados para o gráfico
  const prepareChartData = () => {
    const allTimestamps = new Set<string>();
    
    // Coletar todos os timestamps únicos
    sites.forEach(site => {
      site.history.forEach(entry => {
        allTimestamps.add(entry.timestamp.toISOString());
      });
    });

    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    // Criar dados do gráfico
    const chartData = sortedTimestamps.slice(-10).map(timestamp => {
      const dataPoint: any = {
        time: new Date(timestamp).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      sites.forEach(site => {
        const entry = site.history.find(h => h.timestamp.toISOString() === timestamp);
        const siteName = new URL(site.url).hostname;
        dataPoint[siteName] = entry ? entry.responseTime : null;
      });

      return dataPoint;
    });

    return chartData;
  };

  const chartData = prepareChartData();
  
  // Cores para as linhas do gráfico
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
  ];

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Dados insuficientes para exibir o gráfico</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ value: 'Tempo (ms)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: any, name: string) => [
              value ? `${value}ms` : 'N/A',
              name
            ]}
            labelFormatter={(label) => `Horário: ${label}`}
          />
          <Legend />
          {sites.map((site, index) => {
            const siteName = new URL(site.url).hostname;
            return (
              <Line
                key={site.id}
                type="monotone"
                dataKey={siteName}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
