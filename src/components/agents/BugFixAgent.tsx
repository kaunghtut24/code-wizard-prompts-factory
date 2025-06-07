
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bug, Search, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

interface BugFixAgentProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const BugFixAgent: React.FC<BugFixAgentProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  return (
    <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-6 w-6 text-red-600" />
          Bug Fix Agent
        </CardTitle>
        <CardDescription>
          Precise bug analysis and resolution with detailed explanations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debug Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Search className="h-8 w-8 text-blue-500" />
            <div>
              <h4 className="font-semibold text-sm">Analyze</h4>
              <p className="text-xs text-muted-foreground">Identify root cause</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
            <div>
              <h4 className="font-semibold text-sm">Isolate</h4>
              <p className="text-xs text-muted-foreground">Pinpoint the issue</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h4 className="font-semibold text-sm">Fix</h4>
              <p className="text-xs text-muted-foreground">Implement solution</p>
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
            <div className="text-green-600"># Bug Fix Agent System Prompt</div>
            <div className="mt-2">
              <div className="text-blue-600">You are a precise Bug Fixing Agent.</div>
              <br />
              <div className="text-blue-600">Context:</div>
              <div>The user provides a code snippet and describes a bug, error message, or issue.</div>
              <br />
              <div className="text-blue-600">Instructions:</div>
              <div>1. Carefully read and understand the problem described</div>
              <div>2. Analyze the code structure and logic flow</div>
              <div>3. Identify the exact lines or logic causing the issue</div>
              <div>4. Consider edge cases and potential side effects</div>
              <div>5. Rewrite the faulty code with proper error handling</div>
              <div>6. Explain the fix clearly with reasoning</div>
              <div>7. Suggest preventive measures for similar issues</div>
              <br />
              <div className="text-blue-600">Output format:</div>
              <div>**PROBLEM ANALYSIS:**</div>
              <div>- Description of the root cause</div>
              <div>- Impact assessment</div>
              <br />
              <div>**BEFORE:** Code with issue (annotated)</div>
              <div>```language</div>
              <div>// Original buggy code with comments pointing to issues</div>
              <div>```</div>
              <br />
              <div>**AFTER:** Corrected code</div>
              <div>```language</div>
              <div>// Fixed code with improvements</div>
              <div>```</div>
              <br />
              <div>**EXPLANATION:**</div>
              <div>- What was fixed and why</div>
              <div>- How the solution prevents the issue</div>
              <div>- Any additional improvements made</div>
              <br />
              <div>**PREVENTION:**</div>
              <div>- Best practices to avoid similar bugs</div>
              <div>- Testing recommendations</div>
            </div>
          </div>
        </div>

        {/* Common Bug Types */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Common Bug Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
              <h5 className="font-medium text-sm">Logic Errors</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Incorrect algorithms, wrong conditions, infinite loops
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <h5 className="font-medium text-sm">Runtime Errors</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Null pointers, array bounds, type mismatches
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <h5 className="font-medium text-sm">Memory Issues</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Memory leaks, buffer overflows, dangling pointers
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
              <h5 className="font-medium text-sm">Concurrency Bugs</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Race conditions, deadlocks, synchronization issues
              </p>
            </div>
          </div>
        </div>

        {/* Debugging Tools */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Debugging Techniques</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline" className="justify-center">Stack Traces</Badge>
            <Badge variant="outline" className="justify-center">Breakpoints</Badge>
            <Badge variant="outline" className="justify-center">Logging</Badge>
            <Badge variant="outline" className="justify-center">Unit Tests</Badge>
            <Badge variant="outline" className="justify-center">Static Analysis</Badge>
            <Badge variant="outline" className="justify-center">Code Review</Badge>
            <Badge variant="outline" className="justify-center">Profiling</Badge>
            <Badge variant="outline" className="justify-center">Assertions</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BugFixAgent;
