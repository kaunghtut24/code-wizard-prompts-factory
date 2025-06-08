import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Globe,
  Link,
  MessageSquare,
  Trash2
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import { searchService } from '@/services/searchService';
import { databaseService } from '@/services/databaseService';
import { promptService } from '@/services/promptService';
import { useToast } from '@/hooks/use-toast';
import EnhancedMessageDisplay from './EnhancedMessageDisplay';

interface InteractiveChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  agentType?: string;
  searchResults?: any[];
  searchUrls?: string[];
}

interface InteractiveChatInterfaceProps {
  activeAgent: string;
  agentName: string;
}

const InteractiveChatInterface: React.FC<InteractiveChatInterfaceProps> = ({
  activeAgent,
  agentName
}) => {
  const [messages, setMessages] = useState<InteractiveChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractUrlsFromSearchResults = (searchResults: any[]): string[] => {
    return searchResults.map(result => result.url || result.link).filter(Boolean);
  };

  const embedSearchUrls = (content: string, urls: string[]): string => {
    if (!urls || urls.length === 0) return content;
    
    const urlSection = `\n\n**Sources:**\n${urls.map((url, index) => 
      `[${index + 1}] ${url}`
    ).join('\n')}`;
    
    return content + urlSection;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    if (!aiService.isConfigured()) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your AI model settings first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: InteractiveChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Build conversation context with enhanced system prompt
      let chatMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
      
      // Enhanced system prompt for interactive chat
      const baseSystemPrompt = promptService.getPrompt(activeAgent);
      const interactiveSystemPrompt = `${baseSystemPrompt}

INTERACTIVE CHAT MODE:
You are now in interactive chat mode. This means:
- Maintain context from the entire conversation history
- Provide conversational responses that reference previous messages when relevant
- Be helpful, clear, and engaging in your responses
- If you use web search results, reference them naturally in your response
- Keep responses focused but comprehensive
- Feel free to ask clarifying questions if needed

Remember to be contextually aware of the entire conversation flow.`;

      chatMessages.push({ role: 'system', content: interactiveSystemPrompt });

      // Add conversation history for context (last 10 messages)
      const recentMessages = messages.slice(-10);
      recentMessages.forEach(msg => {
        if (msg.isUser) {
          chatMessages.push({ role: 'user', content: msg.content });
        } else {
          chatMessages.push({ role: 'assistant', content: msg.content });
        }
      });

      // Add current user input
      chatMessages.push({ role: 'user', content: input.trim() });

      let searchResults: any[] = [];
      let searchUrls: string[] = [];

      // Check if web search is enabled and needed
      const isSearchEnabled = databaseService.getUserPreference('search_enabled', true);
      if (isSearchEnabled && searchService.isConfigured() && searchService.shouldSearchForQuery(input)) {
        try {
          console.log('Performing web search for interactive chat query:', input);
          const searchResponse = await searchService.search(input, { maxResults: 5 });
          searchResults = searchResponse.results;
          searchUrls = extractUrlsFromSearchResults(searchResults);
          
          // Prepend search results to the conversation
          const searchContext = searchService.formatSearchResults(searchResponse);
          chatMessages.splice(1, 0, { 
            role: 'system', 
            content: `CURRENT WEB SEARCH RESULTS:\n\n${searchContext}\n\nReference these search results naturally in your response when relevant. The user will see the source URLs at the end of your message.` 
          });
          
          console.log('Web search completed for interactive chat, URLs found:', searchUrls.length);
        } catch (searchError) {
          console.error('Web search failed in interactive chat:', searchError);
        }
      }

      const response = await aiService.chat(chatMessages, activeAgent);

      if (!response.content) {
        throw new Error('Received empty response from AI service');
      }

      // Embed search URLs in the response content
      const enhancedContent = embedSearchUrls(response.content, searchUrls);

      const aiMessage: InteractiveChatMessage = {
        id: (Date.now() + 1).toString(),
        content: enhancedContent,
        isUser: false,
        agentType: activeAgent,
        timestamp: Date.now(),
        searchResults: searchResults.length > 0 ? searchResults : undefined,
        searchUrls: searchUrls.length > 0 ? searchUrls : undefined
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save conversation to database
      databaseService.saveConversation({
        userInput: input.trim(),
        agentType: activeAgent,
        aiOutput: enhancedContent,
        metadata: {
          hasCodeSnippets: response.content.includes('```'),
          searchResults: searchResults.length > 0 ? searchResults : undefined,
          processingTime: Date.now() - userMessage.timestamp
        }
      });

      toast({
        title: "Message Sent",
        description: searchResults.length > 0 ? "Response with web search results" : "Response received",
      });

    } catch (error) {
      console.error('Interactive chat error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorAiMessage: InteractiveChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `❌ Error: ${errorMessage}\n\nPlease check your AI configuration and try again.`,
        isUser: false,
        agentType: activeAgent,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorAiMessage]);
      
      toast({
        title: "Message Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Interactive Chat with {agentName}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {searchService.isConfigured() && (
              <Badge variant="secondary" className="text-xs">
                <Globe className="h-3 w-3 mr-1" />
                Web Search Enabled
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Start a conversation</p>
                <p className="text-sm">Ask me anything! I'll remember our conversation context.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.isUser
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.isUser ? (
                        message.content
                      ) : (
                        <EnhancedMessageDisplay
                          content={message.content}
                          isUser={false}
                          agentType={message.agentType}
                          timestamp={message.timestamp}
                          hasSearchResults={!!message.searchResults}
                          compact={true}
                        />
                      )}
                    </div>
                    
                    {message.searchUrls && message.searchUrls.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <Globe className="h-3 w-3" />
                          Web Search Used
                        </div>
                      </div>
                    )}
                  </div>

                  {message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <Input
            placeholder="Type your message... (Press Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isProcessing || !aiService.isConfigured()}
            size="sm"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!aiService.isConfigured() && (
          <p className="text-sm text-red-600 text-center">
            ⚠️ Please configure AI settings first
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveChatInterface;
