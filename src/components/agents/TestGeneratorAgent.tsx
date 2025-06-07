
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, CheckCircle, AlertTriangle, Target, FileText } from 'lucide-react';

interface TestGeneratorAgentProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const TestGeneratorAgent: React.FC<TestGeneratorAgentProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-6 w-6 text-yellow-600" />
          Test Generator Agent
        </CardTitle>
        <CardDescription>
          Comprehensive test suite generation with edge cases and best practices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <h4 className="font-semibold text-sm">Unit Tests</h4>
              <p className="text-xs text-muted-foreground">Individual functions</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <Target className="h-8 w-8 text-blue-500" />
            <div>
              <h4 className="font-semibold text-sm">Integration</h4>
              <p className="text-xs text-muted-foreground">Component interaction</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div>
              <h4 className="font-semibold text-sm">Edge Cases</h4>
              <p className="text-xs text-muted-foreground">Boundary conditions</p>
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
            <div className="text-green-600"># Test Generator Agent System Prompt</div>
            <div className="mt-2">
              <div className="text-blue-600">You are a Test Generator Agent.</div>
              <br />
              <div className="text-blue-600">Context:</div>
              <div>The user provides code (function, class, or module) that needs comprehensive testing.</div>
              <br />
              <div className="text-blue-600">Instructions:</div>
              <div>1. Analyze the code structure and identify testable components</div>
              <div>2. Determine appropriate test framework (Jest, pytest, JUnit, etc.)</div>
              <div>3. Generate comprehensive test cases covering:</div>
              <div>   - Happy path scenarios</div>
              <div>   - Edge cases and boundary conditions</div>
              <div>   - Error conditions and exception handling</div>
              <div>   - Input validation and type checking</div>
              <div>   - Performance and load testing where relevant</div>
              <div>4. Include setup and teardown procedures</div>
              <div>5. Add descriptive test names and comments</div>
              <div>6. Follow testing best practices and naming conventions</div>
              <div>7. Include mocking for external dependencies</div>
              <br />
              <div className="text-blue-600">Output format:</div>
              <div>**TEST STRATEGY:**</div>
              <div>- Overview of testing approach</div>
              <div>- Test framework and tools used</div>
              <div>- Coverage goals and metrics</div>
              <br />
              <div>**TEST SUITE:**</div>
              <div>```language</div>
              <div>// Complete test file with all test cases</div>
              <div>// Including setup, teardown, and utility functions</div>
              <div>```</div>
              <br />
              <div>**TEST CASES EXPLAINED:**</div>
              <div>- Description of each test scenario</div>
              <div>- Expected outcomes and assertions</div>
              <div>- Edge cases covered</div>
              <br />
              <div>**EXECUTION INSTRUCTIONS:**</div>
              <div>- How to run the tests</div>
              <div>- Required dependencies</div>
              <div>- Expected coverage metrics</div>
            </div>
          </div>
        </div>

        {/* Test Categories */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Test Case Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
              <h5 className="font-medium text-sm">Functional Tests</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Valid inputs, expected outputs, business logic
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded border-l-4 border-red-400">
              <h5 className="font-medium text-sm">Error Handling</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Invalid inputs, exceptions, error conditions
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <h5 className="font-medium text-sm">Boundary Testing</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Min/max values, empty inputs, null values
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
              <h5 className="font-medium text-sm">Performance Tests</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Load testing, timeout handling, memory usage
              </p>
            </div>
          </div>
        </div>

        {/* Testing Frameworks */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Supported Frameworks</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline" className="justify-center">Jest</Badge>
            <Badge variant="outline" className="justify-center">PyTest</Badge>
            <Badge variant="outline" className="justify-center">JUnit</Badge>
            <Badge variant="outline" className="justify-center">Mocha</Badge>
            <Badge variant="outline" className="justify-center">Cypress</Badge>
            <Badge variant="outline" className="justify-center">Selenium</Badge>
            <Badge variant="outline" className="justify-center">PHPUnit</Badge>
            <Badge variant="outline" className="justify-center">RSpec</Badge>
          </div>
        </div>

        {/* Coverage Metrics */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Coverage Goals</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">90%+</div>
              <div className="text-xs text-muted-foreground">Line Coverage</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">85%+</div>
              <div className="text-xs text-muted-foreground">Branch Coverage</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestGeneratorAgent;
