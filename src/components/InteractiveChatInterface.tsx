import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Send, 
  Bot, 
  User, 
  RefreshCw, 
  Globe,
  Link,
  MessageSquare,
  Trash2,
  Workflow,
  Users
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import { searchService } from '@/services/searchService';
import { databaseService } from '@/services/databaseService';
import { promptService } from '@/services/promptService';
import { workflowService } from '@/services/workflowService';
import { useToast } from '@/hooks/use-toast';
import EnhancedMessageDisplay from './EnhancedMessageDisplay';
import FileAttachment from './FileAttachment';

interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
}

interface InteractiveChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: number;
  agentType?: string;
  searchResults?: any[];
  searchUrls?: string[];
  attachedFiles?: AttachedFile[];
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
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);
  const [workflowProgress, setWorkflowProgress] = useState<any>(null);
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

  const formatAttachedFilesForAI = (files: AttachedFile[]): string => {
    if (!files || files.length === 0) return '';
    
    let filesContext = '\n\n**ATTACHED FILES:**\n';
    files.forEach((file, index) => {
      filesContext += `\n**File ${index + 1}: ${file.name}**\n`;
      filesContext += `Type: ${file.type}\n`;
      filesContext += `Content:\n${file.content}\n`;
      filesContext += '---\n';
    });
    
    return filesContext;
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isProcessing) return;

    if (!aiService.isConfigured()) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your AI model settings first.",
        variant: "destructive",
      });
      return;
    }

    // Analyze task complexity for potential collaborative workflow
    const taskAnalysis = workflowService.analyzeTaskComplexity(input);
    
    // Prepare user message content with files
    let userMessageContent = input.trim();
    if (attachedFiles.length > 0) {
      userMessageContent += formatAttachedFilesForAI(attachedFiles);
    }

    const userMessage: InteractiveChatMessage = {
      id: Date.now().toString(),
      content: userMessageContent,
      isUser: true,
      timestamp: Date.now(),
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsProcessing(true);

    try {
      // Check if we should use collaborative workflow
      if (taskAnalysis.complexity === 'complex' || taskAnalysis.complexity === 'moderate') {
        await handleCollaborativeWorkflow(userMessageContent, taskAnalysis, userMessage);
      } else {
        await handleSingleAgentResponse(userMessageContent, userMessage);
      }
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
      setActiveWorkflow(null);
      setWorkflowProgress(null);
    }
  };

  const handleCollaborativeWorkflow = async (userInput: string, taskAnalysis: any, userMessage: InteractiveChatMessage) => {
    // Create workflow
    const workflow = await workflowService.createWorkflow(userInput, taskAnalysis);
    setActiveWorkflow(workflow);
    
    // Show workflow initiation message
    const workflowInitMessage: InteractiveChatMessage = {
      id: (Date.now() + 1).toString(),
      content: `🤝 **Collaborative Workflow Initiated**\n\nThis ${taskAnalysis.complexity} task will be handled by ${taskAnalysis.agents.length} specialized agents working together:\n\n${taskAnalysis.agents.map((agent: string, index: number) => `${index + 1}. **${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent**`).join('\n')}\n\nStarting collaborative process...`,
      isUser: false,
      agentType: 'orchestrator',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, workflowInitMessage]);

    // Execute workflow steps
    while (!workflow.isComplete) {
      const progress = workflowService.getWorkflowProgress(workflow.id);
      setWorkflowProgress(progress);
      
      const stepResult = await workflowService.executeWorkflowStep(workflow.id);
      
      // Add step result message
      const stepMessage: InteractiveChatMessage = {
        id: (Date.now() + Math.random()).toString(),
        content: stepResult.stepOutput,
        isUser: false,
        agentType: workflow.steps[progress!.currentStep - 1]?.agentType,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, stepMessage]);
      
      if (stepResult.isComplete) {
        // Add final synthesized output
        const finalOutput = workflowService.getFinalOutput(workflow.id);
        if (finalOutput) {
          const finalMessage: InteractiveChatMessage = {
            id: (Date.now() + Math.random() + 1).toString(),
            content: finalOutput,
            isUser: false,
            agentType: 'orchestrator',
            timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, finalMessage]);
        }
        
        // Save to database with correct field names
        databaseService.saveConversation({
          user_input: userInput,
          agent_type: 'collaborative',
          ai_output: finalOutput || 'Collaborative workflow completed',
          metadata: {
            workflowType: 'collaborative',
            collaborativeAgents: taskAnalysis.agents,
            complexity: taskAnalysis.complexity,
            processingTime: Date.now() - userMessage.timestamp
          }
        });
        
        workflowService.clearWorkflow(workflow.id);
        break;
      }
    }
  };

  const handleSingleAgentResponse = async (userMessageContent: string, userMessage: InteractiveChatMessage) => {
    // Build conversation context with enhanced system prompt
    let chatMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
    
    // Enhanced system prompt for interactive chat
    const baseSystemPrompt = promptService.getPrompt(activeAgent);
    const interactiveSystemPrompt = `${baseSystemPrompt}

INTERACTIVE CHAT MODE WITH FILE SUPPORT:
You are now in interactive chat mode. This means:
- Maintain context from the entire conversation history
- Provide conversational responses that reference previous messages when relevant
- Be helpful, clear, and engaging in your responses
- If you use web search results, reference them naturally in your response
- When files are attached, analyze their content and incorporate relevant information into your response
- For code files, provide specific feedback, suggestions, or explanations
- For documentation files, reference the content when answering questions
- Keep responses focused but comprehensive
- Feel free to ask clarifying questions if needed

Remember to be contextually aware of the entire conversation flow and any attached files.`;

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
    chatMessages.push({ role: 'user', content: userMessageContent });

    let searchResults: any[] = [];
    let searchUrls: string[] = [];

    // Check if web search is enabled and needed
    const isSearchEnabled = await databaseService.getUserSetting('search_enabled', true);
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

    // Save conversation to database with correct field names
    databaseService.saveConversation({
      user_input: input.trim(),
      agent_type: activeAgent,
      ai_output: enhancedContent,
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
  };

  const clearChat = () => {
    setMessages([]);
    setAttachedFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
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
              {activeWorkflow && (
                <Badge variant="default" className="text-xs">
                  <Workflow className="h-3 w-3 mr-1" />
                  Collaborative Mode
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
          
          {/* Workflow Progress */}
          {workflowProgress && !workflowProgress.isComplete && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Collaborative Workflow Progress
                  </span>
                </div>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {workflowProgress.currentStep} / {workflowProgress.totalSteps}
                </span>
              </div>
              <Progress 
                value={(workflowProgress.currentStep / workflowProgress.totalSteps) * 100} 
                className="mb-2"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Current: {workflowProgress.nextAgent?.charAt(0).toUpperCase() + workflowProgress.nextAgent?.slice(1)} Agent
                </span>
                {workflowProgress.completedAgents.length > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    ✓ Completed: {workflowProgress.completedAgents.join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
          {/* Messages Area with proper scrolling */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Start a conversation</p>
                    <p className="text-sm">Ask me anything! I can work alone or collaborate with other agents for complex tasks.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id}>
                      <EnhancedMessageDisplay
                        content={message.content}
                        isUser={message.isUser}
                        agentType={message.agentType}
                        timestamp={message.timestamp}
                        hasSearchResults={!!message.searchResults}
                        compact={false}
                      />
                      
                      {message.attachedFiles && message.attachedFiles.length > 0 && (
                        <div className={`mt-2 ${message.isUser ? '' : 'ml-16'}`}>
                          <div className="text-xs text-muted-foreground mb-1">Attached files:</div>
                          <div className="flex flex-wrap gap-1">
                            {message.attachedFiles.map((file) => (
                              <Badge key={file.id} variant="outline" className="text-xs">
                                {file.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* File Attachment Area */}
          {(attachedFiles.length > 0 || !isProcessing) && (
            <div className="border-t pt-3 flex-shrink-0">
              <FileAttachment
                onFilesChange={setAttachedFiles}
                maxFiles={3}
                maxSizePerFile={10}
              />
            </div>
          )}

          {/* Input Area */}
          <div className="flex items-end gap-2 pt-3 border-t flex-shrink-0">
            <div className="flex-1">
              <Input
                placeholder="Type your message... (Press Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={(!input.trim() && attachedFiles.length === 0) || isProcessing || !aiService.isConfigured()}
              size="sm"
              className="flex-shrink-0"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!aiService.isConfigured() && (
            <p className="text-sm text-red-600 text-center flex-shrink-0">
              ⚠️ Please configure AI settings first
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveChatInterface;
