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
  Database,
  History,
  Globe,
  MessageSquare,
  Copy,
  Check
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
import ConversationHistory from '@/components/ConversationHistory';
import SearchSettings from '@/components/SearchSettings';
import EnhancedMessageDisplay from '@/components/EnhancedMessageDisplay';
import { aiService } from '@/services/aiService';
import { searchService } from '@/services/searchService';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeAgent, setActiveAgent] = useState('orchestrator');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSearchSettings, setShowSearchSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<Array<{
    content: string;
    isUser: boolean;
    agentType?: string;
    timestamp: number;
    searchResults?: any[];
  }>>([]);
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

  const handleCopyOutput = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast({
        title: "Output Copied",
        description: "Output has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy output to clipboard",
        variant: "destructive",
      });
    }
  };

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
    const userMessage = {
      content: input.trim(),
      isUser: true,
      timestamp: Date.now()
    };
    
    // Add user message to conversation
    setConversationMessages(prev => [...prev, userMessage]);
    setOutput('Processing your request...');
    
    try {
      console.log('Starting AI processing with agent:', activeAgent);
      
      let messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
        { role: 'user', content: input.trim() }
      ];
      
      let searchResults: any[] = [];
      let searchQuery = '';
      
      // Check if web search is enabled and needed
      const isSearchEnabled = databaseService.getUserPreference('search_enabled', true);
      if (isSearchEnabled && searchService.isConfigured() && searchService.shouldSearchForQuery(input)) {
        try {
          console.log('Performing web search for query:', input);
          const searchResponse = await searchService.search(input, { maxResults: 5 });
          searchResults = searchResponse.results;
          searchQuery = searchResponse.query;
          
          // Prepend search results to the AI prompt
          const searchContext = searchService.formatSearchResults(searchResponse);
          messages = [
            { 
              role: 'system', 
              content: `You have access to the following web search results. Use them to provide more accurate and up-to-date information:\n\n${searchContext}` 
            },
            { role: 'user', content: input.trim() }
          ];
          
          console.log('Web search completed, results integrated into prompt');
        } catch (searchError) {
          console.error('Web search failed:', searchError);
          // Continue without search results
        }
      }
      
      const response = await aiService.chat(messages, activeAgent);
      
      if (!response.content) {
        throw new Error('Received empty response from AI service');
      }
      
      const aiMessage = {
        content: response.content,
        isUser: false,
        agentType: activeAgent,
        timestamp: Date.now(),
        searchResults: searchResults.length > 0 ? searchResults : undefined
      };
      
      // Add AI response to conversation
      setConversationMessages(prev => [...prev, aiMessage]);
      setOutput(response.content);
      
      // Save conversation to database
      databaseService.saveConversation({
        userInput: input.trim(),
        agentType: activeAgent,
        aiOutput: response.content,
        metadata: {
          hasCodeSnippets: response.content.includes('```'),
          searchResults: searchResults.length > 0 ? searchResults : undefined,
          processingTime: Date.now() - userMessage.timestamp
        }
      });
      
      toast({
        title: "Processing Complete",
        description: `Successfully processed with ${agents.find(a => a.id === activeAgent)?.name}`,
      });
      
      console.log('AI processing completed successfully');
      
    } catch (error) {
      console.error('AI Processing Error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorOutput = `❌ Error: ${errorMessage}\n\nPlease check your AI configuration and try again.`;
      
      const errorAiMessage = {
        content: errorOutput,
        isUser: false,
        agentType: activeAgent,
        timestamp: Date.now()
      };
      
      setConversationMessages(prev => [...prev, errorAiMessage]);
      setOutput(errorOutput);
      
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

  const clearConversation = () => {
    setConversationMessages([]);
    setOutput('');
    setInput('');
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowHistory(true)}
              className="bg-white"
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSearchSettings(true)}
              className={`bg-white ${!searchService.isConfigured() ? 'border-orange-300 text-orange-600' : ''}`}
            >
              <Globe className="h-4 w-4 mr-2" />
              Web Search {!searchService.isConfigured() && '⚠️'}
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

        {/* Main Interface with Tabs */}
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Interface
            </TabsTrigger>
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Conversation View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            {/* Original Interface */}
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
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleProcess} 
                      className="flex-1" 
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
                    <Button 
                      onClick={clearConversation} 
                      variant="outline"
                      disabled={conversationMessages.length === 0}
                    >
                      Clear
                    </Button>
                  </div>
                  {!aiService.isConfigured() && (
                    <p className="text-sm text-red-600 text-center">
                      ⚠️ Please configure AI settings first
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Output Section with Copy Button */}
              <Card className="h-fit">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      <CardTitle>Output</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyOutput}
                      disabled={!output}
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
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
          </TabsContent>

          <TabsContent value="conversation" className="space-y-6">
            {/* Enhanced Conversation View */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <CardTitle>Conversation</CardTitle>
                  </div>
                  <Button 
                    onClick={clearConversation} 
                    variant="outline" 
                    size="sm"
                    disabled={conversationMessages.length === 0}
                  >
                    Clear Conversation
                  </Button>
                </div>
                <CardDescription>
                  Enhanced view with code highlighting and search integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {conversationMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Start a conversation</p>
                      <p className="text-sm">Switch to the Chat Interface tab to begin</p>
                    </div>
                  ) : (
                    conversationMessages.map((message, index) => (
                      <EnhancedMessageDisplay
                        key={index}
                        content={message.content}
                        isUser={message.isUser}
                        agentType={message.agentType}
                        timestamp={message.timestamp}
                        hasSearchResults={!!message.searchResults}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Active Agent Component */}
        <div className="mt-8">
          {renderActiveAgent()}
        </div>

        {/* Features Section */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-6">Agent Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <CardTitle className="text-lg">💾 Persistent Memory</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Stores conversations and learns from your interactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🌐 Web Search</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Integrates real-time web search for up-to-date information
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

      {/* Modals */}
      <AIConfiguration 
        isOpen={showAIConfig} 
        onClose={() => setShowAIConfig(false)} 
      />
      
      <ConversationHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        currentAgent={activeAgent}
      />
      
      <SearchSettings
        isOpen={showSearchSettings}
        onClose={() => setShowSearchSettings(false)}
      />
    </div>
  );
};

export default Index;
