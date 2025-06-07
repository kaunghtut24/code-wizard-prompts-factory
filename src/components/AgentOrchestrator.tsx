
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, CheckCircle } from 'lucide-react';

interface AgentOrchestratorProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const AgentOrchestrator: React.FC<AgentOrchestratorProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  const analyzeTask = (userInput: string) => {
    const lowercaseInput = userInput.toLowerCase();
    
    if (lowercaseInput.includes('bug') || lowercaseInput.includes('error') || lowercaseInput.includes('fix')) {
      return 'bug-fix';
    }
    if (lowercaseInput.includes('test') || lowercaseInput.includes('unit test')) {
      return 'test-gen';
    }
    if (lowercaseInput.includes('refactor') || lowercaseInput.includes('optimize')) {
      return 'refactor';
    }
    if (lowercaseInput.includes('document') || lowercaseInput.includes('comment')) {
      return 'docs';
    }
    if (lowercaseInput.includes('github') || lowercaseInput.includes('commit') || lowercaseInput.includes('pull request')) {
      return 'github';
    }
    if (lowercaseInput.includes('search') || lowercaseInput.includes('find')) {
      return 'search';
    }
    if (lowercaseInput.includes('analyze') || lowercaseInput.includes('structure')) {
      return 'mcp';
    }
    return 'code-gen';
  };

  const getRecommendation = () => {
    if (!input) return null;
    
    const recommendedAgent = analyzeTask(input);
    const agentNames = {
      'bug-fix': 'Bug Fixer',
      'test-gen': 'Test Generator', 
      'refactor': 'Refactor Specialist',
      'docs': 'Documentation Agent',
      'github': 'GitHub Assistant',
      'search': 'Semantic Search',
      'mcp': 'MCP Analyzer',
      'code-gen': 'Code Generator'
    };

    return {
      agent: recommendedAgent,
      name: agentNames[recommendedAgent as keyof typeof agentNames]
    };
  };

  const recommendation = getRecommendation();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Agent Orchestrator
        </CardTitle>
        <CardDescription>
          Intelligent task analysis and agent recommendation system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Target className="h-8 w-8 text-blue-500" />
            <div>
              <h4 className="font-semibold text-sm">Analyze</h4>
              <p className="text-xs text-muted-foreground">Parse user intent</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <h4 className="font-semibold text-sm">Route</h4>
              <p className="text-xs text-muted-foreground">Select best agent</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h4 className="font-semibold text-sm">Execute</h4>
              <p className="text-xs text-muted-foreground">Deliver results</p>
            </div>
          </div>
        </div>

        {/* Task Analysis */}
        {input && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Task Analysis
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Input Type:</span>
                <Badge variant="outline">
                  {input.includes('```') ? 'Code Snippet' : 'Natural Language'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Complexity:</span>
                <Badge variant="outline">
                  {input.length > 200 ? 'High' : input.length > 50 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              {recommendation && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Recommended Agent:</span>
                  <Badge className="bg-purple-100 text-purple-700">
                    {recommendation.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* System Prompt Template */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-2">System Prompt Template</h4>
          <div className="text-xs font-mono bg-white p-3 rounded border overflow-x-auto">
            <div className="text-green-600"># Agent Orchestrator System Prompt</div>
            <div className="mt-2">
              <div className="text-blue-600">Role:</div>
              <div>You are an intelligent Agent Orchestrator that analyzes user requests and routes them to the most appropriate specialized coding agent.</div>
              <br />
              <div className="text-blue-600">Context:</div>
              <div>The user has submitted a coding-related task that needs to be processed by one of 8 specialized agents.</div>
              <br />
              <div className="text-blue-600">Instructions:</div>
              <div>1. Analyze the user's input for keywords, intent, and complexity</div>
              <div>2. Determine which specialized agent is best suited for the task</div>
              <div>3. Route the request with appropriate context and formatting</div>
              <div>4. Ensure the selected agent receives all necessary information</div>
              <br />
              <div className="text-blue-600">Output format:</div>
              <div>- Selected agent name and reasoning</div>
              <div>- Formatted request for the target agent</div>
              <div>- Any additional context or constraints</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentOrchestrator;
