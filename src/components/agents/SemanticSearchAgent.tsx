
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Brain, Target, Database, FileText } from 'lucide-react';

interface SemanticSearchAgentProps {
  input: string;
  setOutput: (output: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const SemanticSearchAgent: React.FC<SemanticSearchAgentProps> = ({ 
  input, 
  setOutput, 
  isProcessing, 
  setIsProcessing 
}) => {
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-6 w-6 text-orange-600" />
          Semantic Search Agent
        </CardTitle>
        <CardDescription>
          Intelligent codebase exploration using natural language queries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Brain className="h-6 w-6 text-purple-500" />
            <div>
              <h4 className="font-semibold text-sm">AI Understanding</h4>
              <p className="text-xs text-muted-foreground">Natural language</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Target className="h-6 w-6 text-blue-500" />
            <div>
              <h4 className="font-semibold text-sm">Precise Results</h4>
              <p className="text-xs text-muted-foreground">Context-aware</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Database className="h-6 w-6 text-green-500" />
            <div>
              <h4 className="font-semibold text-sm">Vector Search</h4>
              <p className="text-xs text-muted-foreground">Semantic similarity</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <FileText className="h-6 w-6 text-orange-500" />
            <div>
              <h4 className="font-semibold text-sm">Code Context</h4>
              <p className="text-xs text-muted-foreground">Full understanding</p>
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
            <div className="text-green-600"># Semantic Search Agent System Prompt</div>
            <div className="mt-2">
              <div className="text-blue-600">You are a Codebase Search Agent.</div>
              <br />
              <div className="text-blue-600">Context:</div>
              <div>The user asks a natural language question about a large codebase that has been indexed with semantic embeddings.</div>
              <br />
              <div className="text-blue-600">Instructions:</div>
              <div>1. **Query Processing:**</div>
              <div>   - Parse the user's natural language question</div>
              <div>   - Extract key concepts, entities, and intent</div>
              <div>   - Convert to semantic vector representation</div>
              <div>   - Generate keyword alternatives and synonyms</div>
              <br />
              <div>2. **Search Execution:**</div>
              <div>   - Query the vector database/embeddings index</div>
              <div>   - Search across code comments, function names, and documentation</div>
              <div>   - Rank results by semantic similarity and relevance</div>
              <div>   - Filter by file types, modules, or namespaces if specified</div>
              <br />
              <div>3. **Result Analysis:**</div>
              <div>   - Analyze retrieved code chunks for relevance</div>
              <div>   - Understand code context and relationships</div>
              <div>   - Identify the most pertinent information</div>
              <div>   - Cross-reference with related code sections</div>
              <br />
              <div>4. **Response Generation:**</div>
              <div>   - Synthesize findings into a clear answer</div>
              <div>   - Include relevant code snippets with context</div>
              <div>   - Provide file paths and line numbers</div>
              <div>   - Suggest related functionality or patterns</div>
              <br />
              <div className="text-blue-600">Output format:</div>
              <div>**SEARCH SUMMARY:**</div>
              <div>- Direct answer to the user's question</div>
              <div>- Key findings and insights</div>
              <br />
              <div>**RELEVANT CODE:**</div>
              <div>```language</div>
              <div>// Code snippet with context</div>
              <div>// File: path/to/file.ext:line_number</div>
              <div>```</div>
              <br />
              <div>**LOCATIONS:**</div>
              <div>- File paths and line references</div>
              <div>- Function/class names involved</div>
              <div>- Module or package information</div>
              <br />
              <div>**RELATED FINDINGS:**</div>
              <div>- Similar patterns or implementations</div>
              <div>- Dependencies and relationships</div>
              <div>- Usage examples across the codebase</div>
            </div>
          </div>
        </div>

        {/* Search Query Examples */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Example Search Queries</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <h5 className="font-medium text-sm">"How is user authentication handled?"</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Finds auth functions, middleware, login flows, and security implementations
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
              <h5 className="font-medium text-sm">"Show me error handling patterns"</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Locates try-catch blocks, error classes, exception handling strategies
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
              <h5 className="font-medium text-sm">"Where is the payment processing logic?"</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Identifies payment gateways, transaction handling, billing components
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
              <h5 className="font-medium text-sm">"Find all database queries for users"</h5>
              <p className="text-xs text-muted-foreground mt-1">
                Discovers SQL queries, ORM operations, user data access patterns
              </p>
            </div>
          </div>
        </div>

        {/* Search Technologies */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Search Technologies</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline" className="justify-center">Vector DB</Badge>
            <Badge variant="outline" className="justify-center">Embeddings</Badge>
            <Badge variant="outline" className="justify-center">Elasticsearch</Badge>
            <Badge variant="outline" className="justify-center">Pinecone</Badge>
            <Badge variant="outline" className="justify-center">Chroma</Badge>
            <Badge variant="outline" className="justify-center">FAISS</Badge>
            <Badge variant="outline" className="justify-center">Weaviate</Badge>
            <Badge variant="outline" className="justify-center">Qdrant</Badge>
          </div>
        </div>

        {/* Search Features */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Advanced Search Features</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Multi-language code understanding</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Cross-reference dependency tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Semantic similarity ranking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Context-aware result filtering</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemanticSearchAgent;
