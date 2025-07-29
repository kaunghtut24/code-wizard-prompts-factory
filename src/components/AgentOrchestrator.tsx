
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Zap, Target, CheckCircle, Edit, Users, Workflow } from 'lucide-react';
import PromptEditor from '@/components/PromptEditor';
import { promptService } from '@/services/promptService';
import { workflowService } from '@/services/workflowService';

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
  const [showPromptEditor, setShowPromptEditor] = useState(false);

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
    if (lowercaseInput.includes('security') || lowercaseInput.includes('vulnerability')) {
      return 'security';
    }
    if (lowercaseInput.includes('performance') || lowercaseInput.includes('speed')) {
      return 'performance';
    }
    if (lowercaseInput.includes('architecture') || lowercaseInput.includes('design')) {
      return 'architecture';
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
    
    const taskAnalysis = workflowService.analyzeTaskComplexity(input);
    const recommendedAgent = analyzeTask(input);
    
    const agentNames = {
      'bug-fix': 'Bug Fixer',
      'test-gen': 'Test Generator', 
      'refactor': 'Refactor Specialist',
      'docs': 'Documentation Agent',
      'security': 'Security Auditor',
      'performance': 'Performance Optimizer',
      'architecture': 'Architecture Reviewer',
      'github': 'GitHub Assistant',
      'search': 'Semantic Search',
      'mcp': 'MCP Analyzer',
      'code-gen': 'Code Generator'
    };

    return {
      agent: recommendedAgent,
      name: agentNames[recommendedAgent as keyof typeof agentNames],
      complexity: taskAnalysis.complexity,
      collaborativeAgents: taskAnalysis.agents,
      suggestedPattern: taskAnalysis.suggestedPattern
    };
  };

  const recommendation = getRecommendation();

  return (
    <>
      <Card className="bg-gradient-subtle border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">Agent Orchestrator</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={promptService.hasCustomPrompt('orchestrator') ? "default" : "secondary"} className="text-xs">
                {promptService.hasCustomPrompt('orchestrator') ? "Custom" : "Default"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPromptEditor(true)}
                className="flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Edit Prompt
              </Button>
            </div>
          </div>
          <CardDescription>
            Intelligent task analysis with collaborative multi-agent workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Analyze</h4>
                <p className="text-xs text-muted-foreground">Parse intent & complexity</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Workflow className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Orchestrate</h4>
                <p className="text-xs text-muted-foreground">Route to agent(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-accent/50 transition-colors">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Synthesize</h4>
                <p className="text-xs text-muted-foreground">Combine results</p>
              </div>
            </div>
          </div>

          {/* Available Agents */}
          <div className="bg-card p-4 rounded-lg border border-border">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-primary" />
              Specialized Agents
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                'Code Generator', 'Bug Fixer', 'Refactor Specialist',
                'Test Generator', 'Documentation Agent', 'Security Auditor',
                'Performance Optimizer', 'Architecture Reviewer', 'GitHub Assistant',
                'Semantic Search', 'MCP Analyzer'
              ].map((agent) => (
                <Badge key={agent} variant="outline" className="text-xs justify-center py-2 whitespace-nowrap border-accent/50 hover:bg-accent/10 transition-colors">
                  {agent}
                </Badge>
              ))}
            </div>
          </div>

          {/* Task Analysis */}
          {input && recommendation && (
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Task Analysis & Recommendation
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Complexity:</span>
                  <Badge variant={recommendation.complexity === 'complex' ? 'destructive' : recommendation.complexity === 'moderate' ? 'default' : 'secondary'}>
                    {recommendation.complexity}
                  </Badge>
                </div>
                
                {recommendation.complexity === 'simple' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Primary Agent:</span>
                    <Badge className="bg-purple-100 text-purple-700">
                      {recommendation.name}
                    </Badge>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Collaborative Workflow:</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-700">
                        <Workflow className="h-3 w-3 mr-1" />
                        {recommendation.collaborativeAgents.length} Agents
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.collaborativeAgents.map((agent: string) => (
                        <Badge key={agent} variant="outline" className="text-xs">
                          {agent.charAt(0).toUpperCase() + agent.slice(1)}
                        </Badge>
                      ))}
                    </div>
                    {recommendation.suggestedPattern && (
                      <div className="mt-2 text-xs text-gray-600">
                        Pattern: {recommendation.suggestedPattern.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Capabilities */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">System Capabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-600 mb-2">Core Features:</div>
                <ul className="space-y-1 text-gray-700">
                  <li>• Multi-agent workflows</li>
                  <li>• Task complexity analysis</li>
                  <li>• Agent coordination</li>
                  <li>• Enhanced markdown rendering</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-blue-600 mb-2">Collaboration Patterns:</div>
                <ul className="space-y-1 text-gray-700">
                  <li>• Full-stack development</li>
                  <li>• Bug investigation</li>
                  <li>• Code review</li>
                  <li>• Legacy modernization</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <PromptEditor
        isOpen={showPromptEditor}
        onClose={() => setShowPromptEditor(false)}
        agentType="orchestrator"
        agentName="Agent Orchestrator"
      />
    </>
  );
};

export default AgentOrchestrator;
