import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, MessageSquare, Code, Edit } from 'lucide-react';
import PromptEditor from '@/components/PromptEditor';
import { promptService } from '@/services/promptService';

interface DocumentationAgentProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const DocumentationAgent: React.FC<DocumentationAgentProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              <CardTitle>Documentation Agent</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={promptService.hasCustomPrompt('docs') ? "default" : "secondary"} className="text-xs">
                {promptService.hasCustomPrompt('docs') ? "Custom" : "Default"}
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
            Generates comprehensive, clear documentation for code and projects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Capabilities */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-medium">API Docs</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium">Comments</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Code className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium">Docstrings</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium">README</span>
            </div>
          </div>

          {/* System Prompt */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              System Prompt Template
            </h4>
            <div className="text-xs font-mono bg-white p-3 rounded border max-h-60 overflow-y-auto">
              <div className="text-green-600"># Documentation Agent System Prompt</div>
              <div className="mt-2">
                <div className="text-blue-600">You are a Documentation Assistant Agent.</div>
                <br />
                <div className="text-blue-600">Context:</div>
                <div>The user provides code and asks you to document it.</div>
                <br />
                <div className="text-blue-600">Instructions:</div>
                <div>1. Read and understand the code's purpose and structure</div>
                <div>2. Add docstrings for all functions, classes, and modules</div>
                <div>3. Generate Markdown documentation if asked, with usage examples</div>
                <div>4. Ensure technical accuracy and clarity</div>
                <div>5. Follow language-specific documentation conventions</div>
                <div>6. Include parameter descriptions and return values</div>
                <div>7. Add usage examples where helpful</div>
                <br />
                <div className="text-blue-600">Output format:</div>
                <div>- Updated code with docstrings</div>
                <div>- Markdown block with external documentation (optional)</div>
                <div>- Clear explanations of functionality</div>
                <div>- Integration and usage guidelines</div>
              </div>
            </div>
          </div>

          {/* Example Use Cases */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Example Use Cases</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-indigo-50 rounded border-l-4 border-indigo-400">
                <h5 className="font-medium text-sm">API Documentation</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  "Document this REST API with endpoint descriptions"
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <h5 className="font-medium text-sm">Code Comments</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  "Add inline comments explaining complex algorithms"
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <h5 className="font-medium text-sm">Function Docs</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  "Generate docstrings for all functions in this module"
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                <h5 className="font-medium text-sm">README Files</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  "Create comprehensive README with setup instructions"
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
        agentType="docs"
        agentName="Documentation Agent"
      />
    </>
  );
};

export default DocumentationAgent;
