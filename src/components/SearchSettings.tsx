
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Settings, 
  TestTube, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle,
  BarChart3 
} from 'lucide-react';
import { searchService } from '@/services/searchService';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';

interface SearchSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchSettings: React.FC<SearchSettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [searchStats, setSearchStats] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      loadSearchStats();
    }
  }, [isOpen]);

  const loadSettings = () => {
    const savedApiKey = databaseService.getUserPreference('serpapi_key', '');
    const searchEnabled = databaseService.getUserPreference('search_enabled', true);
    
    setApiKey(savedApiKey);
    setIsSearchEnabled(searchEnabled);
  };

  const loadSearchStats = () => {
    const stats = searchService.getSearchStats();
    setSearchStats(stats);
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid SerpApi key",
        variant: "destructive",
      });
      return;
    }

    searchService.setApiKey(apiKey.trim());
    toast({
      title: "API Key Saved",
      description: "SerpApi key has been saved successfully",
    });
  };

  const handleToggleSearch = (enabled: boolean) => {
    setIsSearchEnabled(enabled);
    databaseService.setUserPreference('search_enabled', enabled);
    
    toast({
      title: enabled ? "Web Search Enabled" : "Web Search Disabled",
      description: enabled 
        ? "The assistant will now perform web searches when needed" 
        : "Web search functionality has been disabled",
    });
  };

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your SerpApi key first",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    
    try {
      // Save the key temporarily for testing
      searchService.setApiKey(apiKey.trim());
      
      const testResult = await searchService.search('test search query', {
        maxResults: 1,
        useCache: false
      });
      
      if (testResult.results.length > 0) {
        toast({
          title: "Connection Successful",
          description: "SerpApi connection is working properly",
        });
      } else {
        toast({
          title: "Connection Issue",
          description: "Connected but no results returned",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('SerpApi test failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to SerpApi",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Web Search Settings</CardTitle>
                <CardDescription>
                  Configure SerpApi integration for web search capabilities
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Search Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {searchService.isConfigured() ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <p className="font-medium">
                  {searchService.isConfigured() ? 'Web Search Ready' : 'Setup Required'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchService.isConfigured() 
                    ? 'SerpApi is configured and ready to use' 
                    : 'Please enter your SerpApi key to enable web search'}
                </p>
              </div>
            </div>
            <Badge variant={searchService.isConfigured() ? "default" : "secondary"}>
              {searchService.isConfigured() ? 'Configured' : 'Not Configured'}
            </Badge>
          </div>

          {/* API Key Configuration */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">SerpApi Key</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Enter your SerpApi key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveApiKey} variant="outline">
                  Save
                </Button>
                <Button 
                  onClick={testConnection} 
                  disabled={!apiKey.trim() || isTestingConnection}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTestingConnection ? 'Testing...' : 'Test'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Get your free API key from{' '}
                <a 
                  href="https://serpapi.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  serpapi.com <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Search Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Enable Web Search</p>
              <p className="text-sm text-muted-foreground">
                Allow the assistant to automatically search the web when needed
              </p>
            </div>
            <Switch
              checked={isSearchEnabled}
              onCheckedChange={handleToggleSearch}
            />
          </div>

          {/* Search Statistics */}
          {searchStats.totalSearches > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <h4 className="font-medium">Usage Statistics</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{searchStats.totalSearches}</p>
                  <p className="text-sm text-muted-foreground">Total Searches</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{searchStats.recentSearches}</p>
                  <p className="text-sm text-muted-foreground">Last 24h</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(searchStats.cacheHitRate)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Cache Hit Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">How Web Search Works</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• The assistant automatically detects when web search is needed</li>
              <li>• Search results are cached for 30 minutes to reduce API calls</li>
              <li>• Relevant information is integrated directly into responses</li>
              <li>• You can disable this feature at any time using the toggle above</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchSettings;
