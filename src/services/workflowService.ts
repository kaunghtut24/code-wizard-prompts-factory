
import { aiService } from './aiService';
import { promptService } from './promptService';

interface WorkflowStep {
  agentType: string;
  input: string;
  output?: string;
  metadata?: any;
}

interface WorkflowPlan {
  id: string;
  steps: WorkflowStep[];
  currentStep: number;
  isComplete: boolean;
  finalOutput?: string;
}

interface AgentCollaboration {
  requiredAgents: string[];
  workflow: 'sequential' | 'parallel' | 'iterative';
  dependencies: { [key: string]: string[] };
}

class WorkflowService {
  private activeWorkflows: Map<string, WorkflowPlan> = new Map();

  // Define collaboration patterns for different task types
  private collaborationPatterns: { [key: string]: AgentCollaboration } = {
    'full-stack-development': {
      requiredAgents: ['architecture', 'code-gen', 'security', 'test-gen', 'docs'],
      workflow: 'sequential',
      dependencies: {
        'code-gen': ['architecture'],
        'security': ['code-gen'],
        'test-gen': ['code-gen', 'security'],
        'docs': ['code-gen', 'test-gen']
      }
    },
    'bug-investigation': {
      requiredAgents: ['search', 'bug-fix', 'test-gen', 'performance'],
      workflow: 'sequential',
      dependencies: {
        'bug-fix': ['search'],
        'test-gen': ['bug-fix'],
        'performance': ['bug-fix']
      }
    },
    'code-review': {
      requiredAgents: ['security', 'performance', 'refactor', 'test-gen'],
      workflow: 'parallel',
      dependencies: {}
    },
    'legacy-modernization': {
      requiredAgents: ['mcp', 'architecture', 'refactor', 'security', 'test-gen'],
      workflow: 'sequential',
      dependencies: {
        'architecture': ['mcp'],
        'refactor': ['architecture'],
        'security': ['refactor'],
        'test-gen': ['refactor']
      }
    }
  };

  public analyzeTaskComplexity(userInput: string): {
    complexity: 'simple' | 'moderate' | 'complex';
    suggestedPattern?: string;
    agents: string[];
  } {
    const input = userInput.toLowerCase();
    
    // Check for complex patterns
    if (input.includes('full stack') || input.includes('entire application') || input.includes('complete system')) {
      return {
        complexity: 'complex',
        suggestedPattern: 'full-stack-development',
        agents: this.collaborationPatterns['full-stack-development'].requiredAgents
      };
    }
    
    if (input.includes('legacy') || input.includes('modernize') || input.includes('migrate')) {
      return {
        complexity: 'complex',
        suggestedPattern: 'legacy-modernization',
        agents: this.collaborationPatterns['legacy-modernization'].requiredAgents
      };
    }
    
    if (input.includes('review') && (input.includes('security') || input.includes('performance'))) {
      return {
        complexity: 'moderate',
        suggestedPattern: 'code-review',
        agents: this.collaborationPatterns['code-review'].requiredAgents
      };
    }
    
    if (input.includes('bug') || input.includes('error') || input.includes('issue')) {
      return {
        complexity: 'moderate',
        suggestedPattern: 'bug-investigation',
        agents: this.collaborationPatterns['bug-investigation'].requiredAgents
      };
    }
    
    // Simple single-agent tasks
    if (input.includes('generate') || input.includes('create')) return { complexity: 'simple', agents: ['code-gen'] };
    if (input.includes('test')) return { complexity: 'simple', agents: ['test-gen'] };
    if (input.includes('document')) return { complexity: 'simple', agents: ['docs'] };
    if (input.includes('refactor')) return { complexity: 'simple', agents: ['refactor'] };
    if (input.includes('security')) return { complexity: 'simple', agents: ['security'] };
    if (input.includes('performance')) return { complexity: 'simple', agents: ['performance'] };
    if (input.includes('search') || input.includes('find')) return { complexity: 'simple', agents: ['search'] };
    
    return { complexity: 'simple', agents: ['code-gen'] };
  }

  public async createWorkflow(userInput: string, taskAnalysis: any): Promise<WorkflowPlan> {
    const workflowId = `workflow_${Date.now()}`;
    
    let steps: WorkflowStep[] = [];
    
    if (taskAnalysis.complexity === 'simple') {
      // Single agent workflow
      steps = [{
        agentType: taskAnalysis.agents[0],
        input: userInput
      }];
    } else if (taskAnalysis.suggestedPattern) {
      // Multi-agent collaborative workflow
      const pattern = this.collaborationPatterns[taskAnalysis.suggestedPattern];
      steps = pattern.requiredAgents.map(agentType => ({
        agentType,
        input: userInput // Will be enhanced with context from previous steps
      }));
    }
    
    const workflow: WorkflowPlan = {
      id: workflowId,
      steps,
      currentStep: 0,
      isComplete: false
    };
    
    this.activeWorkflows.set(workflowId, workflow);
    return workflow;
  }

  public async executeWorkflowStep(workflowId: string): Promise<{ 
    stepOutput: string; 
    isComplete: boolean; 
    nextAgent?: string;
  }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow || workflow.isComplete) {
      throw new Error('Workflow not found or already complete');
    }
    
    const currentStep = workflow.steps[workflow.currentStep];
    if (!currentStep) {
      throw new Error('No current step found');
    }
    
    // Prepare enhanced input with context from previous steps
    let enhancedInput = currentStep.input;
    if (workflow.currentStep > 0) {
      const previousOutputs = workflow.steps
        .slice(0, workflow.currentStep)
        .filter(step => step.output)
        .map(step => `${step.agentType.toUpperCase()} OUTPUT:\n${step.output}`)
        .join('\n\n');
      
      enhancedInput = `PREVIOUS AGENT OUTPUTS:\n${previousOutputs}\n\nCURRENT TASK:\n${currentStep.input}`;
    }
    
    // Execute current step
    const messages = [
      { role: 'user' as const, content: enhancedInput }
    ];
    
    const response = await aiService.chat(messages, currentStep.agentType);
    currentStep.output = response.content;
    
    // Move to next step
    workflow.currentStep++;
    
    // Check if workflow is complete
    if (workflow.currentStep >= workflow.steps.length) {
      workflow.isComplete = true;
      workflow.finalOutput = this.synthesizeWorkflowOutputs(workflow);
    }
    
    const nextAgent = workflow.currentStep < workflow.steps.length 
      ? workflow.steps[workflow.currentStep].agentType 
      : undefined;
    
    return {
      stepOutput: response.content,
      isComplete: workflow.isComplete,
      nextAgent
    };
  }

  private synthesizeWorkflowOutputs(workflow: WorkflowPlan): string {
    const outputs = workflow.steps
      .filter(step => step.output)
      .map(step => `## ${step.agentType.charAt(0).toUpperCase() + step.agentType.slice(1)} Agent Output\n\n${step.output}`)
      .join('\n\n---\n\n');
    
    return `# Collaborative Workflow Results\n\n${outputs}\n\n---\n\n## Summary\n\nThis solution was created through collaboration between ${workflow.steps.length} specialized agents, each contributing their expertise to deliver a comprehensive result.`;
  }

  public getWorkflowProgress(workflowId: string): {
    currentStep: number;
    totalSteps: number;
    completedAgents: string[];
    nextAgent?: string;
    isComplete: boolean;
  } | null {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return null;
    
    return {
      currentStep: workflow.currentStep,
      totalSteps: workflow.steps.length,
      completedAgents: workflow.steps
        .slice(0, workflow.currentStep)
        .map(step => step.agentType),
      nextAgent: workflow.currentStep < workflow.steps.length 
        ? workflow.steps[workflow.currentStep].agentType 
        : undefined,
      isComplete: workflow.isComplete
    };
  }

  public getFinalOutput(workflowId: string): string | null {
    const workflow = this.activeWorkflows.get(workflowId);
    return workflow?.finalOutput || null;
  }

  public clearWorkflow(workflowId: string): void {
    this.activeWorkflows.delete(workflowId);
  }
}

export const workflowService = new WorkflowService();
export type { WorkflowPlan, WorkflowStep, AgentCollaboration };
