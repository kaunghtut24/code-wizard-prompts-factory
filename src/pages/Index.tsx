
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Bot } from "lucide-react";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";
import WelcomeGuide from '@/components/WelcomeGuide';
import DashboardStats from '@/components/DashboardStats';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import AIConfiguration from '@/components/AIConfiguration';
import DatabaseSettings from '@/components/DatabaseSettings';
import SearchSettings from '@/components/SearchSettings';
import CompactAgentOrchestrator from '@/components/CompactAgentOrchestrator';
import InteractiveChatInterface from '@/components/InteractiveChatInterface';
import ConversationHistory from '@/components/ConversationHistory';
import ConversationHistoryItem from '@/components/ConversationHistoryItem';
import { databaseService } from '@/services/databaseService';

const Index = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showAgentOrchestrator, setShowAgentOrchestrator] = useState(false);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [currentAgent, setCurrentAgent] = useState("general");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (!user) {
        navigate('/auth');
      } else {
        // Check if this is a first-time user
        const hasSeenWelcome = localStorage.getItem('codecraft_welcome_seen');
        if (!hasSeenWelcome) {
          setShowWelcome(true);
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    loadRecentConversations();
  }, [currentAgent]);

  const loadRecentConversations = async () => {
    try {
      const conversations = await databaseService.getConversationsByAgent(currentAgent);
      setRecentConversations(conversations.slice(0, 5)); // Show only 5 most recent
    } catch (error) {
      console.error('Error loading recent conversations:', error);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate('/auth');
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowConversationHistory(false);
  };

  const handleConversationDelete = async (conversationId: string) => {
    try {
      await databaseService.deleteConversation(conversationId);
      await loadRecentConversations(); // Refresh the list
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
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

  const handleNewConversation = () => {
    setSelectedConversationId(null);
    loadRecentConversations(); // Refresh the list
  };

  const handleWelcomeComplete = () => {
    localStorage.setItem('codecraft_welcome_seen', 'true');
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomeGuide onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Fixed Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm px-6 py-4 flex-shrink-0 shadow-sm z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">AI Agent Orchestrator</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(true)}
              className="bg-background hover:bg-accent"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              className="bg-background hover:bg-accent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 flex-shrink-0">
            <DashboardStats 
              currentAgent={currentAgent}
              recentConversations={recentConversations}
            />
          </div>
          <div className="flex-1 px-6 pb-6 overflow-hidden">
            <InteractiveChatInterface
              activeAgent={currentAgent}
              agentName={getAgentName(currentAgent)}
            />
          </div>
        </div>

        {/* Fixed Side Panel with Scrollable Content */}
        <div className="w-80 border-l bg-background/95 backdrop-blur-sm border-border flex flex-col flex-shrink-0 shadow-lg">
          {showAgentOrchestrator ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 flex-shrink-0">
                <h3 className="font-medium text-foreground">Agent Orchestrator</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAgentOrchestrator(false)}
                >
                  Close
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3">
                  <CompactAgentOrchestrator 
                    input=""
                    setOutput={() => {}}
                    isProcessing={false}
                    setIsProcessing={() => {}}
                  />
                </div>
              </ScrollArea>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border bg-background/50 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-foreground">Agent Selection</h3>
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

              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 border-b border-border bg-background/50 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">Recent Conversations</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConversationHistory(true)}
                    >
                      View All
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2">
                    {recentConversations.length > 0 ? (
                      recentConversations.map((conversation) => (
                        <ConversationHistoryItem
                          key={conversation.id}
                          conversation={conversation}
                          onSelect={handleConversationSelect}
                          onDelete={handleConversationDelete}
                          isSelected={selectedConversationId === conversation.id}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No conversations yet for this agent
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0 bg-card border-border">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
            <DialogDescription>
              Configure your AI agents, search settings, and database connection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-hidden">
            <Tabs defaultValue="ai" className="w-full h-full flex flex-col">
              <div className="px-6 py-2 border-b flex-shrink-0">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ai">AI Configuration</TabsTrigger>
                  <TabsTrigger value="search">Search Settings</TabsTrigger>
                  <TabsTrigger value="database">Database Settings</TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 min-h-0">
                <TabsContent value="ai" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <AIConfiguration />
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="search" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <SearchSettings />
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="database" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <DatabaseSettings />
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
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
    </div>
  );
};

export default Index;
