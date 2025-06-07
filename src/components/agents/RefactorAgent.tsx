import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Target, Zap, Shield, FileText, Edit } from 'lucide-react';
import PromptEditor from '@/components/PromptEditor';
import { promptService } from '@/services/promptService';

interface RefactorAgentProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const RefactorAgent: React.FC<RefactorAgentProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-green-600" />
              <CardTitle>Refactor Agent</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={promptService.hasCustomPrompt('refactor') ? "default" : "secondary"} className="text-xs">
                {promptService.hasCustomPrompt('refactor') ? "Custom" : "Default"}
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
            Code optimization specialist for structure, performance, and maintainability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Refactor Goals */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
              <Target className="h-6 w-6 text-blue-500" />
              <div>
                <h4 className="font-semibold text-sm">Clarity</h4>
                <p className="text-xs text-muted-foreground">Readable code</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
              <Zap className="h-6 w-6 text-yellow-500" />
              <div>
                <h4 className="font-semibold text-sm">Performance</h4>
                <p className="text-xs text-muted-foreground">Optimized execution</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
              <Shield className="h-6 w-6 text-purple-500" />
              <div>
                <h4 className="font-semibold text-sm">Maintainability</h4>
                <p className="text-xs text-muted-foreground">Easy to modify</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
              <RefreshCw className="h-6 w-6 text-green-500" />
              <div>
                <h4 className="font-semibold text-sm">Modularity</h4>
                <p className="text-xs text-muted-foreground">Reusable components</p>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              System Prompt Template
            </h4>
            <div className="text-xs font-mono bg-white p-3 rounded border max-h-60 overflow-y-auto">
              <div className="text-green-600"># Refactor Agent System Prompt</div>
              <div className="mt-2">
                <div className="text-blue-600">You are a Refactoring Agent specialized in code optimization.</div>
                <br />
                <div className="text-blue-600">Context:</div>
                <div>The user provides code that works but may not be clean, readable, or efficient.</div>
                <br />
                <div className="text-blue-600">Instructions:</div>
                <div>1. Analyze the code for improvement opportunities:</div>
                <div>   - Code duplication and redundancy</div>
                <div>   - Poor naming conventions</div>
                <div>   - Complex nested structures</div>
                <div>   - Performance bottlenecks</div>
                <div>   - SOLID principle violations</div>
                <div>   - Missing error handling</div>
                <div>2. Refactor without changing core functionality</div>
                <div>3. Apply design patterns where appropriate</div>
                <div>4. Improve variable and function names</div>
                <div>5. Extract reusable functions/classes</div>
                <div>6. Add meaningful comments for complex logic</div>
                <div>7. Follow language-specific best practices</div>
                <br />
                <div className="text-blue-600">Output format:</div>
                <div>**ANALYSIS:**</div>
                <div>- Issues identified in original code</div>
                <div>- Opportunities for improvement</div>
                <br />
                <div>**REFACTORED CODE:**</div>
                <div>```language</div>
                <div>// Improved code with annotations</div>
                <div>```</div>
                <br />
                <div>**IMPROVEMENTS MADE:**</div>
                <div>- Specific changes and their benefits</div>
                <div>- Performance improvements</div>
                <div>- Maintainability enhancements</div>
                <div>- Design pattern applications</div>
                <br />
                <div>**METRICS:**</div>
                <div>- Cyclomatic complexity reduction</div>
                <div>- Lines of code changes</div>
                <div>- Readability score improvement</div>
              </div>
            </div>
          </div>

          {/* Refactoring Patterns */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Common Refactoring Patterns</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <h5 className="font-medium text-sm">Extract Method</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Break large functions into smaller, focused ones
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <h5 className="font-medium text-sm">Extract Class</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Separate concerns into dedicated classes
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
                <h5 className="font-medium text-sm">Replace Magic Numbers</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Use named constants for better readability
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <h5 className="font-medium text-sm">Strategy Pattern</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  Replace conditional logic with polymorphism
                </p>
              </div>
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Quality Improvements</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge variant="outline" className="justify-center">DRY Principle</Badge>
              <Badge variant="outline" className="justify-center">SOLID Design</Badge>
              <Badge variant="outline" className="justify-center">Clean Code</Badge>
              <Badge variant="outline" className="justify-center">Performance</Badge>
              <Badge variant="outline" className="justify-center">Testability</Badge>
              <Badge variant="outline" className="justify-center">Modularity</Badge>
              <Badge variant="outline" className="justify-center">Readability</Badge>
              <Badge variant="outline" className="justify-center">Maintainability</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <PromptEditor
        isOpen={showPromptEditor}
        onClose={() => setShowPromptEditor(false)}
        agentType="refactor"
        agentName="Refactor Agent"
      />
    </>
  );
};

export default RefactorAgent;
