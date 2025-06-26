
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

interface SiteStatus {
  id: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  responseTime: number;
  lastChecked: Date;
  uptime: number;
  history: { timestamp: Date; responseTime: number; status: 'online' | 'offline' }[];
}

interface MonitoredSiteProps {
  site: SiteStatus;
  onRecheck: () => void;
  onRemove: () => void;
}

export const MonitoredSite = ({ site, onRecheck, onRemove }: MonitoredSiteProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4" />;
      case 'offline':
        return <AlertCircle className="h-4 w-4" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 500) return 'text-green-600';
    if (responseTime < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 95) return 'text-green-600';
    if (uptime >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(site.status)}
              <CardTitle className="text-lg font-semibold">
                {formatUrl(site.url)}
              </CardTitle>
            </div>
            <Badge className={getStatusColor(site.status)}>
              {site.status === 'online' ? 'Online' : 
               site.status === 'offline' ? 'Offline' : 'Verificando...'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(site.url, '_blank')}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRecheck}
              disabled={site.status === 'checking'}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${site.status === 'checking' ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-sm text-gray-500">
          {site.url}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Tempo de Resposta</p>
            <p className={`text-lg font-semibold ${getResponseTimeColor(site.responseTime)}`}>
              {site.responseTime}ms
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Uptime</p>
            <p className={`text-lg font-semibold ${getUptimeColor(site.uptime)}`}>
              {site.uptime}%
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Última Verificação</p>
            <p className="text-sm text-gray-700">
              {site.lastChecked.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Status History */}
        {site.history.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Histórico (últimas verificações)</p>
            <div className="flex space-x-1">
              {site.history.slice(-20).map((entry, index) => (
                <div
                  key={index}
                  className={`w-3 h-6 rounded-sm ${
                    entry.status === 'online' ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  title={`${entry.status === 'online' ? 'Online' : 'Offline'} - ${entry.responseTime}ms - ${entry.timestamp.toLocaleString('pt-BR')}`}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
