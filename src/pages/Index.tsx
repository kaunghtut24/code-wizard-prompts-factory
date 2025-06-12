import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Bot } from "lucide-react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIConfiguration from '@/components/AIConfiguration';
import DatabaseSettings from '@/components/DatabaseSettings';
import SearchSettings from '@/components/SearchSettings';
import AgentOrchestrator from '@/components/AgentOrchestrator';
import InteractiveChatInterface from '@/components/InteractiveChatInterface';
import ConversationHistory from '@/components/ConversationHistory';

const Index = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);
  const [showAgentOrchestrator, setShowAgentOrchestrator] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [currentAgent, setCurrentAgent] = useState("general");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/auth');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/auth');
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const getAgentName = (agentType: string) => {
    const agentNames: Record<string, string> = {
      general: 'General Chat',
      code: 'Code Generation',
      refactor: 'Code Refactor',
      'bug-fix': 'Bug Fix',
      test: 'Test Generator',
      documentation: 'Documentation',
      'semantic-search': 'Semantic Search',
      github: 'GitHub Agent',
      'mcp-analysis': 'MCP Analysis'
    };
    return agentNames[agentType] || 'General Chat';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">AI Agent Orchestrator</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <InteractiveChatInterface
              activeAgent={currentAgent}
              agentName={getAgentName(currentAgent)}
            />
          </div>

          {/* Side Panel */}
          <div className="w-80 border-l bg-card flex flex-col">
            {showAgentOrchestrator ? (
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Agent Orchestrator</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAgentOrchestrator(false)}
                  >
                    Close
                  </Button>
                </div>
                <AgentOrchestrator 
                  input=""
                  setOutput={() => {}}
                  isProcessing={false}
                  setIsProcessing={() => {}}
                />
              </div>
            ) : (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Agent Selection</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAgentOrchestrator(true)}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      Orchestrator
                    </Button>
                  </div>
                  <Select value={currentAgent} onValueChange={setCurrentAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">💬 General Chat</SelectItem>
                      <SelectItem value="code">💻 Code Generation</SelectItem>
                      <SelectItem value="refactor">🔄 Code Refactor</SelectItem>
                      <SelectItem value="bug-fix">🐛 Bug Fix</SelectItem>
                      <SelectItem value="test">🧪 Test Generator</SelectItem>
                      <SelectItem value="documentation">📚 Documentation</SelectItem>
                      <SelectItem value="semantic-search">🔍 Semantic Search</SelectItem>
                      <SelectItem value="mcp-analysis">🔬 MCP Analysis</SelectItem>
                      <SelectItem value="github">🐙 GitHub Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 overflow-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Conversation History</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConversationHistory(true)}
                      >
                        View All
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Click "View All" to see your conversation history
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Configure your AI agents, search settings, and database connection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            <Tabs defaultValue="ai" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ai">AI Configuration</TabsTrigger>
                <TabsTrigger value="search">Search Settings</TabsTrigger>
                <TabsTrigger value="database">Database Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ai" className="mt-6">
                <AIConfiguration />
              </TabsContent>
              
              <TabsContent value="search" className="mt-6">
                <SearchSettings />
              </TabsContent>
              
              <TabsContent value="database" className="mt-6">
                <DatabaseSettings />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conversation History Dialog */}
      <ConversationHistory
        isOpen={showConversationHistory}
        onClose={() => setShowConversationHistory(false)}
        currentAgent={currentAgent}
      />

      {/* AI Configuration Dialog */}
      <Dialog open={showAIConfig} onOpenChange={setShowAIConfig}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Model Configuration</DialogTitle>
            <DialogDescription>
              Configure your AI model settings and API keys.
            </DialogDescription>
          </DialogHeader>
          <AIConfiguration />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
