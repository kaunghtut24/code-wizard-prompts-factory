
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Database, 
  Cloud, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseDatabaseService } from '@/services/supabaseDatabaseService';
import { useToast } from '@/hooks/use-toast';

const DatabaseSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [storageStats, setStorageStats] = useState<any>({});
  const [settings, setSettings] = useState({
    enableSemanticSearch: true,
    cacheSearchResults: true,
    autoBackup: false
  });

  useEffect(() => {
    if (user) {
      loadStorageStats();
      loadSettings();
    }
  }, [user]);

  const loadStorageStats = async () => {
    try {
      const stats = await supabaseDatabaseService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const enableSemanticSearch = await supabaseDatabaseService.getUserSetting('enable_semantic_search', true);
      const cacheSearchResults = await supabaseDatabaseService.getUserSetting('cache_search_results', true);
      const autoBackup = await supabaseDatabaseService.getUserSetting('auto_backup', false);
      
      setSettings({
        enableSemanticSearch,
        cacheSearchResults,
        autoBackup
      });
    } catch (error) {
      console.error('Failed to load database settings:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      await supabaseDatabaseService.setUserSetting(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Setting Updated",
        description: "Database setting has been saved",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update database setting",
        variant: "destructive",
      });
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      await supabaseDatabaseService.migrateFromLocalStorage();
      await loadStorageStats();
      
      toast({
        title: "Migration Complete",
        description: "Local data has been migrated to Supabase",
      });
    } catch (error) {
      toast({
        title: "Migration Failed",
        description: "Failed to migrate local data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      await supabaseDatabaseService.clearUserData();
      await loadStorageStats();
      
      toast({
        title: "Data Cleared",
        description: "All your data has been cleared from the database",
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Failed to clear data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Settings
          </CardTitle>
          <CardDescription>
            Sign in to access database features and persistent storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p>Authentication required</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>
            Your data is stored securely in Supabase with end-to-end encryption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Connected to Supabase</span>
            <Badge variant="outline" className="ml-2">
              <Cloud className="h-3 w-3 mr-1" />
              Cloud Storage
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{storageStats.conversationCount || 0}</div>
              <div className="text-sm text-muted-foreground">Conversations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{storageStats.promptsCount || 0}</div>
              <div className="text-sm text-muted-foreground">Custom Prompts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{storageStats.settingsCount || 0}</div>
              <div className="text-sm text-muted-foreground">Settings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Smart Features
          </CardTitle>
          <CardDescription>
            Configure intelligent features for better performance and user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="semantic-search">Semantic Search (RAG)</Label>
              <p className="text-sm text-muted-foreground">
                Enable AI-powered content search to reduce token usage
              </p>
            </div>
            <Switch
              id="semantic-search"
              checked={settings.enableSemanticSearch}
              onCheckedChange={(checked) => updateSetting('enable_semantic_search', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cache-search">Cache Search Results</Label>
              <p className="text-sm text-muted-foreground">
                Store search results temporarily for faster responses
              </p>
            </div>
            <Switch
              id="cache-search"
              checked={settings.cacheSearchResults}
              onCheckedChange={(checked) => updateSetting('cache_search_results', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Auto Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup conversations and settings
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={settings.autoBackup}
              onCheckedChange={(checked) => updateSetting('auto_backup', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Migrate, backup, or clear your application data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleMigration}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Migrate Local Data
            </Button>
            
            <Button
              variant="outline"
              onClick={loadStorageStats}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Stats
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleClearData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
