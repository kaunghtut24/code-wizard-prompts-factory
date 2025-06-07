import { promptService } from './promptService';

interface AIConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Default models for each provider as fallback
const DEFAULT_MODELS = {
  openai: 'gpt-4',
  anthropic: 'claude-3-5-sonnet-20241022',
  gemini: 'gemini-pro',
  groq: 'llama2-70b-4096',
  together: 'meta-llama/Llama-2-70b-chat-hf',
  custom: 'custom-model'
};

class AIService {
  private config: AIConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('ai_config');
      if (stored) {
        this.config = JSON.parse(stored);
        console.log('AI Config loaded:', { 
          provider: this.config?.provider, 
          hasApiKey: !!this.config?.apiKey,
          model: this.config?.model,
          baseUrl: this.config?.baseUrl 
        });
      }
    } catch (error) {
      console.error('Failed to load AI config from localStorage:', error);
      this.config = null;
    }
  }

  private getDefaultModel(provider: string): string {
    return DEFAULT_MODELS[provider as keyof typeof DEFAULT_MODELS] || DEFAULT_MODELS.openai;
  }

  private getEffectiveModel(): string {
    if (!this.config) {
      return DEFAULT_MODELS.openai;
    }

    // Use configured model, or fallback to provider default
    const configuredModel = this.config.model?.trim();
    if (configuredModel) {
      return configuredModel;
    }

    const defaultModel = this.getDefaultModel(this.config.provider);
    console.log(`Using default model for provider ${this.config.provider}: ${defaultModel}`);
    return defaultModel;
  }

  public updateConfig(config: AIConfig): void {
    console.log('Updating AI config:', { 
      provider: config.provider, 
      hasApiKey: !!config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl 
    });
    
    // Ensure model fallback
    const effectiveModel = config.model?.trim() || this.getDefaultModel(config.provider);
    
    this.config = {
      ...config,
      model: effectiveModel
    };

    try {
      localStorage.setItem('ai_config', JSON.stringify(this.config));
      console.log('AI config saved successfully with effective model:', effectiveModel);
    } catch (error) {
      console.error('Failed to save AI config to localStorage:', error);
      throw new Error('Failed to save configuration');
    }
  }

  public isConfigured(): boolean {
    const configured = this.config !== null && 
           this.config.apiKey !== '' && 
           this.config.baseUrl !== '';
    
    console.log('AI Service configured:', configured);
    if (!configured) {
      console.log('Missing config:', {
        hasConfig: !!this.config,
        hasApiKey: !!this.config?.apiKey,
        hasModel: !!this.getEffectiveModel(),
        hasBaseUrl: !!this.config?.baseUrl
      });
    }
    
    return configured;
  }

  public async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'AI service not configured' };
    }

    try {
      console.log('Testing AI connection with model:', this.getEffectiveModel());
      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Hello, this is a connection test. Please respond with "Connection successful".' }
      ];

      const response = await this.chat(testMessages);
      console.log('Connection test response:', response);
      
      if (response.content && response.content.length > 0) {
        return { success: true };
      } else {
        return { success: false, error: 'Empty response from AI service' };
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    }
  }

  public async chat(messages: ChatMessage[], agentType?: string): Promise<AIResponse> {
    if (!this.config) {
      throw new Error('AI service not configured. Please set up your API key and model.');
    }

    const effectiveModel = this.getEffectiveModel();
    console.log('Starting AI chat request:', {
      provider: this.config.provider,
      model: effectiveModel,
      agentType,
      messageCount: messages.length
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Configure headers based on provider
    switch (this.config.provider) {
      case 'openai':
      case 'groq':
      case 'together':
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = this.config.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;
      case 'gemini':
        // Gemini uses API key in URL
        break;
      default:
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const body = this.formatRequestBody(messages, agentType, effectiveModel);
    const url = this.buildUrl(effectiveModel);

    console.log('AI request details:', {
      url,
      headers: Object.keys(headers),
      bodyKeys: Object.keys(body),
      effectiveModel
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log('AI response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        
        // Add specific error details based on status
        switch (response.status) {
          case 401:
            errorMessage = 'Invalid API key. Please check your API key configuration.';
            break;
          case 403:
            errorMessage = 'Access forbidden. Please check your API key permissions.';
            break;
          case 404:
            errorMessage = 'API endpoint not found. Please check your base URL configuration.';
            break;
          case 422:
            // Try with default model if custom model fails
            if (this.config.model !== this.getDefaultModel(this.config.provider)) {
              console.log('Custom model failed, attempting with default model...');
              const defaultModel = this.getDefaultModel(this.config.provider);
              const fallbackBody = this.formatRequestBody(messages, agentType, defaultModel);
              const fallbackUrl = this.buildUrl(defaultModel);
              
              try {
                const fallbackResponse = await fetch(fallbackUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(fallbackBody),
                });
                
                if (fallbackResponse.ok) {
                  const fallbackData = await fallbackResponse.json();
                  console.log('Fallback to default model successful');
                  return this.parseResponse(fallbackData);
                }
              } catch (fallbackError) {
                console.error('Fallback attempt also failed:', fallbackError);
              }
            }
            errorMessage = `Model "${effectiveModel}" not available. Please check if the model name is correct or try a different model.`;
            break;
          case 429:
            errorMessage = 'Rate limit exceeded. Please try again later.';
            break;
          case 500:
            errorMessage = 'AI service internal error. Please try again later.';
            break;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('AI response data keys:', Object.keys(data));
      
      const result = this.parseResponse(data);
      console.log('Parsed AI response:', {
        contentLength: result.content?.length || 0,
        hasUsage: !!result.usage
      });
      
      return result;
    } catch (error) {
      console.error('AI API Error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and base URL.');
      }
      
      throw error;
    }
  }

  private formatRequestBody(messages: ChatMessage[], agentType?: string, model?: string): any {
    const systemPrompt = this.getSystemPrompt(agentType);
    const fullMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const effectiveModel = model || this.getEffectiveModel();

    console.log('Formatting request for provider:', this.config!.provider);
    console.log('Using system prompt for agent:', agentType, 'Length:', systemPrompt?.length || 0);
    console.log('Using model:', effectiveModel);

    switch (this.config!.provider) {
      case 'anthropic':
        return {
          model: effectiveModel,
          max_tokens: 4000,
          messages: fullMessages,
        };
      case 'gemini':
        return {
          contents: fullMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }))
        };
      default:
        return {
          model: effectiveModel,
          messages: fullMessages,
          max_tokens: 4000,
          temperature: 0.7,
        };
    }
  }

  private buildUrl(model?: string): string {
    const { provider, baseUrl, apiKey } = this.config!;
    const effectiveModel = model || this.getEffectiveModel();
    
    console.log('Building URL for provider:', provider, 'with model:', effectiveModel);
    
    switch (provider) {
      case 'gemini':
        return `${baseUrl}/models/${effectiveModel}:generateContent?key=${apiKey}`;
      case 'anthropic':
        return `${baseUrl}/messages`;
      default:
        return `${baseUrl}/chat/completions`;
    }
  }

  private parseResponse(data: any): AIResponse {
    const { provider } = this.config!;

    console.log('Parsing response for provider:', provider);

    try {
      switch (provider) {
        case 'anthropic':
          return {
            content: data.content?.[0]?.text || '',
            usage: data.usage
          };
        case 'gemini':
          return {
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
            usage: data.usageMetadata
          };
        default:
          return {
            content: data.choices?.[0]?.message?.content || '',
            usage: data.usage
          };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI response. The response format may be unexpected.');
    }
  }

  private getSystemPrompt(agentType?: string): string {
    if (!agentType) {
      console.log('No agent type provided, using orchestrator default');
      return promptService.getPrompt('orchestrator');
    }

    const prompt = promptService.getPrompt(agentType);
    console.log('Retrieved system prompt for agent:', agentType, {
      isCustom: promptService.hasCustomPrompt(agentType),
      length: prompt.length
    });
    
    return prompt;
  }
}

export const aiService = new AIService();
export type { ChatMessage, AIResponse };
