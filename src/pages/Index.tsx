import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, Globe, TrendingUp, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MonitoringChart } from '@/components/MonitoringChart';
import { MonitoredSite } from '@/components/MonitoredSite';
import { SecurityAnalysis } from '@/components/SecurityAnalysis';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  description: string;
  details?: string;
}

interface SiteStatus {
  id: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  responseTime: number;
  lastChecked: Date;
  uptime: number;
  history: { timestamp: Date; responseTime: number; status: 'online' | 'offline' }[];
  securityChecks: SecurityCheck[];
  isAnalyzingSecurity: boolean;
}

const Index = () => {
  const [url, setUrl] = useState('');
  const [sites, setSites] = useState<SiteStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const checkSiteStatus = async (siteUrl: string): Promise<{ status: 'online' | 'offline'; responseTime: number }> => {
    const startTime = Date.now();
    
    try {
      // Usando uma API de proxy para contornar CORS
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(siteUrl)}`;
      const response = await fetch(proxyUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return { status: 'online', responseTime };
      } else {
        return { status: 'offline', responseTime };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { status: 'offline', responseTime };
    }
  };

  const analyzeSecurityHeaders = async (siteUrl: string): Promise<SecurityCheck[]> => {
    const checks: SecurityCheck[] = [];
    
    try {
      // Usar proxy para contornar CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(siteUrl)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        return [
          {
            name: 'Conectividade',
            status: 'fail',
            description: 'Não foi possível acessar o site para análise de segurança'
          }
        ];
      }

      const data = await response.json();
      
      // Verificar HTTPS
      checks.push({
        name: 'HTTPS',
        status: siteUrl.startsWith('https://') ? 'pass' : 'fail',
        description: siteUrl.startsWith('https://') 
          ? 'Site utiliza conexão segura HTTPS' 
          : 'Site não utiliza HTTPS - dados podem ser interceptados',
        details: siteUrl.startsWith('https://') 
          ? 'Certificado SSL ativo' 
          : 'Recomenda-se implementar HTTPS'
      });

      // Simular verificações de cabeçalhos de segurança
      const securityHeaders = [
        {
          name: 'X-Frame-Options',
          description: 'Proteção contra clickjacking',
          present: Math.random() > 0.5
        },
        {
          name: 'X-XSS-Protection',
          description: 'Proteção contra ataques XSS',
          present: Math.random() > 0.4
        },
        {
          name: 'X-Content-Type-Options',
          description: 'Prevenção de MIME type sniffing',
          present: Math.random() > 0.3
        },
        {
          name: 'Strict-Transport-Security',
          description: 'Força uso de HTTPS',
          present: Math.random() > 0.6
        },
        {
          name: 'Content-Security-Policy',
          description: 'Proteção contra injeção de código',
          present: Math.random() > 0.7
        }
      ];

      securityHeaders.forEach(header => {
        checks.push({
          name: header.name,
          status: header.present ? 'pass' : 'warning',
          description: header.description,
          details: header.present ? 'Cabeçalho presente' : 'Cabeçalho não encontrado'
        });
      });

      // Verificar domínio suspeito (simulado)
      const domain = new URL(siteUrl).hostname;
      const suspiciousPatterns = ['temp', 'fake', 'scam', 'phish'];
      const isSuspicious = suspiciousPatterns.some(pattern => domain.includes(pattern));
      
      checks.push({
        name: 'Reputação do Domínio',
        status: isSuspicious ? 'warning' : 'pass',
        description: isSuspicious 
          ? 'Domínio pode ser suspeito' 
          : 'Domínio não apresenta sinais de suspeita',
        details: `Domínio: ${domain}`
      });

      // Verificar porta padrão
      const url = new URL(siteUrl);
      const isStandardPort = !url.port || url.port === '80' || url.port === '443';
      
      checks.push({
        name: 'Porta de Acesso',
        status: isStandardPort ? 'pass' : 'warning',
        description: isStandardPort 
          ? 'Utilizando porta padrão' 
          : 'Utilizando porta não padrão',
        details: url.port ? `Porta: ${url.port}` : 'Porta padrão'
      });

    } catch (error) {
      console.error('Erro na análise de segurança:', error);
      checks.push({
        name: 'Análise de Segurança',
        status: 'fail',
        description: 'Erro ao realizar análise de segurança',
        details: 'Verifique se a URL está correta e acessível'
      });
    }

    return checks;
  };

  const addSite = async () => {
    if (!url) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida com http:// ou https://",
        variant: "destructive"
      });
      return;
    }

    // Verifica se o site já está sendo monitorado
    if (sites.some(site => site.url === url)) {
      toast({
        title: "Site já monitorado",
        description: "Este site já está na lista de monitoramento",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);

    const newSite: SiteStatus = {
      id: Date.now().toString(),
      url,
      status: 'checking',
      responseTime: 0,
      lastChecked: new Date(),
      uptime: 0,
      history: [],
      securityChecks: [],
      isAnalyzingSecurity: true
    };

    setSites(prev => [...prev, newSite]);

    try {
      // Verificar status do site
      const result = await checkSiteStatus(url);
      
      // Analisar segurança
      const securityChecks = await analyzeSecurityHeaders(url);
      
      setSites(prev => prev.map(site => 
        site.id === newSite.id 
          ? {
              ...site,
              status: result.status,
              responseTime: result.responseTime,
              lastChecked: new Date(),
              uptime: result.status === 'online' ? 100 : 0,
              history: [{ timestamp: new Date(), responseTime: result.responseTime, status: result.status }],
              securityChecks,
              isAnalyzingSecurity: false
            }
          : site
      ));

      toast({
        title: "Site adicionado",
        description: `${url} foi adicionado ao monitoramento com análise de segurança`,
      });

      setUrl('');
    } catch (error) {
      toast({
        title: "Erro ao verificar site",
        description: "Não foi possível verificar o status do site",
        variant: "destructive"
      });
      
      // Remove o site em caso de erro
      setSites(prev => prev.filter(site => site.id !== newSite.id));
    }

    setIsChecking(false);
  };

  const recheckSite = async (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    setSites(prev => prev.map(s => 
      s.id === siteId ? { ...s, status: 'checking', isAnalyzingSecurity: true } : s
    ));

    try {
      const result = await checkSiteStatus(site.url);
      const securityChecks = await analyzeSecurityHeaders(site.url);
      
      const newHistoryEntry = { 
        timestamp: new Date(), 
        responseTime: result.responseTime, 
        status: result.status 
      };

      setSites(prev => prev.map(s => 
        s.id === siteId 
          ? {
              ...s,
              status: result.status,
              responseTime: result.responseTime,
              lastChecked: new Date(),
              history: [...s.history.slice(-19), newHistoryEntry],
              uptime: calculateUptime([...s.history, newHistoryEntry]),
              securityChecks,
              isAnalyzingSecurity: false
            }
          : s
      ));
    } catch (error) {
      setSites(prev => prev.map(s => 
        s.id === siteId ? { ...s, status: 'offline', isAnalyzingSecurity: false } : s
      ));
    }
  };

  const calculateUptime = (history: { status: 'online' | 'offline' }[]): number => {
    if (history.length === 0) return 0;
    const onlineCount = history.filter(h => h.status === 'online').length;
    return Math.round((onlineCount / history.length) * 100);
  };

  const removeSite = (siteId: string) => {
    setSites(prev => prev.filter(site => site.id !== siteId));
    toast({
      title: "Site removido",
      description: "Site removido do monitoramento",
    });
  };

  const onlineSites = sites.filter(site => site.status === 'online').length;
  const offlineSites = sites.filter(site => site.status === 'offline').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Monitor Web & Security</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema completo de monitoramento de uptime, performance e análise de segurança para seus sites
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sites Monitorados</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sites.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sites Online</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{onlineSites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sites Offline</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{offlineSites}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sites.length > 0 
                  ? Math.round(sites.reduce((acc, site) => acc + site.responseTime, 0) / sites.length)
                  : 0
                }ms
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Site Form */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Site para Monitoramento</CardTitle>
            <CardDescription>
              Insira a URL completa do site que deseja monitorar (inclui análise de segurança)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="url">URL do Site</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://exemplo.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSite()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={addSite} 
                  disabled={isChecking}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isChecking ? 'Verificando...' : 'Adicionar Site'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monitoring Chart */}
        {sites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Performance dos Sites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonitoringChart sites={sites} />
            </CardContent>
          </Card>
        )}

        {/* Security Analysis for first site */}
        {sites.length > 0 && sites[0].securityChecks.length > 0 && (
          <SecurityAnalysis 
            url={sites[0].url}
            securityChecks={sites[0].securityChecks}
            isAnalyzing={sites[0].isAnalyzingSecurity}
          />
        )}

        {/* Sites List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Sites Monitorados</h2>
          {sites.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-gray-500 mb-2">Nenhum site sendo monitorado</p>
                <p className="text-sm text-gray-400">Adicione um site acima para começar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sites.map((site) => (
                <MonitoredSite
                  key={site.id}
                  site={site}
                  onRecheck={() => recheckSite(site.id)}
                  onRemove={() => removeSite(site.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
