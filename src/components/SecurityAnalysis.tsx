
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  description: string;
  details?: string;
}

interface SecurityAnalysisProps {
  url: string;
  securityChecks: SecurityCheck[];
  isAnalyzing: boolean;
}

export const SecurityAnalysis = ({ url, securityChecks, isAnalyzing }: SecurityAnalysisProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'checking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pass':
        return 'Aprovado';
      case 'fail':
        return 'Falha';
      case 'warning':
        return 'Atenção';
      case 'checking':
        return 'Verificando...';
      default:
        return 'Desconhecido';
    }
  };

  const passCount = securityChecks.filter(check => check.status === 'pass').length;
  const failCount = securityChecks.filter(check => check.status === 'fail').length;
  const warningCount = securityChecks.filter(check => check.status === 'warning').length;

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Análise de Segurança</CardTitle>
          </div>
          {isAnalyzing && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Analisando...
            </Badge>
          )}
        </div>
        <CardDescription>
          Verificações de segurança para {formatUrl(url)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Security Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{passCount}</div>
            <div className="text-sm text-green-700">Aprovados</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <div className="text-sm text-yellow-700">Atenções</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{failCount}</div>
            <div className="text-sm text-red-700">Falhas</div>
          </div>
        </div>

        {/* Security Checks List */}
        {securityChecks.length > 0 ? (
          <div className="space-y-3">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{check.name}</h4>
                    <Badge className={getStatusColor(check.status)}>
                      {getStatusText(check.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{check.description}</p>
                  {check.details && (
                    <p className="text-xs text-gray-500 mt-1">{check.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma análise de segurança disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
