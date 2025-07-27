
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Copy,
  Check,
  User,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CodeDisplay from './CodeDisplay';
import ReactMarkdown from 'react-markdown';

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

  // Custom markdown components for better rendering
  const markdownComponents = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && children) {
        return (
          <CodeDisplay
            content={String(children).replace(/\n$/, '')}
            language={language}
            showLineNumbers={true}
            maxHeight="400px"
          />
        );
      }
      
      return (
        <code 
          className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400" 
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: ({ children }: any) => {
      // Let the code component handle pre blocks
      return <>{children}</>;
    },
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-900 dark:text-gray-100">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-medium mt-4 mb-2 text-gray-900 dark:text-gray-100">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="mb-3 ml-6 space-y-1 list-disc text-gray-700 dark:text-gray-300">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="mb-3 ml-6 space-y-1 list-decimal text-gray-700 dark:text-gray-300">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="text-gray-700 dark:text-gray-300">{children}</li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 py-2">
        {children}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{children}</td>
    ),
    a: ({ href, children }: any) => (
      <a 
        href={href} 
        className="text-blue-600 dark:text-blue-400 hover:underline" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic text-gray-800 dark:text-gray-200">{children}</em>
    )
  };

  if (compact) {
    return (
      <div className="w-full space-y-3">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 border shadow-sm max-w-4xl ${
      isUser 
        ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 ml-auto' 
        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        {isUser ? (
          <>
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-700 dark:text-blue-300">You</span>
          </>
        ) : (
          <>
            <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {agentType ? agentType.charAt(0).toUpperCase() + agentType.slice(1) : 'Assistant'}
            </span>
            {agentType && (
              <Badge variant="secondary" className="text-xs">
                {agentType}
              </Badge>
            )}
          </>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {formatTimestamp(timestamp)}
        </span>
      </div>

      {hasSearchResults && !isUser && (
        <div className="flex items-center gap-1 mb-2 text-xs text-green-600 dark:text-green-400">
          <Globe className="h-3 w-3" />
          Web search results included
        </div>
      )}

      <div className="space-y-3">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
        
        {!isUser && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
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
