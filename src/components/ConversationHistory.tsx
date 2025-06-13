
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
  Database,
  X
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
  const [loading, setLoading] = useState(false);
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

  const loadConversations = async () => {
    try {
      setLoading(true);
      const allConversations = await databaseService.getConversations();
      setConversations(allConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStorageStats = async () => {
    try {
      const stats = await databaseService.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const filterConversations = async () => {
    let filtered = conversations;

    if (selectedAgent !== 'all') {
      filtered = filtered.filter(conv => conv.agent_type === selectedAgent);
    }

    if (searchTerm.trim()) {
      try {
        const searchResults = await databaseService.searchConversations(searchTerm);
        filtered = searchResults;
      } catch (error) {
        console.error('Error searching conversations:', error);
      }
    }

    setFilteredConversations(filtered);
  };

  const getUniqueAgents = () => {
    const agents = new Set(conversations.map(conv => conv.agent_type));
    return Array.from(agents);
  };

  const formatTimestamp = (timestamp: string) => {
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

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
      try {
        await databaseService.clearUserData();
        setConversations([]);
        setFilteredConversations([]);
        setSelectedConversation(null);
        await loadStorageStats();
        
        toast({
          title: "Data Cleared",
          description: "All conversation history has been cleared",
        });
      } catch (error) {
        console.error('Error clearing data:', error);
        toast({
          title: "Error",
          description: "Failed to clear data",
          variant: "destructive",
        });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[90vh] bg-background rounded-lg shadow-lg flex flex-col">
        {/* Header */}
        <div className="border-b p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-6 w-6 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold">Conversation History</h2>
                <p className="text-sm text-muted-foreground">
                  {storageStats.conversationCount || 0} conversations stored
                </p>
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
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Conversation List */}
          <div className="w-1/3 border-r flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b space-y-3 flex-shrink-0">
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
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading conversations...
                  </div>
                ) : filteredConversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedConversation?.id === conversation.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {conversation.agent_type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(conversation.created_at)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {conversation.user_input.slice(0, 150)}...
                      </p>
                      {conversation.metadata?.hasCodeSnippets && (
                        <Badge variant="outline" className="text-xs mt-2">
                          Contains Code
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {!loading && filteredConversations.length === 0 && (
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
              <>
                <div className="p-4 border-b flex-shrink-0">
                  <h3 className="font-medium">Conversation Details</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatTimestamp(selectedConversation.created_at)} • {selectedConversation.agent_type}
                  </p>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    <EnhancedMessageDisplay
                      content={selectedConversation.user_input}
                      isUser={true}
                      timestamp={new Date(selectedConversation.created_at).getTime()}
                    />
                    <EnhancedMessageDisplay
                      content={selectedConversation.ai_output}
                      isUser={false}
                      agentType={selectedConversation.agent_type}
                      timestamp={new Date(selectedConversation.created_at).getTime()}
                      hasSearchResults={!!selectedConversation.metadata?.searchResults}
                    />
                  </div>
                </ScrollArea>
              </>
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
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;
