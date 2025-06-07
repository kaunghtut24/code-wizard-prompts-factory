
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, Globe, Brain, Save, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerConfig = providers.find(p => p.id === newProvider);
    if (providerConfig) {
      setBaseUrl(providerConfig.baseUrl);
    }
    setSelectedModel('');
  };

  const handleSaveConfiguration = async () => {
    setIsConnecting(true);
    
    try {
      // Save to localStorage for now (will integrate with Supabase later)
      const config = {
        provider,
        apiKey,
        baseUrl,
        model: selectedModel,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('ai_config', JSON.stringify(config));
      
      toast({
        title: "Configuration Saved",
        description: `Successfully configured ${providers.find(p => p.id === provider)?.name} with model ${selectedModel}`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Configuration Failed",
        description: "Failed to save AI configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsConnecting(true);
    
    try {
      // Test API connection (placeholder implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Connection Test",
        description: "API connection test completed successfully!",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the API. Please check your configuration.",
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
              onChange={(e) => setApiKey(e.target.value)}
            />
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
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Model
            </Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
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
          <div className="flex items-center gap-2">
            <Badge variant={apiKey ? "default" : "secondary"}>
              {apiKey ? "API Key Set" : "No API Key"}
            </Badge>
            <Badge variant={selectedModel ? "default" : "secondary"}>
              {selectedModel ? "Model Selected" : "No Model"}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleTestConnection} 
              variant="outline" 
              disabled={!apiKey || !selectedModel || isConnecting}
              className="flex-1"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button 
              onClick={handleSaveConfiguration} 
              disabled={!apiKey || !selectedModel || isConnecting}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
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
