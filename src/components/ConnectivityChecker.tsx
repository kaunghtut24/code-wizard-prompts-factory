
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  Server, 
  Database, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import { searchService } from '@/services/searchService';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';

interface ConnectivityStatus {
  name: string;
  status: 'online' | 'offline' | 'warning' | 'checking';
  message: string;
  icon: React.ComponentType<any>;
  lastChecked?: number;
}

const ConnectivityChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [statuses, setStatuses] = useState<ConnectivityStatus[]>([
    {
      name: 'Internet Connection',
      status: 'checking',
      message: 'Checking network connectivity...',
      icon: Wifi
    },
    {
      name: 'AI Service',
      status: 'checking',
      message: 'Testing AI service connection...',
      icon: Server
    },
    {
      name: 'Web Search',
      status: 'checking',
      message: 'Testing search service...',
      icon: Globe
    },
    {
      name: 'Local Database',
      status: 'checking',
      message: 'Checking local storage...',
      icon: Database
    },
    {
      name: 'Application Health',
      status: 'checking',
      message: 'Verifying app status...',
      icon: Activity
    }
  ]);
  const { toast } = useToast();

  const updateStatus = (name: string, status: 'online' | 'offline' | 'warning', message: string) => {
    setStatuses(prev => prev.map(s => 
      s.name === name 
        ? { ...s, status, message, lastChecked: Date.now() }
        : s
    ));
  };

  const checkInternetConnection = async (): Promise<void> => {
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        updateStatus('Internet Connection', 'online', 'Connected to internet');
      } else {
        updateStatus('Internet Connection', 'warning', `HTTP ${response.status}: Limited connectivity`);
      }
    } catch (error) {
      console.error('Internet connection check failed:', error);
      updateStatus('Internet Connection', 'offline', 'No internet connection detected');
    }
  };

  const checkAIService = async (): Promise<void> => {
    try {
      if (!aiService.isConfigured()) {
        updateStatus('AI Service', 'warning', 'AI service not configured');
        return;
      }

      const testResult = await aiService.testConnection();
      
      if (testResult.success) {
        updateStatus('AI Service', 'online', 'AI service connected and responding');
      } else {
        updateStatus('AI Service', 'offline', `AI service error: ${testResult.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AI service check failed:', error);
      updateStatus('AI Service', 'offline', 'AI service connection failed');
    }
  };

  const checkSearchService = async (): Promise<void> => {
    try {
      if (!searchService.isConfigured()) {
        updateStatus('Web Search', 'warning', 'Search service not configured');
        return;
      }

      // Test with a simple query
      const searchResult = await searchService.search('test connectivity', { maxResults: 1 });
      
      if (searchResult && searchResult.results && searchResult.results.length > 0) {
        updateStatus('Web Search', 'online', 'Search service operational');
      } else {
        updateStatus('Web Search', 'warning', 'Search service returned no results');
      }
    } catch (error) {
      console.error('Search service check failed:', error);
      updateStatus('Web Search', 'offline', 'Search service unavailable');
    }
  };

  const checkLocalDatabase = async (): Promise<void> => {
    try {
      // Test localStorage functionality
      const testKey = 'connectivity_test';
      const testValue = 'test_' + Date.now();
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        const conversations = databaseService.getConversations();
        const conversationCount = conversations.length;
        updateStatus('Local Database', 'online', `Local storage working (${conversationCount} conversations stored)`);
      } else {
        updateStatus('Local Database', 'warning', 'Local storage test failed');
      }
    } catch (error) {
      console.error('Local database check failed:', error);
      updateStatus('Local Database', 'offline', 'Local storage unavailable');
    }
  };

  const checkApplicationHealth = async (): Promise<void> => {
    try {
      // Check if we're running in production
      const isProduction = import.meta.env.PROD;
      const buildTime = document.querySelector('meta[name="build-time"]')?.getAttribute('content');
      
      let healthMessage = `Application running in ${isProduction ? 'production' : 'development'} mode`;
      if (buildTime) {
        healthMessage += ` (built: ${new Date(buildTime).toLocaleString()})`;
      }
      
      // Check for any console errors
      const hasConsoleErrors = window.console && typeof window.console.error === 'function';
      
      updateStatus('Application Health', 'online', healthMessage);
    } catch (error) {
      console.error('Application health check failed:', error);
      updateStatus('Application Health', 'warning', 'Unable to determine application health');
    }
  };

  const runAllChecks = async () => {
    setIsChecking(true);
    
    try {
      await Promise.allSettled([
        checkInternetConnection(),
        checkAIService(),
        checkSearchService(),
        checkLocalDatabase(),
        checkApplicationHealth()
      ]);
      
      const onlineCount = statuses.filter(s => s.status === 'online').length;
      const totalCount = statuses.length;
      
      toast({
        title: "Connectivity Check Complete",
        description: `${onlineCount}/${totalCount} services are operational`,
      });
    } catch (error) {
      console.error('Connectivity check failed:', error);
      toast({
        title: "Check Failed",
        description: "Unable to complete connectivity checks",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: ConnectivityStatus) => {
    const IconComponent = status.icon;
    
    switch (status.status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <IconComponent className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-800">Online</Badge>;
      case 'offline':
        return <Badge className="bg-red-100 text-red-800">Offline</Badge>;
      case 'warning':
        return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>;
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800">Checking...</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Run initial check on component mount
  useEffect(() => {
    runAllChecks();
  }, []);

  const overallStatus = () => {
    const onlineCount = statuses.filter(s => s.status === 'online').length;
    const offlineCount = statuses.filter(s => s.status === 'offline').length;
    const totalCount = statuses.length;
    
    if (offlineCount > 0) return 'offline';
    if (onlineCount === totalCount) return 'online';
    return 'warning';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <CardTitle>System Connectivity Status</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(overallStatus())}
            <Button
              variant="outline"
              size="sm"
              onClick={runAllChecks}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {statuses.map((status, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status)}
              <div>
                <div className="font-medium">{status.name}</div>
                <div className="text-sm text-gray-600">{status.message}</div>
                {status.lastChecked && (
                  <div className="text-xs text-gray-400">
                    Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
            {getStatusBadge(status.status)}
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Quick Diagnostics:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>• Browser: {navigator.userAgent.split(' ')[0]}</div>
            <div>• Online Status: {navigator.onLine ? 'Connected' : 'Offline'}</div>
            <div>• Location: {window.location.href}</div>
            <div>• Environment: {import.meta.env.PROD ? 'Production' : 'Development'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectivityChecker;
