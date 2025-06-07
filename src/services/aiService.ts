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

  public updateConfig(config: AIConfig): void {
    console.log('Updating AI config:', { 
      provider: config.provider, 
      hasApiKey: !!config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl 
    });
    
    this.config = config;
    try {
      localStorage.setItem('ai_config', JSON.stringify(config));
      console.log('AI config saved successfully');
    } catch (error) {
      console.error('Failed to save AI config to localStorage:', error);
      throw new Error('Failed to save configuration');
    }
  }

  public isConfigured(): boolean {
    const configured = this.config !== null && 
           this.config.apiKey !== '' && 
           this.config.model !== '' &&
           this.config.baseUrl !== '';
    
    console.log('AI Service configured:', configured);
    if (!configured) {
      console.log('Missing config:', {
        hasConfig: !!this.config,
        hasApiKey: !!this.config?.apiKey,
        hasModel: !!this.config?.model,
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
      console.log('Testing AI connection...');
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

    console.log('Starting AI chat request:', {
      provider: this.config.provider,
      model: this.config.model,
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

    const body = this.formatRequestBody(messages, agentType);
    const url = this.buildUrl();

    console.log('AI request details:', {
      url,
      headers: Object.keys(headers),
      bodyKeys: Object.keys(body)
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

  private formatRequestBody(messages: ChatMessage[], agentType?: string): any {
    const systemPrompt = this.getSystemPrompt(agentType);
    const fullMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    console.log('Formatting request for provider:', this.config!.provider);
    console.log('Using system prompt for agent:', agentType, 'Length:', systemPrompt?.length || 0);

    switch (this.config!.provider) {
      case 'anthropic':
        return {
          model: this.config!.model,
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
          model: this.config!.model,
          messages: fullMessages,
          max_tokens: 4000,
          temperature: 0.7,
        };
    }
  }

  private buildUrl(): string {
    const { provider, baseUrl, apiKey } = this.config!;
    
    console.log('Building URL for provider:', provider);
    
    switch (provider) {
      case 'gemini':
        return `${baseUrl}/models/${this.config!.model}:generateContent?key=${apiKey}`;
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
