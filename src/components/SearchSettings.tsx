
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
      
      const enabled = await databaseService.getUserSetting('search_enabled', true);
      const provider = await databaseService.getUserSetting('search_provider', 'duckduckgo');
      const maxRes = await databaseService.getUserSetting('search_max_results', 5);
      const serpKey = await databaseService.getUserSetting('serpapi_key', '');
      const tavilyKey = await databaseService.getUserSetting('tavily_api_key', '');

      setSearchEnabled(Boolean(enabled));
      setSearchProvider(String(provider));
      setMaxResults(Number(maxRes));
      setSerpApiKey(String(serpKey || ''));
      setTavilyApiKey(String(tavilyKey || ''));

      console.log('Search settings loaded:', { enabled, provider, maxRes });
    } catch (error) {
      console.error('Error loading search settings:', error);
      toast({
        title: "Error",
        description: "Failed to load search settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      let hasValidKey = false;
      
      if (searchProvider === 'serpapi' && serpApiKey.trim()) {
        hasValidKey = true;
      } else if (searchProvider === 'tavily' && tavilyApiKey.trim()) {
        hasValidKey = true;
      } else if (searchProvider === 'duckduckgo') {
        hasValidKey = true;
      }

      setIsConnected(hasValidKey);
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
    }
  };

  const testConnection = async () => {
    if (!isConnected) {
      toast({
        title: "Configuration Required",
        description: "Please configure your API key first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setTestingConnection(true);
      
      const result = await searchService.search('test query', { 
        maxResults: 1,
        useCache: false 
      });
      
      if (result.results.length > 0) {
        toast({
          title: "Connection Successful",
          description: `${searchProvider.toUpperCase()} search is working correctly.`,
        });
      } else {
        throw new Error('No results returned');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to search service.",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      await databaseService.setUserSetting('search_enabled', searchEnabled);
      await databaseService.setUserSetting('search_provider', searchProvider);
      await databaseService.setUserSetting('search_max_results', maxResults);
      
      if (serpApiKey.trim()) {
        await databaseService.setUserSetting('serpapi_key', serpApiKey.trim());
      }
      if (tavilyApiKey.trim()) {
        await databaseService.setUserSetting('tavily_api_key', tavilyApiKey.trim());
      }
      
      await searchService.configure({
        provider: searchProvider,
        serpApiKey: serpApiKey.trim(),
        tavilyApiKey: tavilyApiKey.trim(),
        maxResults
      });
      
      toast({
        title: "Settings Saved",
        description: "Search settings have been updated successfully.",
      });
      
      await checkConnection();
    } catch (error) {
      console.error('Error saving search settings:', error);
      toast({
        title: "Error",
        description: "Failed to save search settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

          <Button onClick={saveSettings} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
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
