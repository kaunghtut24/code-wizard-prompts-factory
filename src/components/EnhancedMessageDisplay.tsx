
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Check,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import CodeDisplay from './CodeDisplay';

interface EnhancedMessageDisplayProps {
  content: string;
  isUser: boolean;
  agentType?: string;
  timestamp: number;
  hasSearchResults?: boolean;
  compact?: boolean;
}

const EnhancedMessageDisplay: React.FC<EnhancedMessageDisplayProps> = ({
  content,
  isUser,
  agentType,
  timestamp,
  hasSearchResults = false,
  compact = false
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Content Copied",
        description: "Message content has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const parseContentWithCodeBlocks = (text: string) => {
    const parts = [];
    const codeBlockRegex = /```([\w]*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textContent = text.slice(lastIndex, match.index);
        if (textContent.trim()) {
          parts.push({
            type: 'text',
            content: textContent
          });
        }
      }

      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'javascript',
        content: match[2].trim()
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textContent = text.slice(lastIndex);
      if (textContent.trim()) {
        parts.push({
          type: 'text',
          content: textContent
        });
      }
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const processTextContent = (text: string): string => {
    // Handle single backticks for inline code
    let processedText = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Convert newlines to <br> tags
    processedText = processedText.replace(/\n/g, '<br>');
    
    return processedText;
  };

  if (compact) {
    const contentParts = parseContentWithCodeBlocks(content);
    
    return (
      <div className="w-full space-y-3">
        {contentParts.map((part, index) => (
          <div key={index}>
            {part.type === 'code' ? (
              <CodeDisplay
                content={part.content}
                language={part.language}
                showLineNumbers={true}
                maxHeight="300px"
              />
            ) : (
              <div 
                className="prose prose-sm max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: processTextContent(part.content) }}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  const contentParts = parseContentWithCodeBlocks(content);

  return (
    <div className={`rounded-lg p-4 border shadow-sm ${
      isUser 
        ? 'bg-blue-50 border-blue-200 ml-12' 
        : 'bg-white border-gray-200 mr-12'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        {isUser ? (
          <>
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-700">You</span>
          </>
        ) : (
          <>
            <Bot className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-700">
              {agentType ? agentType.charAt(0).toUpperCase() + agentType.slice(1) : 'Assistant'}
            </span>
            {agentType && (
              <Badge variant="secondary" className="text-xs">
                {agentType}
              </Badge>
            )}
          </>
        )}
        <span className="text-xs text-gray-500 ml-auto">
          {formatTimestamp(timestamp)}
        </span>
      </div>

      {hasSearchResults && !isUser && (
        <div className="flex items-center gap-1 mb-2 text-xs text-green-600">
          <Globe className="h-3 w-3" />
          Web search results included
        </div>
      )}

      <div className="space-y-3">
        {contentParts.map((part, index) => (
          <div key={index}>
            {part.type === 'code' ? (
              <CodeDisplay
                content={part.content}
                language={part.language}
                showLineNumbers={true}
                maxHeight="400px"
              />
            ) : (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: processTextContent(part.content) }}
              />
            )}
          </div>
        ))}
        
        {!isUser && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
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
        )}
      </div>
    </div>
  );
};

export default EnhancedMessageDisplay;
