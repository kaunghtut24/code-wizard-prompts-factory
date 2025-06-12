
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Globe, Check, X, AlertCircle, Key, Zap, RefreshCw } from 'lucide-react';
import { searchService } from '@/services/searchService';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';

const SearchSettings: React.FC = () => {
  const [searchEnabled, setSearchEnabled] = useState(true);
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [maxResults, setMaxResults] = useState(5);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
    checkConnection();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await databaseService.getUserSetting('search_enabled', true);
      const maxRes = await databaseService.getUserSetting('search_max_results', 5);
      setSearchEnabled(enabled);
      setMaxResults(maxRes);

      // Load API key from service
      const apiKey = searchService.getApiKey();
      setTavilyApiKey(apiKey || '');
    } catch (error) {
      console.error('Error loading search settings:', error);
    }
  };

  const checkConnection = async () => {
    if (!tavilyApiKey.trim()) {
      setIsConnected(false);
      return;
    }

    try {
      const isConfigured = searchService.isConfigured();
      setIsConnected(isConfigured);
    } catch (error) {
      console.error('Error checking Tavily API connection:', error);
      setIsConnected(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTavilyApiKey(e.target.value);
  };

  const handleSearchEnabledChange = (checked: boolean) => {
    setSearchEnabled(checked);
  };

  const handleMaxResultsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0 && value <= 10) {
      setMaxResults(value);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // Save to database
      await databaseService.setUserSetting('search_enabled', searchEnabled);
      await databaseService.setUserSetting('search_max_results', maxResults);
      
      // Configure search service
      if (tavilyApiKey.trim()) {
        await searchService.setApiKey(tavilyApiKey.trim());
      }
      
      toast({
        title: "Settings Saved",
        description: "Search settings have been updated successfully.",
      });
      
      // Recheck connection
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Web Search Settings</h3>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="search-enabled">Enable Web Search</Label>
            <Switch
              id="search-enabled"
              checked={searchEnabled}
              onCheckedChange={handleSearchEnabledChange}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Enable real-time web search for up-to-date information
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tavily-api-key">Tavily API Key</Label>
          <Input
            id="tavily-api-key"
            placeholder="sk_..."
            type="password"
            value={tavilyApiKey}
            onChange={handleApiKeyChange}
          />
          <p className="text-sm text-muted-foreground">
            Enter your Tavily API key to enable web search
          </p>
          {!tavilyApiKey.trim() && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              API Key Required
            </Badge>
          )}
          {tavilyApiKey.trim() && isConnected && (
            <Badge variant="secondary" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Connected to Tavily API
            </Badge>
          )}
          {tavilyApiKey.trim() && !isConnected && (
            <Badge variant="outline" className="text-xs text-red-500">
              <Zap className="h-3 w-3 mr-1" />
              Connection Failed
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-results">Max Search Results</Label>
          <Input
            id="max-results"
            type="number"
            min="1"
            max="10"
            value={maxResults.toString()}
            onChange={handleMaxResultsChange}
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
      </div>
    </div>
  );
};

export default SearchSettings;
