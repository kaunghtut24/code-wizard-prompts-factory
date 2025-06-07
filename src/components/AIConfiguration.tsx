
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Key, Globe, Brain, Save, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';

interface AIConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIConfiguration: React.FC<AIConfigurationProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [provider, setProvider] = useState('openai');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');
  const { toast } = useToast();

  const providers = [
    { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' },
    { id: 'anthropic', name: 'Anthropic (Claude)', baseUrl: 'https://api.anthropic.com' },
    { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1' },
    { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' },
    { id: 'together', name: 'Together AI', baseUrl: 'https://api.together.xyz/v1' },
    { id: 'custom', name: 'Custom Provider', baseUrl: '' }
  ];

  const models = {
    openai: [
      'gpt-4-turbo-preview',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ],
    anthropic: [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    gemini: [
      'gemini-pro',
      'gemini-pro-vision'
    ],
    groq: [
      'llama2-70b-4096',
      'mixtral-8x7b-32768',
      'gemma-7b-it'
    ],
    together: [
      'meta-llama/Llama-2-70b-chat-hf',
      'mistralai/Mixtral-8x7B-Instruct-v0.1',
      'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO'
    ],
    custom: []
  };

  useEffect(() => {
    // Load existing configuration
    const stored = localStorage.getItem('ai_config');
    if (stored) {
      try {
        const config = JSON.parse(stored);
        setProvider(config.provider || 'openai');
        setApiKey(config.apiKey || '');
        setBaseUrl(config.baseUrl || 'https://api.openai.com/v1');
        setSelectedModel(config.model || 'gpt-4');
      } catch (error) {
        console.error('Failed to load stored config:', error);
      }
    }
  }, [isOpen]);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerConfig = providers.find(p => p.id === newProvider);
    if (providerConfig && providerConfig.baseUrl) {
      setBaseUrl(providerConfig.baseUrl);
    }
    setSelectedModel('');
    setConnectionStatus('idle');
    setConnectionError('');
  };

  const handleSaveConfiguration = async () => {
    setIsConnecting(true);
    setConnectionError('');
    
    try {
      if (!apiKey.trim()) {
        throw new Error('API Key is required');
      }
      if (!selectedModel.trim()) {
        throw new Error('Model selection is required');
      }
      if (!baseUrl.trim()) {
        throw new Error('Base URL is required');
      }

      const config = {
        provider,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        model: selectedModel.trim(),
        timestamp: new Date().toISOString()
      };
      
      aiService.updateConfig(config);
      
      toast({
        title: "Configuration Saved",
        description: `Successfully configured ${providers.find(p => p.id === provider)?.name} with model ${selectedModel}`,
      });
      
      setConnectionStatus('success');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionError(errorMessage);
      setConnectionStatus('error');
      
      toast({
        title: "Configuration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsConnecting(true);
    setConnectionError('');
    setConnectionStatus('idle');
    
    try {
      if (!apiKey.trim()) {
        throw new Error('API Key is required for testing');
      }
      if (!selectedModel.trim()) {
        throw new Error('Model selection is required for testing');
      }
      if (!baseUrl.trim()) {
        throw new Error('Base URL is required for testing');
      }

      // Temporarily update the service with current values for testing
      const testConfig = {
        provider,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        model: selectedModel.trim()
      };
      
      aiService.updateConfig(testConfig);
      
      const result = await aiService.testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the AI service!",
        });
      } else {
        setConnectionStatus('error');
        setConnectionError(result.error || 'Connection test failed');
        toast({
          title: "Connection Failed",
          description: result.error || 'Connection test failed',
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setConnectionStatus('error');
      setConnectionError(errorMessage);
      
      toast({
        title: "Connection Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            AI Model Configuration
          </CardTitle>
          <CardDescription>
            Configure your AI provider and model settings for the coding assistant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status Alert */}
          {connectionStatus === 'error' && connectionError && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
          
          {connectionStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Connection test successful! Configuration is working properly.
              </AlertDescription>
            </Alert>
          )}

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setConnectionStatus('idle');
                setConnectionError('');
              }}
            />
            {provider === 'openai' && (
              <p className="text-xs text-muted-foreground">
                Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a>
              </p>
            )}
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="baseUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Base URL
            </Label>
            <Input
              id="baseUrl"
              placeholder="API base URL"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setConnectionStatus('idle');
                setConnectionError('');
              }}
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Model
            </Label>
            <Select value={selectedModel} onValueChange={(value) => {
              setSelectedModel(value);
              setConnectionStatus('idle');
              setConnectionError('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models[provider as keyof typeof models]?.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={apiKey ? "default" : "secondary"}>
              {apiKey ? "API Key Set" : "No API Key"}
            </Badge>
            <Badge variant={selectedModel ? "default" : "secondary"}>
              {selectedModel ? "Model Selected" : "No Model"}
            </Badge>
            <Badge variant={baseUrl ? "default" : "secondary"}>
              {baseUrl ? "URL Configured" : "No Base URL"}
            </Badge>
            {connectionStatus === 'success' && (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleTestConnection} 
              variant="outline" 
              disabled={!apiKey || !selectedModel || !baseUrl || isConnecting}
              className="flex-1"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isConnecting ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button 
              onClick={handleSaveConfiguration} 
              disabled={!apiKey || !selectedModel || !baseUrl || isConnecting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isConnecting ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfiguration;
