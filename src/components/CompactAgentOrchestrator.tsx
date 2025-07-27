import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Zap, 
  Target, 
  CheckCircle, 
  Edit, 
  Users, 
  Workflow,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PromptEditor from '@/components/PromptEditor';
import { promptService } from '@/services/promptService';
import { workflowService } from '@/services/workflowService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CompactAgentOrchestratorProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CompactAgentOrchestrator: React.FC<CompactAgentOrchestratorProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-base">Agent Orchestrator</CardTitle>
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
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* How it works - Always visible */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Target className="h-6 w-6 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-medium text-xs">Analyze</h4>
                <p className="text-xs text-muted-foreground truncate">Parse intent</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Workflow className="h-6 w-6 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-medium text-xs">Route</h4>
                <p className="text-xs text-muted-foreground truncate">To agent(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="font-medium text-xs">Deliver</h4>
                <p className="text-xs text-muted-foreground truncate">Results</p>
              </div>
            </div>
          </div>

          {/* Task Analysis */}
          {input && recommendation && (
            <div className="bg-white p-3 rounded border">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4" />
                Task Analysis
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Complexity:</span>
                  <Badge variant={recommendation.complexity === 'complex' ? 'destructive' : recommendation.complexity === 'moderate' ? 'default' : 'secondary'} className="text-xs">
                    {recommendation.complexity}
                  </Badge>
                </div>
                
                {recommendation.complexity === 'simple' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Agent:</span>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      {recommendation.name}
                    </Badge>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">Workflow:</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-700 text-xs">
                        <Workflow className="h-3 w-3 mr-1" />
                        {recommendation.collaborativeAgents.length} Agents
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.collaborativeAgents.slice(0, 3).map((agent: string) => (
                        <Badge key={agent} variant="outline" className="text-xs">
                          {agent.charAt(0).toUpperCase() + agent.slice(1)}
                        </Badge>
                      ))}
                      {recommendation.collaborativeAgents.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{recommendation.collaborativeAgents.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expandable section */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full flex items-center justify-between">
                <span className="text-xs">Available Agents & Capabilities</span>
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Available Agents */}
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Specialized Agents
                </h4>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    'Code Generator', 'Bug Fixer', 'Refactor Specialist',
                    'Test Generator', 'Documentation Agent', 'Security Auditor',
                    'Performance Optimizer', 'Architecture Reviewer', 'GitHub Assistant',
                    'Semantic Search', 'MCP Analyzer'
                  ].map((agent) => (
                    <Badge key={agent} variant="outline" className="text-xs justify-center py-1 whitespace-nowrap">
                      {agent}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* System Capabilities */}
              <div className="bg-gray-50 p-3 rounded border">
                <h4 className="font-medium mb-2 text-sm">System Capabilities</h4>
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div>
                    <div className="font-medium text-blue-600 mb-1">Features:</div>
                    <div className="text-gray-700 space-y-0.5">
                      <div>• Multi-agent workflows</div>
                      <div>• Task complexity analysis</div>
                      <div>• Enhanced markdown rendering</div>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-600 mb-1">Patterns:</div>
                    <div className="text-gray-700 space-y-0.5">
                      <div>• Full-stack development</div>
                      <div>• Bug investigation</div>
                      <div>• Code review</div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
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

export default CompactAgentOrchestrator;