
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Book, Code, Users } from 'lucide-react';

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
  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-indigo-600" />
          Documentation Agent
        </CardTitle>
        <CardDescription>
          Comprehensive documentation generation with examples and best practices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Documentation Types */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Code className="h-6 w-6 text-blue-500" />
            <div>
              <h4 className="font-semibold text-sm">Code Docs</h4>
              <p className="text-xs text-muted-foreground">Inline comments</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Book className="h-6 w-6 text-green-500" />
            <div>
              <h4 className="font-semibold text-sm">API Docs</h4>
              <p className="text-xs text-muted-foreground">Endpoint guides</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <Users className="h-6 w-6 text-purple-500" />
            <div>
              <h4 className="font-semibold text-sm">User Guides</h4>
              <p className="text-xs text-muted-foreground">How-to tutorials</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <FileText className="h-6 w-6 text-orange-500" />
            <div>
              <h4 className="font-semibold text-sm">README</h4>
              <p className="text-xs text-muted-foreground">Project overview</p>
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
            <div className="text-green-600"># Documentation Assistant Agent System Prompt</div>
            <div className="mt-2">
              <div className="text-blue-600">You are a Documentation Assistant Agent.</div>
              <br />
              <div className="text-blue-600">Context:</div>
              <div>The user provides code and asks you to document it comprehensively.</div>
              <br />
              <div className="text-blue-600">Instructions:</div>
              <div>1. Analyze code structure, purpose, and functionality</div>
              <div>2. Generate appropriate documentation based on context:</div>
              <div>   - Inline docstrings for functions and classes</div>
              <div>   - README.md for projects</div>
              <div>   - API documentation for web services</div>
              <div>   - User guides for applications</div>
              <div>3. Include practical usage examples</div>
              <div>4. Document parameters, return values, and exceptions</div>
              <div>5. Add installation and setup instructions</div>
              <div>6. Ensure technical accuracy and clarity</div>
              <div>7. Follow documentation standards for the language/framework</div>
              <div>8. Include troubleshooting and FAQ sections where relevant</div>
              <br />
              <div className="text-blue-600">Output format:</div>
              <div>**INLINE DOCUMENTATION:**</div>
              <div>```language</div>
              <div>// Code with comprehensive docstrings and comments</div>
              <div>```</div>
              <br />
              <div>**EXTERNAL DOCUMENTATION:**</div>
              <div>```markdown</div>
              <div># Project/Module Documentation</div>
              <div>## Overview, Installation, Usage, Examples</div>
              <div>```</div>
              <br />
              <div>**API REFERENCE:**</div>
              <div>- Detailed method descriptions</div>
              <div>- Parameter specifications</div>
              <div>- Return value formats</div>
              <div>- Error codes and handling</div>
              <br />
              <div>**EXAMPLES:**</div>
              <div>- Basic usage scenarios</div>
              <div>- Advanced use cases</div>
              <div>- Integration examples</div>
              <div>- Best practices</div>
            </div>
          </div>
        </div>

        {/* Documentation Standards */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Documentation Standards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <h5 className="font-medium text-sm">Python (Sphinx)</h5>
              <p className="text-xs text-muted-foreground mt-1">
                """Docstring with Args, Returns, Raises sections"""
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
              <h5 className="font-medium text-sm">JavaScript (JSDoc)</h5>
              <p className="text-xs text-muted-foreground mt-1">
                /** @param {type} name - Description */
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-400">
              <h5 className="font-medium text-sm">Java (Javadoc)</h5>
              <p className="text-xs text-muted-foreground mt-1">
                /** @param name Description @return Description */
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
              <h5 className="font-medium text-sm">C# (XML)</h5>
              <p className="text-xs text-muted-foreground mt-1">
                /// &lt;summary&gt;Description&lt;/summary&gt;
              </p>
            </div>
          </div>
        </div>

        {/* Documentation Tools */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Documentation Tools</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Badge variant="outline" className="justify-center">Sphinx</Badge>
            <Badge variant="outline" className="justify-center">JSDoc</Badge>
            <Badge variant="outline" className="justify-center">Javadoc</Badge>
            <Badge variant="outline" className="justify-center">Doxygen</Badge>
            <Badge variant="outline" className="justify-center">GitBook</Badge>
            <Badge variant="outline" className="justify-center">Swagger</Badge>
            <Badge variant="outline" className="justify-center">Docusaurus</Badge>
            <Badge variant="outline" className="justify-center">MkDocs</Badge>
          </div>
        </div>

        {/* Quality Checklist */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Documentation Quality Checklist</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Clear, concise descriptions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Comprehensive parameter documentation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Working code examples</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>Error handling documentation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentationAgent;
