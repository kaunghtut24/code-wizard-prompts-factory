
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Search, Clock } from 'lucide-react';
import CodeDisplay from './CodeDisplay';

interface MessageDisplayProps {
  content: string;
  isUser?: boolean;
  agentType?: string;
  timestamp?: number;
  hasSearchResults?: boolean;
  searchQuery?: string;
}

const EnhancedMessageDisplay: React.FC<MessageDisplayProps> = ({
  content,
  isUser = false,
  agentType,
  timestamp,
  hasSearchResults = false,
  searchQuery
}) => {
  // Function to detect and extract code blocks
  const parseContentWithCode = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    const parts: Array<{ type: 'text' | 'code' | 'inline-code'; content: string; language?: string }> = [];
    let lastIndex = 0;
    let match;

    // Find code blocks
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore });
        }
      }

      // Add code block
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'javascript'
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    // If no code blocks found, process inline code
    if (parts.length === 0) {
      const processedText = text.replace(inlineCodeRegex, (match, code) => {
        return `<code class="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">${code}</code>`;
      });
      parts.push({ type: 'text', content: processedText });
    } else {
      // Process inline code in text parts
      parts.forEach(part => {
        if (part.type === 'text') {
          part.content = part.content.replace(inlineCodeRegex, (match, code) => {
            return `<code class="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">${code}</code>`;
          });
        }
      });
    }

    return parts;
  };

  const formatTimestamp = (ts?: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleString();
  };

  const contentParts = parseContentWithCode(content);

  return (
    <Card className={`mb-4 ${isUser ? 'ml-8 bg-blue-50 border-blue-200' : 'mr-8 bg-white'}`}>
      <CardContent className="p-4">
        {/* Message Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isUser ? (
              <User className="h-5 w-5 text-blue-600" />
            ) : (
              <Bot className="h-5 w-5 text-purple-600" />
            )}
            <span className="font-semibold text-sm">
              {isUser ? 'You' : (agentType ? `${agentType} Agent` : 'Assistant')}
            </span>
            {agentType && !isUser && (
              <Badge variant="secondary" className="text-xs">
                {agentType}
              </Badge>
            )}
            {hasSearchResults && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Search className="h-3 w-3" />
                Web Search
              </Badge>
            )}
          </div>
          {timestamp && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimestamp(timestamp)}
            </div>
          )}
        </div>

        {/* Search Query Display */}
        {searchQuery && hasSearchResults && (
          <div className="mb-3 p-2 bg-blue-100 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-700 font-medium">Search Query:</div>
            <div className="text-sm text-blue-800">{searchQuery}</div>
          </div>
        )}

        {/* Message Content */}
        <div className="space-y-3">
          {contentParts.map((part, index) => {
            if (part.type === 'code') {
              return (
                <CodeDisplay
                  key={index}
                  content={part.content}
                  language={part.language}
                  title={`Code Block ${index + 1}`}
                />
              );
            } else {
              return (
                <div
                  key={index}
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: part.content }}
                />
              );
            }
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMessageDisplay;
