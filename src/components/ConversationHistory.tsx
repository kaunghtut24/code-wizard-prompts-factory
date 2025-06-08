
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  Clock,
  MessageCircle,
  Database
} from 'lucide-react';
import { databaseService, type ConversationEntry } from '@/services/databaseService';
import EnhancedMessageDisplay from './EnhancedMessageDisplay';
import { useToast } from '@/hooks/use-toast';

interface ConversationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  currentAgent?: string;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  isOpen,
  onClose,
  currentAgent
}) => {
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<ConversationEntry | null>(null);
  const [storageStats, setStorageStats] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      loadStorageStats();
    }
  }, [isOpen]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchTerm, selectedAgent]);

  const loadConversations = () => {
    const allConversations = databaseService.getConversations();
    setConversations(allConversations.reverse()); // Show newest first
  };

  const loadStorageStats = () => {
    const stats = databaseService.getStorageStats();
    setStorageStats(stats);
  };

  const filterConversations = () => {
    let filtered = conversations;

    // Filter by agent type
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(conv => conv.agentType === selectedAgent);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = databaseService.searchConversations(searchTerm);
    }

    setFilteredConversations(filtered);
  };

  const getUniqueAgents = () => {
    const agents = new Set(conversations.map(conv => conv.agentType));
    return Array.from(agents);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const exportConversations = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `codecraft-conversations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Conversations have been exported to JSON file",
    });
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
      databaseService.clearAllData();
      setConversations([]);
      setFilteredConversations([]);
      setSelectedConversation(null);
      loadStorageStats();
      
      toast({
        title: "Data Cleared",
        description: "All conversation history has been cleared",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-5/6 flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-purple-600" />
              <div>
                <CardTitle>Conversation History</CardTitle>
                <CardDescription>
                  {storageStats.conversationCount} conversations stored ({storageStats.totalSizeKB}KB)
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportConversations}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={clearAllData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex gap-4 overflow-hidden">
          {/* Left Panel - Conversation List */}
          <div className="w-1/3 flex flex-col space-y-4">
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Agents</option>
                {getUniqueAgents().map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedConversation?.id === conversation.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {conversation.agentType}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(conversation.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {conversation.userInput.slice(0, 100)}...
                      </p>
                      {conversation.metadata?.hasCodeSnippets && (
                        <Badge variant="outline" className="text-xs mt-2">
                          Contains Code
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {filteredConversations.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Conversation Detail */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ScrollArea className="flex-1">
                <div className="space-y-4 p-4">
                  <EnhancedMessageDisplay
                    content={selectedConversation.userInput}
                    isUser={true}
                    timestamp={selectedConversation.timestamp}
                  />
                  <EnhancedMessageDisplay
                    content={selectedConversation.aiOutput}
                    isUser={false}
                    agentType={selectedConversation.agentType}
                    timestamp={selectedConversation.timestamp}
                    hasSearchResults={!!selectedConversation.metadata?.searchResults}
                  />
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationHistory;
