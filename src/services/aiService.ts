
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
    const stored = localStorage.getItem('ai_config');
    if (stored) {
      this.config = JSON.parse(stored);
    }
  }

  public updateConfig(config: AIConfig): void {
    this.config = config;
    localStorage.setItem('ai_config', JSON.stringify(config));
  }

  public isConfigured(): boolean {
    return this.config !== null && 
           this.config.apiKey !== '' && 
           this.config.model !== '';
  }

  public async chat(messages: ChatMessage[], agentType?: string): Promise<AIResponse> {
    if (!this.config) {
      throw new Error('AI service not configured');
    }

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

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      console.error('AI API Error:', error);
      throw error;
    }
  }

  private formatRequestBody(messages: ChatMessage[], agentType?: string): any {
    const systemPrompt = this.getSystemPrompt(agentType);
    const fullMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

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

    switch (provider) {
      case 'anthropic':
        return {
          content: data.content[0]?.text || '',
          usage: data.usage
        };
      case 'gemini':
        return {
          content: data.candidates[0]?.content?.parts[0]?.text || '',
          usage: data.usageMetadata
        };
      default:
        return {
          content: data.choices[0]?.message?.content || '',
          usage: data.usage
        };
    }
  }

  private getSystemPrompt(agentType?: string): string {
    const prompts = {
      'code-gen': `You are a helpful Code Generation Agent.

Context: The user provides a prompt describing a desired feature or function.

Instructions:
1. Analyze the prompt for requirements and constraints
2. Decide the best language and framework based on context
3. Generate clean, commented, production-ready code
4. Include error handling and edge cases where appropriate
5. Follow language-specific best practices and conventions
6. If dependencies are required, list installation steps
7. Explain integration with larger applications if relevant

Output format:
- Code block with proper syntax highlighting
- Brief explanation of the solution approach
- Installation/setup instructions if needed
- Usage examples and integration notes`,

      'bug-fix': `You are a precise Bug Fixing Agent.

Context: The user provides a code snippet and describes a bug, error message, or issue.

Instructions:
1. Understand the problem described
2. Identify the exact lines or logic causing the issue
3. Rewrite the faulty code and explain the fix clearly
4. Ensure the fixed code works and is logically sound
5. Test edge cases that might cause similar issues

Output format:
- BEFORE: Code with issue (annotated if possible)
- AFTER: Corrected code
- Explanation of what was fixed and why`,

      'refactor': `You are a Refactoring Agent specialized in code optimization.

Context: The user provides code that works but may not be clean, readable, or efficient.

Instructions:
1. Review the provided code for duplication, readability, structure, or performance issues
2. Refactor the code without changing its logic
3. Use better variable names, modular design, and follow best practices
4. Annotate major changes with inline comments
5. Ensure backward compatibility

Output format:
- Refactored code
- Summary of key improvements made`,

      'test-gen': `You are a Test Generator Agent.

Context: The user provides code (function, class, or module).

Instructions:
1. Identify the testable components
2. Generate unit tests using appropriate test framework
3. Include edge cases and typical scenarios
4. Ensure tests are clean, executable, and follow naming conventions
5. Add integration tests where appropriate

Output format:
- Test code block
- List of test cases explained in comments`,

      'docs': `You are a Documentation Assistant Agent.

Context: The user provides code and asks you to document it.

Instructions:
1. Read and understand the code's purpose and structure
2. Add docstrings for all functions, classes, and modules
3. Generate Markdown documentation if asked, with usage examples
4. Ensure technical accuracy and clarity
5. Follow language-specific documentation conventions

Output format:
- Updated code with docstrings
- Markdown block with external documentation (optional)`,

      'orchestrator': `You are an intelligent Agent Orchestrator that analyzes user requests and routes them to the most appropriate specialized coding agent.

Context: The user has submitted a coding-related task that needs to be processed by one of 8 specialized agents.

Instructions:
1. Analyze the user's input for keywords, intent, and complexity
2. Determine which specialized agent is best suited for the task
3. Route the request with appropriate context and formatting
4. Ensure the selected agent receives all necessary information

Output format:
- Selected agent name and reasoning
- Formatted request for the target agent
- Any additional context or constraints`
    };

    return prompts[agentType as keyof typeof prompts] || prompts.orchestrator;
  }
}

export const aiService = new AIService();
export type { ChatMessage, AIResponse };
