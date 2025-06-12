
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, Trash2 } from 'lucide-react';
import { ConversationEntry } from '@/services/databaseService';

interface ConversationHistoryItemProps {
  conversation: ConversationEntry;
  onSelect: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  isSelected?: boolean;
}

const ConversationHistoryItem: React.FC<ConversationHistoryItemProps> = ({
  conversation,
  onSelect,
  onDelete,
  isSelected = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgentIcon = (agentType: string) => {
    const icons: Record<string, string> = {
      general: '💬',
      code: '💻',
      refactor: '🔄',
      'bug-fix': '🐛',
      test: '🧪',
      documentation: '📚',
      'semantic-search': '🔍',
      github: '🐙',
      'mcp-analysis': '🔬'
    };
    return icons[agentType] || '💬';
  };

  const getAgentName = (agentType: string) => {
    const names: Record<string, string> = {
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
    return names[agentType] || 'General Chat';
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg">{getAgentIcon(conversation.agent_type)}</span>
            <Badge variant="secondary" className="text-xs">
              {getAgentName(conversation.agent_type)}
            </Badge>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDate(conversation.created_at)}
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conversation.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <div className="text-sm font-medium text-foreground mb-1">
              User Input:
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {conversation.user_input}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-foreground mb-1">
              AI Response:
            </div>
            <div className="text-sm text-muted-foreground line-clamp-3">
              {conversation.ai_output.substring(0, 150)}...
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pt-2 border-t">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Click to load this conversation
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationHistoryItem;
