
interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

interface PromptStorage {
  [agentType: string]: string;
}

class PromptService {
  private defaultPrompts: { [key: string]: SystemPrompt } = {
    'orchestrator': {
      id: 'orchestrator',
      name: 'Agent Orchestrator',
      content: `You are an intelligent Agent Orchestrator that analyzes user requests and routes them to the most appropriate specialized coding agent.

Context: The user has submitted a coding-related task that needs to be processed by one of 8 specialized agents.

Instructions:
1. Analyze the user's input for keywords, intent, and complexity
2. Determine which specialized agent is best suited for the task
3. Route the request with appropriate context and formatting
4. Ensure the selected agent receives all necessary information

Output format:
- Selected agent name and reasoning
- Formatted request for the target agent
- Any additional context or constraints`,
      isDefault: true
    },
    'code-gen': {
      id: 'code-gen',
      name: 'Code Generation Agent',
      content: `You are a helpful Code Generation Agent.

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
      isDefault: true
    },
    'bug-fix': {
      id: 'bug-fix',
      name: 'Bug Fix Agent',
      content: `You are a precise Bug Fixing Agent.

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
      isDefault: true
    },
    'refactor': {
      id: 'refactor',
      name: 'Refactor Specialist',
      content: `You are a Refactoring Agent specialized in code optimization.

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
      isDefault: true
    },
    'test-gen': {
      id: 'test-gen',
      name: 'Test Generator',
      content: `You are a Test Generator Agent.

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
      isDefault: true
    },
    'docs': {
      id: 'docs',
      name: 'Documentation Agent',
      content: `You are a Documentation Assistant Agent.

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
      isDefault: true
    },
    'github': {
      id: 'github',
      name: 'GitHub Assistant',
      content: `You are a GitHub Repository Assistant Agent.

Context: The user is working with a connected GitHub repo.

Instructions:
1. Fetch the latest state of the repository
2. If user requests a commit: stage changes, generate commit message, push
3. If user requests a pull request: generate PR title and description
4. Suggest changes made and their impact

Output format:
- Command summary (commit, push, PR)
- Title and body of commit/PR`,
      isDefault: true
    },
    'search': {
      id: 'search',
      name: 'Semantic Search Agent',
      content: `You are a Codebase Search Agent.

Context: The user asks a natural language question about a large codebase.

Instructions:
1. Convert the user question into a semantic vector or keyword query
2. Search the MCP-generated embeddings or indexed files
3. Retrieve the most relevant code chunks
4. Present the result with file name, location, and explanation

Output format:
- Summary of the answer
- Code snippet(s) found
- File and line references`,
      isDefault: true
    },
    'mcp': {
      id: 'mcp',
      name: 'MCP Analysis Agent',
      content: `You are an MCP Code Analysis Agent.

Context: The MCP server has sent a modular chunked view of a codebase.

Instructions:
1. Use the code map and relationships to understand dependencies
2. When answering a question, retrieve only the relevant chunks
3. If asked to modify or improve a section, reason through module relationships
4. If code is tightly coupled, suggest how to decouple

Output format:
- Reasoning about the structure
- Extracted or improved code snippets
- List of affected modules or files`,
      isDefault: true
    }
  };

  public getPrompt(agentType: string): string {
    try {
      // Try to get custom prompt from localStorage
      const stored = localStorage.getItem('system_prompts');
      if (stored) {
        const customPrompts: PromptStorage = JSON.parse(stored);
        if (customPrompts[agentType] && customPrompts[agentType].trim()) {
          console.log('Using custom prompt for agent:', agentType);
          return customPrompts[agentType];
        }
      }
    } catch (error) {
      console.warn('Failed to load custom prompt, using default:', error);
    }

    // Fallback to default prompt
    const defaultPrompt = this.defaultPrompts[agentType];
    if (defaultPrompt) {
      console.log('Using default prompt for agent:', agentType);
      return defaultPrompt.content;
    }

    // Ultimate fallback
    console.warn('No prompt found for agent type:', agentType, 'using orchestrator default');
    return this.defaultPrompts.orchestrator.content;
  }

  public savePrompt(agentType: string, content: string): void {
    try {
      const stored = localStorage.getItem('system_prompts');
      const prompts: PromptStorage = stored ? JSON.parse(stored) : {};
      
      prompts[agentType] = content;
      localStorage.setItem('system_prompts', JSON.stringify(prompts));
      
      console.log('Saved custom prompt for agent:', agentType);
    } catch (error) {
      console.error('Failed to save custom prompt:', error);
      throw new Error('Failed to save prompt configuration');
    }
  }

  public getDefaultPrompt(agentType: string): string {
    const defaultPrompt = this.defaultPrompts[agentType];
    return defaultPrompt ? defaultPrompt.content : this.defaultPrompts.orchestrator.content;
  }

  public resetToDefault(agentType: string): void {
    try {
      const stored = localStorage.getItem('system_prompts');
      if (stored) {
        const prompts: PromptStorage = JSON.parse(stored);
        delete prompts[agentType];
        localStorage.setItem('system_prompts', JSON.stringify(prompts));
      }
      console.log('Reset prompt to default for agent:', agentType);
    } catch (error) {
      console.error('Failed to reset prompt:', error);
    }
  }

  public getAllPrompts(): SystemPrompt[] {
    return Object.values(this.defaultPrompts);
  }

  public getCustomPrompt(agentType: string): string | null {
    try {
      const stored = localStorage.getItem('system_prompts');
      if (stored) {
        const customPrompts: PromptStorage = JSON.parse(stored);
        return customPrompts[agentType] || null;
      }
    } catch (error) {
      console.warn('Failed to load custom prompt:', error);
    }
    return null;
  }

  public hasCustomPrompt(agentType: string): boolean {
    return this.getCustomPrompt(agentType) !== null;
  }
}

export const promptService = new PromptService();
export type { SystemPrompt };
