
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Globe, 
  Bot, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import { searchService } from '@/services/searchService';
import { databaseService } from '@/services/databaseService';

interface ServiceStatus {
  name: string;
  status: 'checking' | 'online' | 'offline' | 'warning';
  message: string;
  icon: React.ComponentType<any>;
  details?: string;
}

const ConnectivityChecker: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Internet Connection',
      status: 'checking',
      message: 'Testing connection...',
      icon: Wifi
    },
    {
      name: 'AI Service',
      status: 'checking',
      message: 'Checking configuration...',
      icon: Bot
    },
    {
      name: 'Web Search',
      status: 'checking',
      message: 'Testing SerpApi...',
      icon: Globe
    },
    {
      name: 'Local Database',
      status: 'checking',
      message: 'Testing localStorage...',
      icon: Database
    },
    {
      name: 'Application Health',
      status: 'checking',
      message: 'Running diagnostics...',
      icon: Zap
    }
  ]);

  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const updateServiceStatus = (index: number, status: Partial<ServiceStatus>) => {
    setServices(prev => prev.map((service, i) => 
      i === index ? { ...service, ...status } : service
    ));
  };

  const checkInternetConnection = async (): Promise<void> => {
    console.log('Testing internet connection...');
    try {
      const response = await fetch('https://api.github.com', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      updateServiceStatus(0, {
        status: 'online',
        message: 'Connected',
        details: 'Internet connection is working'
      });
      console.log('Internet connection: OK');
    } catch (error) {
      console.error('Internet connection failed:', error);
      updateServiceStatus(0, {
        status: 'offline',
        message: 'No internet connection',
        details: 'Unable to reach external services'
      });
    }
  };

  const checkAIService = async (): Promise<void> => {
    console.log('Testing AI service configuration...');
    try {
      const isConfigured = aiService.isConfigured();
      if (isConfigured) {
        // Test a simple chat to verify it works
        try {
          const testResponse = await aiService.chat([
            { role: 'user', content: 'Test connection - respond with "OK"' }
          ], 'code-gen');
          
          updateServiceStatus(1, {
            status: 'online',
            message: 'AI service working',
            details: `Response received: ${testResponse.content?.substring(0, 50)}...`
          });
          console.log('AI service test: OK');
        } catch (testError) {
          console.error('AI service test failed:', testError);
          updateServiceStatus(1, {
            status: 'warning',
            message: 'Configuration issue',
            details: `Error: ${testError instanceof Error ? testError.message : 'Unknown error'}`
          });
        }
      } else {
        updateServiceStatus(1, {
          status: 'offline',
          message: 'Not configured',
          details: 'AI service requires configuration'
        });
        console.log('AI service: Not configured');
      }
    } catch (error) {
      console.error('AI service check failed:', error);
      updateServiceStatus(1, {
        status: 'offline',
        message: 'Error checking AI service',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const checkSearchService = async (): Promise<void> => {
    console.log('Testing web search service...');
    try {
      const isConfigured = searchService.isConfigured();
      if (isConfigured) {
        try {
          console.log('Performing SerpApi test search...');
          const searchResponse = await searchService.search('test query', { 
            maxResults: 1,
            useCache: false 
          });
          
          updateServiceStatus(2, {
            status: 'online',
            message: 'Search working',
            details: `Found ${searchResponse.results.length} results`
          });
          console.log('SerpApi test: OK, results:', searchResponse.results.length);
        } catch (searchError) {
          console.error('SerpApi test failed:', searchError);
          updateServiceStatus(2, {
            status: 'warning',
            message: 'Search issues detected',
            details: `Error: ${searchError instanceof Error ? searchError.message : 'Unknown error'}`
          });
        }
      } else {
        updateServiceStatus(2, {
          status: 'offline',
          message: 'Not configured',
          details: 'SerpApi key required'
        });
        console.log('Search service: Not configured');
      }
    } catch (error) {
      console.error('Search service check failed:', error);
      updateServiceStatus(2, {
        status: 'offline',
        message: 'Error checking search service',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const checkLocalDatabase = async (): Promise<void> => {
    console.log('Testing local database...');
    try {
      // Test localStorage availability
      const testKey = '_connectivity_test';
      const testValue = 'test_data';
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved === testValue) {
        // Test database service
        const stats = databaseService.getStorageStats();
        updateServiceStatus(3, {
          status: 'online',
          message: 'Database working',
          details: `${stats.totalEntries} entries stored, ${(stats.sizeInBytes / 1024).toFixed(1)}KB used`
        });
        console.log('Local database test: OK, stats:', stats);
      } else {
        throw new Error('localStorage test failed');
      }
    } catch (error) {
      console.error('Local database test failed:', error);
      updateServiceStatus(3, {
        status: 'offline',
        message: 'Database unavailable',
        details: 'localStorage not working'
      });
    }
  };

  const checkApplicationHealth = async (): Promise<void> => {
    console.log('Running application health diagnostics...');
    try {
      // Check React is working
      const reactWorking = typeof React !== 'undefined';
      
      // Check if all required services exist
      const servicesExist = !!(aiService && searchService && databaseService);
      
      // Check if app is responsive
      const appElement = document.getElementById('root');
      const appWorking = !!appElement;
      
      if (reactWorking && servicesExist && appWorking) {
        updateServiceStatus(4, {
          status: 'online',
          message: 'Application healthy',
          details: 'All systems operational'
        });
        console.log('Application health: OK');
      } else {
        updateServiceStatus(4, {
          status: 'warning',
          message: 'Partial functionality',
          details: `React: ${reactWorking}, Services: ${servicesExist}, DOM: ${appWorking}`
        });
      }
    } catch (error) {
      console.error('Application health check failed:', error);
      updateServiceStatus(4, {
        status: 'offline',
        message: 'Application issues',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runAllChecks = async () => {
    console.log('Starting comprehensive connectivity check...');
    setIsChecking(true);
    
    // Reset all services to checking state
    setServices(prev => prev.map(service => ({
      ...service,
      status: 'checking' as const,
      message: 'Testing...',
      details: undefined
    })));

    try {
      // Run checks in parallel for faster results
      await Promise.all([
        checkInternetConnection(),
        checkAIService(),
        checkSearchService(),
        checkLocalDatabase(),
        checkApplicationHealth()
      ]);
      
      setLastCheck(new Date());
      console.log('All connectivity checks completed');
    } catch (error) {
      console.error('Error during connectivity checks:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Run initial check on component mount
  useEffect(() => {
    runAllChecks();
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'offline':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'checking':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const overallStatus = services.every(s => s.status === 'online') ? 'online' :
                      services.some(s => s.status === 'offline') ? 'offline' : 'warning';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <CardTitle>System Status & Connectivity</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(overallStatus)} className="text-xs">
              {overallStatus === 'online' ? 'All Systems Operational' :
               overallStatus === 'offline' ? 'Issues Detected' : 'Some Issues'}
            </Badge>
            <Button 
              onClick={runAllChecks} 
              disabled={isChecking}
              size="sm"
              variant="outline"
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isChecking ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
        </div>
        {lastCheck && (
          <p className="text-sm text-muted-foreground">
            Last checked: {lastCheck.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{service.name}</span>
                      {getStatusIcon(service.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{service.message}</p>
                    {service.details && (
                      <p className="text-xs text-muted-foreground mt-1">{service.details}</p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(service.status)} className="text-xs">
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Reload App
            </Button>
            <Button size="sm" variant="outline" onClick={() => localStorage.clear()}>
              Clear Storage
            </Button>
            <Button size="sm" variant="outline" onClick={() => console.clear()}>
              Clear Console
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectivityChecker;
