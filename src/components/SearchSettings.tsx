
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Check, X, AlertCircle, Key, Zap, RefreshCw, Search } from 'lucide-react';
import { searchService } from '@/services/searchService';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';

const SearchSettings: React.FC = () => {
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [searchProvider, setSearchProvider] = useState('duckduckgo');
  const [serpApiKey, setSerpApiKey] = useState('');
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [maxResults, setMaxResults] = useState(5);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    checkConnection();
  }, [searchProvider, serpApiKey, tavilyApiKey]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('Loading search settings...');
      
      // Load settings with individual error handling
      const settingsPromises = [
        databaseService.getUserSetting('search_enabled', true),
        databaseService.getUserSetting('search_provider', 'duckduckgo'),
        databaseService.getUserSetting('search_max_results', 5),
        databaseService.getUserSetting('serpapi_key', ''),
        databaseService.getUserSetting('tavily_api_key', '')
      ];

      const results = await Promise.allSettled(settingsPromises);
      
      // Extract values with proper fallbacks
      const enabled = results[0].status === 'fulfilled' ? Boolean(results[0].value) : true;
      const provider = results[1].status === 'fulfilled' ? String(results[1].value) : 'duckduckgo';
      const maxRes = results[2].status === 'fulfilled' ? Number(results[2].value) : 5;
      const serpKey = results[3].status === 'fulfilled' ? String(results[3].value || '') : '';
      const tavilyKey = results[4].status === 'fulfilled' ? String(results[4].value || '') : '';

      setSearchEnabled(enabled);
      setSearchProvider(provider);
      setMaxResults(maxRes);
      setSerpApiKey(serpKey);
      setTavilyApiKey(tavilyKey);

      console.log('Search settings loaded successfully:', { 
        enabled, 
        provider, 
        maxRes,
        hasSerpKey: !!serpKey,
        hasTavilyKey: !!tavilyKey
      });

      // Check for any failed loads
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn('Some settings failed to load, using defaults:', failures);
        toast({
          title: "Partial Load",
          description: "Some settings couldn't be loaded and defaults were used.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error loading search settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Authentication required')) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to access search settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Load Error",
          description: "Failed to load search settings. Using defaults.",
          variant: "destructive",
        });
      }
      
      // Set defaults on complete failure
      setSearchEnabled(true);
      setSearchProvider('duckduckgo');
      setMaxResults(5);
      setSerpApiKey('');
      setTavilyApiKey('');
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = () => {
    try {
      let hasValidKey = false;
      
      if (searchProvider === 'serpapi') {
        hasValidKey = !!(serpApiKey && serpApiKey.trim());
      } else if (searchProvider === 'tavily') {
        hasValidKey = !!(tavilyApiKey && tavilyApiKey.trim());
      } else if (searchProvider === 'duckduckgo') {
        hasValidKey = true;
      }

      setIsConnected(hasValidKey);
      console.log('Connection check:', { provider: searchProvider, isConnected: hasValidKey });
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    }
  };

  const testConnection = async () => {
    if (searchProvider !== 'duckduckgo' && !isConnected) {
      toast({
        title: "Configuration Required",
        description: "Please configure your API key first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setTestingConnection(true);
      console.log('Testing connection with provider:', searchProvider);
      
      // For DuckDuckGo, test directly without configuration changes
      if (searchProvider === 'duckduckgo') {
        // Temporarily configure the service to use DuckDuckGo
        const currentConfig = await searchService.getConfiguration();
        const testConfig = {
          ...currentConfig,
          provider: 'duckduckgo'
        };
        
        await searchService.configure(testConfig);
        
        const result = await searchService.search('test query', { 
          maxResults: 1,
          useCache: false 
        });
        
        if (result.results.length > 0 && !result.results[0].title.includes('Search Service Unavailable')) {
          toast({
            title: "Connection Successful",
            description: "DuckDuckGo search is working correctly.",
          });
        } else {
          throw new Error('No valid results returned from search service');
        }
        return;
      }
      
      // For API-based providers, configure first
      const testConfig = {
        provider: searchProvider,
        serpApiKey: serpApiKey.trim() || undefined,
        tavilyApiKey: tavilyApiKey.trim() || undefined,
        maxResults
      };

      await searchService.configure(testConfig);
      
      // Wait a moment for configuration to settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await searchService.search('test query', { 
        maxResults: 1,
        useCache: false 
      });
      
      if (result.results.length > 0 && !result.results[0].title.includes('Search Service Unavailable')) {
        toast({
          title: "Connection Successful",
          description: `${searchProvider.toUpperCase()} search is working correctly.`,
        });
      } else {
        throw new Error('No valid results returned from search service');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      let errorMessage = "Failed to connect to search service.";
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = "Invalid API key. Please check your configuration.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Connection timeout. Please try again.";
        } else if (error.message.includes('Failed to save')) {
          errorMessage = "Failed to save configuration. Please try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      console.log('Saving search settings...', {
        searchEnabled,
        searchProvider,
        maxResults,
        hasSerpKey: !!serpApiKey.trim(),
        hasTavilyKey: !!tavilyApiKey.trim()
      });

      // Validate inputs
      if (!searchProvider || !['duckduckgo', 'serpapi', 'tavily'].includes(searchProvider)) {
        throw new Error('Invalid search provider selected');
      }

      if (!maxResults || maxResults < 1 || maxResults > 10) {
        throw new Error('Max results must be between 1 and 10');
      }

      if (searchProvider === 'serpapi' && (!serpApiKey || !serpApiKey.trim())) {
        throw new Error('SerpAPI key is required for SerpAPI provider');
      }

      if (searchProvider === 'tavily' && (!tavilyApiKey || !tavilyApiKey.trim())) {
        throw new Error('Tavily API key is required for Tavily provider');
      }
      
      // Save all settings with individual error handling
      const savePromises = [
        databaseService.setUserSetting('search_enabled', searchEnabled),
        databaseService.setUserSetting('search_provider', searchProvider),
        databaseService.setUserSetting('search_max_results', maxResults)
      ];

      if (serpApiKey && serpApiKey.trim()) {
        savePromises.push(databaseService.setUserSetting('serpapi_key', serpApiKey.trim()));
      }
      
      if (tavilyApiKey && tavilyApiKey.trim()) {
        savePromises.push(databaseService.setUserSetting('tavily_api_key', tavilyApiKey.trim()));
      }

      const results = await Promise.allSettled(savePromises);
      
      // Check for failures
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some settings failed to save:', failures);
        throw new Error(`Failed to save ${failures.length} setting(s)`);
      }

      // Configure the search service with the new settings
      const searchConfig = {
        provider: searchProvider,
        serpApiKey: serpApiKey.trim() || undefined,
        tavilyApiKey: tavilyApiKey.trim() || undefined,
        maxResults
      };

      try {
        await searchService.configure(searchConfig);
        console.log('Search service configured successfully:', searchConfig);
      } catch (configError) {
        console.error('Failed to configure search service:', configError);
        
        // Show warning but don't fail the save operation
        toast({
          title: "Settings Saved with Warning",
          description: "Settings saved but service configuration failed. Please test connection.",
          variant: "default",
        });
        
        // Recheck connection after saving
        checkConnection();
        return;
      }
      
      toast({
        title: "Settings Saved",
        description: "Search settings have been updated successfully.",
      });
      
      // Recheck connection after saving
      checkConnection();
      console.log('Search settings saved successfully');
    } catch (error) {
      console.error('Error saving search settings:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          errorMessage = "Please sign in to save search settings.";
        } else if (error.message.includes('Invalid search provider')) {
          errorMessage = "Please select a valid search provider.";
        } else if (error.message.includes('Max results')) {
          errorMessage = "Please enter a valid number of results (1-10).";
        } else if (error.message.includes('API key is required')) {
          errorMessage = error.message;
        } else {
          errorMessage = `Failed to save search settings: ${error.message}`;
        }
      }
      
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getProviderInfo = (provider: string) => {
    const info = {
      serpapi: {
        name: 'SerpApi',
        description: 'Premium Google search API with high accuracy',
        requiresKey: true,
        website: 'https://serpapi.com/manage-api-key'
      },
      tavily: {
        name: 'Tavily AI',
        description: 'AI-powered search optimized for research',
        requiresKey: true,
        website: 'https://tavily.com/'
      },
      duckduckgo: {
        name: 'DuckDuckGo',
        description: 'Free privacy-focused search (limited features)',
        requiresKey: false,
        website: 'https://duckduckgo.com/'
      }
    };
    return info[provider as keyof typeof info];
  };

  const currentProviderInfo = getProviderInfo(searchProvider);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading search settings...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            Web Search Settings
          </CardTitle>
          <CardDescription>
            Configure web search functionality with multiple provider options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="search-enabled">Enable Web Search</Label>
              <Switch
                id="search-enabled"
                checked={searchEnabled}
                onCheckedChange={setSearchEnabled}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Enable real-time web search for up-to-date information
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search-provider">Search Provider</Label>
            <Select value={searchProvider} onValueChange={setSearchProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select search provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="duckduckgo">🦆 DuckDuckGo (Free)</SelectItem>
                <SelectItem value="serpapi">🔍 SerpApi (Premium)</SelectItem>
                <SelectItem value="tavily">🤖 Tavily AI (Research)</SelectItem>
              </SelectContent>
            </Select>
            {currentProviderInfo && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{currentProviderInfo.name}</p>
                <p className="text-sm text-muted-foreground">{currentProviderInfo.description}</p>
                {currentProviderInfo.requiresKey && (
                  <p className="text-xs text-blue-600 mt-1">
                    API key required from{' '}
                    <a 
                      href={currentProviderInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline"
                    >
                      {currentProviderInfo.website}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>

          {searchProvider === 'serpapi' && (
            <div className="space-y-2">
              <Label htmlFor="serpapi-key">SerpApi API Key</Label>
              <Input
                id="serpapi-key"
                placeholder="Enter your SerpApi key..."
                type="password"
                value={serpApiKey}
                onChange={(e) => setSerpApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://serpapi.com/manage-api-key" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline text-blue-600"
                >
                  SerpApi Dashboard
                </a>
              </p>
            </div>
          )}

          {searchProvider === 'tavily' && (
            <div className="space-y-2">
              <Label htmlFor="tavily-key">Tavily API Key</Label>
              <Input
                id="tavily-key"
                placeholder="Enter your Tavily API key..."
                type="password"
                value={tavilyApiKey}
                onChange={(e) => setTavilyApiKey(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://tavily.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline text-blue-600"
                >
                  Tavily Dashboard
                </a>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Connection Status</Label>
            <div className="flex items-center gap-2">
              {!currentProviderInfo?.requiresKey && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Ready (No API key required)
                </Badge>
              )}
              {currentProviderInfo?.requiresKey && !isConnected && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  API Key Required
                </Badge>
              )}
              {currentProviderInfo?.requiresKey && isConnected && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  API Key Configured
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
                disabled={!isConnected || testingConnection}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Search className="h-3 w-3 mr-1" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-results">Max Search Results</Label>
            <Input
              id="max-results"
              type="number"
              min="1"
              max="10"
              value={maxResults.toString()}
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0 && value <= 10) {
                  setMaxResults(value);
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              Maximum number of search results to retrieve (1-10)
            </p>
          </div>

          <Button onClick={saveSettings} disabled={saving} className="w-full">
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving Settings...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchSettings;
