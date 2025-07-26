import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Search, Bot, TrendingUp, Calendar, Activity } from 'lucide-react';
import { databaseService } from '@/services/databaseService';

interface DashboardStatsProps {
  currentAgent: string;
  recentConversations: any[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ currentAgent, recentConversations }) => {
  const [stats, setStats] = useState({
    totalConversations: 0,
    searchesEnabled: false,
    activeAgents: new Set<string>(),
    conversationsToday: 0,
    mostUsedAgent: 'code-generation'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [recentConversations]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get all conversations for stats
      const allConversations = await databaseService.getConversations();
      
      // Get search settings
      const searchEnabled = await databaseService.getUserSetting('search_enabled', false);
      
      // Calculate stats
      const today = new Date().toDateString();
      const conversationsToday = allConversations.filter(conv => 
        new Date(conv.created_at).toDateString() === today
      ).length;
      
      // Count agent usage
      const agentCounts: Record<string, number> = {};
      const activeAgents = new Set<string>();
      
      allConversations.forEach(conv => {
        activeAgents.add(conv.agent_type);
        agentCounts[conv.agent_type] = (agentCounts[conv.agent_type] || 0) + 1;
      });
      
      // Find most used agent
      const mostUsedAgent = Object.entries(agentCounts).reduce((a, b) => 
        agentCounts[a[0]] > agentCounts[b[0]] ? a : b
      )?.[0] || 'code-generation';
      
      setStats({
        totalConversations: allConversations.length,
        searchesEnabled: searchEnabled,
        activeAgents,
        conversationsToday,
        mostUsedAgent
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAgentDisplayName = (agentType: string) => {
    const names: Record<string, string> = {
      'code-generation': 'Code Generation',
      'bug-fix': 'Bug Fix',
      'documentation': 'Documentation',
      'refactor': 'Refactor',
      'test-generator': 'Test Generator',
      'semantic-search': 'Semantic Search',
      'github': 'GitHub',
      'mcp-analysis': 'MCP Analysis'
    };
    return names[agentType] || agentType;
  };

  const getAgentColor = (agentType: string) => {
    const colors: Record<string, string> = {
      'code-generation': 'bg-blue-100 text-blue-800',
      'bug-fix': 'bg-red-100 text-red-800',
      'documentation': 'bg-green-100 text-green-800',
      'refactor': 'bg-purple-100 text-purple-800',
      'test-generator': 'bg-orange-100 text-orange-800',
      'semantic-search': 'bg-cyan-100 text-cyan-800',
      'github': 'bg-gray-100 text-gray-800',
      'mcp-analysis': 'bg-pink-100 text-pink-800'
    };
    return colors[agentType] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Conversations */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalConversations}</div>
          <p className="text-xs text-muted-foreground">
            {stats.conversationsToday} today
          </p>
        </CardContent>
      </Card>

      {/* Current Agent */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Agent
            </CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Badge className={`${getAgentColor(currentAgent)} text-xs`}>
            {getAgentDisplayName(currentAgent)}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.activeAgents.size} agents used
          </p>
        </CardContent>
      </Card>

      {/* Search Status */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Web Search
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              stats.searchesEnabled ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm font-medium">
              {stats.searchesEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time search capability
          </p>
        </CardContent>
      </Card>

      {/* Activity */}
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Most Used Agent
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Badge className={`${getAgentColor(stats.mostUsedAgent)} text-xs`}>
            {getAgentDisplayName(stats.mostUsedAgent)}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            Frequently accessed
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;