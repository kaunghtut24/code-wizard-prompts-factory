import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Code, 
  Bug, 
  RefreshCw, 
  TestTube, 
  FileText, 
  GitBranch, 
  Search,
  Sparkles,
  Zap,
  Brain,
  Settings,
  Database
} from 'lucide-react';
import AgentOrchestrator from '@/components/AgentOrchestrator';
import CodeGenerationAgent from '@/components/agents/CodeGenerationAgent';
import BugFixAgent from '@/components/agents/BugFixAgent';
import RefactorAgent from '@/components/agents/RefactorAgent';
import TestGeneratorAgent from '@/components/agents/TestGeneratorAgent';
import DocumentationAgent from '@/components/agents/DocumentationAgent';
import GitHubAgent from '@/components/agents/GitHubAgent';
import SemanticSearchAgent from '@/components/agents/SemanticSearchAgent';
import MCPAnalysisAgent from '@/components/agents/MCPAnalysisAgent';
import AIConfiguration from '@/components/AIConfiguration';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeAgent, setActiveAgent] = useState('orchestrator');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const { toast } = useToast();

  const agents = [
    {
      id: 'orchestrator',
      name: 'Agent Orchestrator',
      description: 'Intelligent coordinator that routes tasks to specialized agents',
      icon: Brain,
      color: 'bg-purple-500'
    },
    {
      id: 'code-gen',
      name: 'Code Generator',
      description: 'Generates clean, production-ready code from natural language',
      icon: Code,
      color: 'bg-blue-500'
    },
    {
      id: 'bug-fix',
      name: 'Bug Fixer',
      description: 'Analyzes and fixes code issues with precision',
      icon: Bug,
      color: 'bg-red-500'
    },
    {
      id: 'refactor',
      name: 'Refactor Specialist',
      description: 'Optimizes code structure and performance',
      icon: RefreshCw,
      color: 'bg-green-500'
    },
    {
      id: 'test-gen',
      name: 'Test Generator',
      description: 'Creates comprehensive test suites',
      icon: TestTube,
      color: 'bg-yellow-500'
    },
    {
      id: 'docs',
      name: 'Documentation',
      description: 'Generates clear, comprehensive documentation',
      icon: FileText,
      color: 'bg-indigo-500'
    },
    {
      id: 'github',
      name: 'GitHub Assistant',
      description: 'Manages repository operations and collaboration',
      icon: GitBranch,
      color: 'bg-gray-700'
    },
    {
      id: 'search',
      name: 'Semantic Search',
      description: 'Intelligent codebase exploration and analysis',
      icon: Search,
      color: 'bg-orange-500'
    },
    {
      id: 'mcp',
      name: 'MCP Analyzer',
      description: 'Modular codebase analysis and relationship mapping',
      icon: Settings,
      color: 'bg-teal-500'
    }
  ];

  const handleProcess = async () => {
    if (!aiService.isConfigured()) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your AI model settings first.",
        variant: "destructive",
      });
      setShowAIConfig(true);
      return;
    }

    if (!input.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter your request before processing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setOutput('Processing your request...');
    
    try {
      console.log('Starting AI processing with agent:', activeAgent);
      
      const messages = [
        { role: 'user' as const, content: input.trim() }
      ];
      
      const response = await aiService.chat(messages, activeAgent);
      
      if (!response.content) {
        throw new Error('Received empty response from AI service');
      }
      
      setOutput(response.content);
      
      toast({
        title: "Processing Complete",
        description: `Successfully processed with ${agents.find(a => a.id === activeAgent)?.name}`,
      });
      
      console.log('AI processing completed successfully');
      
    } catch (error) {
      console.error('AI Processing Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setOutput(`❌ Error: ${errorMessage}\n\nPlease check your AI configuration and try again.`);
      
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });

      // If it's a configuration issue, suggest opening config
      if (errorMessage.includes('configured') || errorMessage.includes('API key')) {
        setTimeout(() => {
          toast({
            title: "Configuration Needed",
            description: "Click the AI Config button to update your settings.",
          });
        }, 2000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if AI is configured on component mount
  React.useEffect(() => {
    if (!aiService.isConfigured()) {
      console.log('AI service not configured, showing setup reminder');
      setTimeout(() => {
        toast({
          title: "Setup Required",
          description: "Please configure your AI settings to start using the coding assistant.",
        });
      }, 1000);
    }
  }, [toast]);

  const renderActiveAgent = () => {
    const commonProps = { input, setOutput, isProcessing, setIsProcessing };
    
    switch (activeAgent) {
      case 'orchestrator':
        return <AgentOrchestrator {...commonProps} />;
      case 'code-gen':
        return <CodeGenerationAgent {...commonProps} />;
      case 'bug-fix':
        return <BugFixAgent {...commonProps} />;
      case 'refactor':
        return <RefactorAgent {...commonProps} />;
      case 'test-gen':
        return <TestGeneratorAgent {...commonProps} />;
      case 'docs':
        return <DocumentationAgent {...commonProps} />;
      case 'github':
        return <GitHubAgent {...commonProps} />;
      case 'search':
        return <SemanticSearchAgent {...commonProps} />;
      case 'mcp':
        return <MCPAnalysisAgent {...commonProps} />;
      default:
        return <AgentOrchestrator {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Bot className="h-12 w-12 text-blue-600" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CodeCraft AI
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            Professional Automatic Coding Assistant Agent System
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Zap className="h-3 w-3 mr-1" />
              9 Specialized Agents
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Production Ready
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              OpenAI Compatible
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAIConfig(true)}
              className={`bg-white ${!aiService.isConfigured() ? 'border-red-300 text-red-600' : ''}`}
            >
              <Settings className="h-4 w-4 mr-2" />
              AI Config {!aiService.isConfigured() && '⚠️'}
            </Button>
          </div>
        </div>

        {/* Agent Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
          {agents.map((agent) => {
            const IconComponent = agent.icon;
            return (
              <Card 
                key={agent.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  activeAgent === agent.id 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveAgent(agent.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${agent.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{agent.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs leading-relaxed">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Input
              </CardTitle>
              <CardDescription>
                Describe your coding task or paste your code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your request, code snippet, or question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <Button 
                onClick={handleProcess} 
                className="w-full" 
                disabled={!input.trim() || isProcessing || !aiService.isConfigured()}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Process with {agents.find(a => a.id === activeAgent)?.name}
                  </>
                )}
              </Button>
              {!aiService.isConfigured() && (
                <p className="text-sm text-red-600 text-center">
                  ⚠️ Please configure AI settings first
                </p>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Output
              </CardTitle>
              <CardDescription>
                Agent response and generated code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] font-mono text-sm whitespace-pre-wrap">
                {output || 'Output will appear here...'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Agent Component */}
        <div className="mt-8">
          {renderActiveAgent()}
        </div>

        {/* Features Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-6">Agent Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🧠 Intelligent Routing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatically selects the best agent for your specific coding task
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚡ Multi-Framework</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Compatible with CrewAI, LangGraph, and custom agent flows
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔗 Integration Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Works with OpenAI, Claude, Gemini, and other AI models
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Configuration Modal */}
      <AIConfiguration 
        isOpen={showAIConfig} 
        onClose={() => setShowAIConfig(false)} 
      />
    </div>
  );
};

export default Index;
