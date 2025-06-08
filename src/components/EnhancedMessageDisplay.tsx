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
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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

  const processContent = (text: string): string => {
    // Replace triple backticks with a pre and code tag
    let processedText = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      const trimmedCode = code.trim();
      const languageMatch = trimmedCode.match(/^([a-zA-Z]+)\n([\s\S]*)$/);
      
      if (languageMatch) {
        const language = languageMatch[1];
        const codeContent = languageMatch[2].trim();
        return `<pre><code class="language-${language}">${escapeHtml(codeContent)}</code></pre>`;
      } else {
        return `<pre><code>${escapeHtml(trimmedCode)}</code></pre>`;
      }
    });
  
    // Handle single backticks for inline code
    processedText = processedText.replace(/`([^`]+)`/g, '<code>$1</code>');
  
    // Convert newlines to <br> tags
    processedText = processedText.replace(/\n/g, '<br>');
  
    return processedText;
  };
  
  const escapeHtml = (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  };

  if (compact) {
    return (
      <div className="w-full">
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: processContent(content) }}
        />
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border ${
      isUser 
        ? 'bg-blue-50 border-blue-200 ml-12' 
        : 'bg-gray-50 border-gray-200 mr-12'
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
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: processContent(content) }}
        />
        
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
