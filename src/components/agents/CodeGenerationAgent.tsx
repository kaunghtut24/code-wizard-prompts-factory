import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Code, Cpu, FileText, Zap, Edit } from 'lucide-react';
import PromptEditor from '@/components/PromptEditor';
import { promptService } from '@/services/promptService';

interface CodeGenerationAgentProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const CodeGenerationAgent: React.FC<CodeGenerationAgentProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-blue-600" />
              <CardTitle>Code Generation Agent</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={promptService.hasCustomPrompt('code-gen') ? "default" : "secondary"} className="text-xs">
                {promptService.hasCustomPrompt('code-gen') ? "Custom" : "Default"}
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
            Generates clean, production-ready code from natural language descriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Capabilities */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Cpu className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Multi-Language</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium">Documentation</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-medium">Best Practices</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Code className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium">Framework Ready</span>
            </div>
          </div>

          {/* System Prompt */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              System Prompt Template
            </h4>
            <div className="text-xs font-mono bg-white p-3 rounded border max-h-60 overflow-y-auto">
              <div className="text-green-600"># Code Generation Agent System Prompt</div>
              <div className="mt-2">
                <div className="text-blue-600">You are a helpful Code Generation Agent.</div>
                <br />
                <div className="text-blue-600">Context:</div>
                <div>The user provides a prompt describing a desired feature or function.</div>
                <br />
                <div className="text-blue-600">Instructions:</div>
                <div>1. Analyze the prompt for requirements and constraints</div>
                <div>2. Decide the best language and framework based on context</div>
                <div>3. Generate clean, commented, production-ready code</div>
                <div>4. Include error handling and edge cases where appropriate</div>
                <div>5. Follow language-specific best practices and conventions</div>
                <div>6. If dependencies are required, list installation steps</div>
                <div>7. Explain integration with larger applications if relevant</div>
                <br />
                <div className="text-blue-600">Output format:</div>
                <div>- Code block with proper syntax highlighting</div>
                <div>- Brief explanation of the solution approach</div>
                <div>- Installation/setup instructions if needed</div>
                <div>- Usage examples and integration notes</div>
                <br />
                <div className="text-blue-600">Quality Standards:</div>
                <div>- Use meaningful variable and function names</div>
                <div>- Include inline comments for complex logic</div>
                <div>- Follow SOLID principles where applicable</div>
                <div>- Ensure code is testable and maintainable</div>
              </div>
            </div>
          </div>

          {/* Example Use Cases */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Example Use Cases</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <h5 className="font-medium text-sm">API Development</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  "Create a REST API endpoint for user authentication"
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <h5 className="font-medium text-sm">Data Processing</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  "Build a function to parse CSV files and validate data"
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                <h5 className="font-medium text-sm">UI Components</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  "Create a reusable modal component in React"
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <h5 className="font-medium text-sm">Algorithms</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  "Implement a binary search tree with balancing"
                </p>
              </div>
            </div>
          </div>

          {/* Framework Compatibility */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">CrewAI Compatible</Badge>
            <Badge variant="outline">LangGraph Ready</Badge>
            <Badge variant="outline">OpenAI API</Badge>
            <Badge variant="outline">Claude Integration</Badge>
            <Badge variant="outline">Custom Agents</Badge>
          </div>
        </CardContent>
      </Card>

      <PromptEditor
        isOpen={showPromptEditor}
        onClose={() => setShowPromptEditor(false)}
        agentType="code-gen"
        agentName="Code Generation Agent"
      />
    </>
  );
};

export default CodeGenerationAgent;
