
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Key, Globe, Brain, Save, TestTube, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AIConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIConfiguration: React.FC<AIConfigurationProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [selectedModel, setSelectedModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [provider, setProvider] = useState('openai');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string>('');
  const { toast } = useToast();

  const providers = [
    { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4' },
    { id: 'anthropic', name: 'Anthropic (Claude)', baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-3-5-sonnet-20241022' },
    { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1', defaultModel: 'gemini-pro' },
    { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama2-70b-4096' },
    { id: 'together', name: 'Together AI', baseUrl: 'https://api.together.xyz/v1', defaultModel: 'meta-llama/Llama-2-70b-chat-hf' },
    { id: 'custom', name: 'Custom Provider', baseUrl: '', defaultModel: 'custom-model' }
  ];

  const popularModels = {
    openai: [
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k'
    ],
    anthropic: [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ],
    gemini: [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ],
    groq: [
      'llama2-70b-4096',
      'mixtral-8x7b-32768',
      'gemma-7b-it',
      'llama-3.1-70b-versatile'
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
        setSelectedModel(config.model || '');
        setCustomModel(config.model || '');
      } catch (error) {
        console.error('Failed to load stored config:', error);
      }
    }
  }, [isOpen]);

  const getCurrentProvider = () => providers.find(p => p.id === provider);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerConfig = providers.find(p => p.id === newProvider);
    if (providerConfig) {
      if (providerConfig.baseUrl) {
        setBaseUrl(providerConfig.baseUrl);
      }
      setSelectedModel(providerConfig.defaultModel);
      setCustomModel(providerConfig.defaultModel);
    }
    setConnectionStatus('idle');
    setConnectionError('');
  };

  const handleModelSelection = (model: string) => {
    setSelectedModel(model);
    setCustomModel(model);
  };

  const getEffectiveModel = () => {
    return customModel.trim() || selectedModel || getCurrentProvider()?.defaultModel || 'gpt-4';
  };

  const handleSaveConfiguration = async () => {
    setIsConnecting(true);
    setConnectionError('');
    
    try {
      if (!apiKey.trim()) {
        throw new Error('API Key is required');
      }
      
      const effectiveModel = getEffectiveModel();
      if (!effectiveModel) {
        throw new Error('Model selection is required');
      }
      
      if (!baseUrl.trim()) {
        throw new Error('Base URL is required');
      }

      const config = {
        provider,
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim(),
        model: effectiveModel,
        timestamp: new Date().toISOString()
      };
      
      aiService.updateConfig(config);
      
      toast({
        title: "Configuration Saved",
        description: `Successfully configured ${getCurrentProvider()?.name} with model ${effectiveModel}`,
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
      
      const effectiveModel = getEffectiveModel();
      if (!effectiveModel) {
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
        model: effectiveModel
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

  const effectiveModel = getEffectiveModel();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            AI Model Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider and model settings for the coding assistant
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
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
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Model Configuration
            </Label>
            
            {/* Popular Models Quick Select */}
            {popularModels[provider as keyof typeof popularModels]?.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Popular Models (Quick Select)</Label>
                <div className="flex flex-wrap gap-2">
                  {popularModels[provider as keyof typeof popularModels].map((model) => (
                    <Button
                      key={model}
                      variant={selectedModel === model ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleModelSelection(model)}
                      className="text-xs"
                    >
                      {model}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Model Input */}
            <div className="space-y-2">
              <Label htmlFor="customModel" className="text-sm">Custom Model Name</Label>
              <Input
                id="customModel"
                placeholder={`Enter model name (default: ${getCurrentProvider()?.defaultModel})`}
                value={customModel}
                onChange={(e) => {
                  setCustomModel(e.target.value);
                  setConnectionStatus('idle');
                  setConnectionError('');
                }}
              />
              <div className="flex items-start gap-2 p-2 bg-blue-50 rounded border">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p><strong>Current effective model:</strong> {effectiveModel}</p>
                  <p className="mt-1">You can enter any model name here, including future models. The system will use the default model as fallback if the specified model is not available.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={apiKey ? "default" : "secondary"}>
              {apiKey ? "API Key Set" : "No API Key"}
            </Badge>
            <Badge variant={effectiveModel ? "default" : "secondary"}>
              {effectiveModel ? `Model: ${effectiveModel}` : "No Model"}
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
              disabled={!apiKey || !effectiveModel || !baseUrl || isConnecting}
              className="flex-1"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isConnecting ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button 
              onClick={handleSaveConfiguration} 
              disabled={!apiKey || !effectiveModel || !baseUrl || isConnecting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {isConnecting ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIConfiguration;
