
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Network, Layers, Cpu, FileText } from 'lucide-react';

interface MCPAnalysisAgentProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const MCPAnalysisAgent: React.FC<MCPAnalysisAgentProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  return (
    <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-teal-600" />
          MCP Analysis Agent
        </CardTitle>
        <CardDescription>
          Modular Codebase Patterns analysis with relationship mapping and architecture insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Network className="h-6 w-6 text-blue-500" />
            <div>
              <h4 className="font-semibold text-sm">Dependencies</h4>
              <p className="text-xs text-muted-foreground">Module relationships</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Layers className="h-6 w-6 text-green-500" />
            <div>
              <h4 className="font-semibold text-sm">Architecture</h4>
              <p className="text-xs text-muted-foreground">System structure</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Cpu className="h-6 w-6 text-purple-500" />
            <div>
              <h4 className="font-semibold text-sm">Patterns</h4>
              <p className="text-xs text-muted-foreground">Design analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Settings className="h-6 w-6 text-orange-500" />
            <div>
              <h4 className="font-semibold text-sm">Coupling</h4>
              <p className="text-xs text-muted-foreground">Decoupling advice</p>
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
            <div className="text-green-600"># MCP Code Analysis Agent System Prompt</div>
            <div className="mt-2">
              <div className="text-blue-600">You are an MCP Code Analysis Agent.</div>
              <br />
              <div className="text-blue-600">Context:</div>
              <div>The MCP (Model Context Protocol) server has provided a modular chunked view of a codebase with relationship mappings and dependency graphs.</div>
              <br />
              <div className="text-blue-600">Instructions:</div>
              <div>1. **Codebase Structure Analysis:**</div>
              <div>   - Parse the modular code map and relationships</div>
              <div>   - Identify architectural patterns and design principles</div>
              <div>   - Map dependencies between modules and components</div>
              <div>   - Analyze coupling and cohesion metrics</div>
              <br />
              <div>2. **Smart Code Retrieval:**</div>
              <div>   - When answering questions, retrieve only relevant chunks</div>
              <div>   - Use relationship mappings to find connected components</div>
              <div>   - Consider transitive dependencies and side effects</div>
              <div>   - Prioritize code sections based on query relevance</div>
              <br />
              <div>3. **Modification Impact Analysis:**</div>
              <div>   - Before suggesting changes, analyze module relationships</div>
              <div>   - Identify all affected components and dependencies</div>
              <div>   - Consider ripple effects and breaking changes</div>
              <div>   - Suggest refactoring strategies for tightly coupled code</div>
              <br />
              <div>4. **Architecture Recommendations:**</div>
              <div>   - Identify anti-patterns and code smells</div>
              <div>   - Suggest decoupling strategies</div>
              <div>   - Recommend modularization improvements</div>
              <div>   - Propose design pattern applications</div>
              <br />
              <div className="text-blue-600">Output format:</div>
              <div>**ARCHITECTURE OVERVIEW:**</div>
              <div>- High-level system structure</div>
              <div>- Key architectural patterns identified</div>
              <div>- Module organization assessment</div>
              <br />
              <div>**DEPENDENCY ANALYSIS:**</div>
              <div>- Module dependency graph</div>
              <div>- Coupling strength assessment</div>
              <div>- Circular dependency detection</div>
              <br />
              <div>**CODE STRUCTURE:**</div>
              <div>```language</div>
              <div>// Relevant code chunks with context</div>
              <div>// Module: path/to/module</div>
              <div>// Dependencies: [list of dependent modules]</div>
              <div>```</div>
              <br />
              <div>**AFFECTED MODULES:**</div>
              <div>- List of modules impacted by changes</div>
              <div>- Relationship types (direct, transitive, circular)</div>
              <div>- Risk assessment for modifications</div>
              <br />
              <div>**IMPROVEMENT RECOMMENDATIONS:**</div>
              <div>- Decoupling strategies</div>
              <div>- Refactoring opportunities</div>
              <div>- Design pattern applications</div>
              <div>- Testing strategy for changes</div>
            </div>
          </div>
        </div>

        {/* Analysis Types */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Analysis Categories</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <h5 className="font-medium text-sm">Structural Analysis</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Module organization, layering, component boundaries
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
              <h5 className="font-medium text-sm">Dependency Mapping</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Import relationships, circular dependencies, coupling analysis
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
              <h5 className="font-medium text-sm">Pattern Detection</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Design patterns, anti-patterns, architectural styles
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
              <h5 className="font-medium text-sm">Impact Assessment</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Change propagation, breaking changes, refactoring impact
              </p>
            </div>
          </div>
        </div>

        {/* MCP Features */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">MCP Protocol Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline" className="justify-center">Code Chunks</Badge>
            <Badge variant="outline" className="justify-center">Relationships</Badge>
            <Badge variant="outline" className="justify-center">Dependency Graph</Badge>
            <Badge variant="outline" className="justify-center">Context Mapping</Badge>
            <Badge variant="outline" className="justify-center">Module Indexing</Badge>
            <Badge variant="outline" className="justify-center">Change Tracking</Badge>
            <Badge variant="outline" className="justify-center">Pattern Analysis</Badge>
            <Badge variant="outline" className="justify-center">Impact Scoring</Badge>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Code Quality Metrics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Coupling Level</span>
                <Badge variant="outline">Low ✓</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cohesion Score</span>
                <Badge variant="outline">High ✓</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Circular Dependencies</span>
                <Badge variant="outline">None ✓</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Architecture Patterns</span>
                <Badge variant="outline">Clean ✓</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MCPAnalysisAgent;
