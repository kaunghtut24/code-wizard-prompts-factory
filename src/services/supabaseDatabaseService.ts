
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface ConversationEntry {
  id: string;
  user_id: string;
  user_input: string;
  ai_output: string;
  agent_type: string;
  metadata?: {
    hasCodeSnippets?: boolean;
    searchResults?: any[];
    processingTime?: number;
    workflowType?: string;
    collaborativeAgents?: string[];
    workflowSteps?: any[];
    complexity?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UserSetting {
  id: string;
  user_id: string;
  setting_key: string;
  setting_value: any;
  created_at: string;
  updated_at: string;
}

export interface CustomPrompt {
  id: string;
  user_id: string;
  agent_type: string;
  prompt_name: string;
  prompt_content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmbeddingEntry {
  id: string;
  user_id: string;
  content: string;
  content_type: 'conversation' | 'prompt' | 'document';
  source_id?: string;
  embedding: number[];
  metadata?: any;
  created_at: string;
}

export interface SearchCacheEntry {
  id: string;
  user_id: string;
  query_hash: string;
  query: string;
  results: any;
  expires_at: string;
  created_at: string;
}

class SupabaseDatabaseService {
  private user: User | null = null;

  constructor() {
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null;
    });

    // Initialize current user
    this.initializeUser();
  }

  private async initializeUser() {
    const { data: { session } } = await supabase.auth.getSession();
    this.user = session?.user || null;
  }

  private requireAuth(): string {
    if (!this.user) {
      throw new Error('User must be authenticated to perform this action');
    }
    return this.user.id;
  }

  // Conversation methods
  async saveConversation(entry: Omit<ConversationEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const userId = this.requireAuth();
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        user_input: entry.user_input,
        ai_output: entry.ai_output,
        agent_type: entry.agent_type,
        metadata: entry.metadata || {}
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }

    console.log('Conversation saved to Supabase:', { id: data.id, agentType: entry.agent_type });
    return data.id;
  }

  async getConversations(): Promise<ConversationEntry[]> {
    const userId = this.requireAuth();
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    return data || [];
  }

  async getConversationsByAgent(agentType: string): Promise<ConversationEntry[]> {
    const userId = this.requireAuth();
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_type', agentType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations by agent:', error);
      throw error;
    }

    return data || [];
  }

  async searchConversations(keyword: string): Promise<ConversationEntry[]> {
    const userId = this.requireAuth();
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .or(`user_input.ilike.%${keyword}%,ai_output.ilike.%${keyword}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching conversations:', error);
      throw error;
    }

    return data || [];
  }

  // User settings methods
  async setUserSetting(key: string, value: any): Promise<void> {
    const userId = this.requireAuth();
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        setting_key: key,
        setting_value: value
      });

    if (error) {
      console.error('Error setting user setting:', error);
      throw error;
    }
  }

  async getUserSetting(key: string, defaultValue: any = null): Promise<any> {
    const userId = this.requireAuth();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('setting_value')
      .eq('user_id', userId)
      .eq('setting_key', key)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error getting user setting:', error);
      throw error;
    }

    return data?.setting_value ?? defaultValue;
  }

  async getUserSettings(): Promise<Record<string, any>> {
    const userId = this.requireAuth();
    
    const { data, error } = await supabase
      .from('user_settings')
      .select('setting_key, setting_value')
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user settings:', error);
      throw error;
    }

    const settings: Record<string, any> = {};
    data?.forEach(item => {
      settings[item.setting_key] = item.setting_value;
    });

    return settings;
  }

  // Custom prompts methods
  async saveCustomPrompt(agentType: string, promptName: string, promptContent: string): Promise<string> {
    const userId = this.requireAuth();
    
    const { data, error } = await supabase
      .from('custom_prompts')
      .upsert({
        user_id: userId,
        agent_type: agentType,
        prompt_name: promptName,
        prompt_content: promptContent,
        is_active: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving custom prompt:', error);
      throw error;
    }

    return data.id;
  }

  async getCustomPrompts(agentType?: string): Promise<CustomPrompt[]> {
    const userId = this.requireAuth();
    
    let query = supabase
      .from('custom_prompts')
      .select('*')
      .eq('user_id', userId);

    if (agentType) {
      query = query.eq('agent_type', agentType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom prompts:', error);
      throw error;
    }

    return data || [];
  }

  async activateCustomPrompt(promptId: string): Promise<void> {
    const userId = this.requireAuth();
    
    // First, deactivate all prompts for this user and agent type
    const { data: prompt } = await supabase
      .from('custom_prompts')
      .select('agent_type')
      .eq('id', promptId)
      .single();

    if (prompt) {
      await supabase
        .from('custom_prompts')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('agent_type', prompt.agent_type);

      // Then activate the selected prompt
      const { error } = await supabase
        .from('custom_prompts')
        .update({ is_active: true })
        .eq('id', promptId);

      if (error) {
        console.error('Error activating custom prompt:', error);
        throw error;
      }
    }
  }

  // Semantic search methods
  async createEmbedding(content: string, contentType: 'conversation' | 'prompt' | 'document', sourceId?: string, metadata?: any): Promise<string> {
    const userId = this.requireAuth();
    
    // Here you would typically call OpenAI API to generate embeddings
    // For now, we'll store a placeholder
    const { data, error } = await supabase
      .from('embeddings')
      .insert({
        user_id: userId,
        content,
        content_type: contentType,
        source_id: sourceId,
        embedding: [], // Will be populated by edge function
        metadata: metadata || {}
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }

    return data.id;
  }

  async semanticSearch(query: string, contentType?: string, limit: number = 10): Promise<EmbeddingEntry[]> {
    const userId = this.requireAuth();
    
    // This would typically use vector similarity search
    // For now, we'll do a simple text search as fallback
    let queryBuilder = supabase
      .from('embeddings')
      .select('*')
      .eq('user_id', userId)
      .textSearch('content', query);

    if (contentType) {
      queryBuilder = queryBuilder.eq('content_type', contentType);
    }

    const { data, error } = await queryBuilder
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }

    return data || [];
  }

  // Search cache methods
  async getCachedSearch(query: string): Promise<any | null> {
    const userId = this.requireAuth();
    const queryHash = btoa(query).replace(/[^a-zA-Z0-9]/g, '');
    
    const { data, error } = await supabase
      .from('search_cache')
      .select('results')
      .eq('user_id', userId)
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting cached search:', error);
      return null;
    }

    return data?.results || null;
  }

  async setCachedSearch(query: string, results: any, expirationMinutes: number = 30): Promise<void> {
    const userId = this.requireAuth();
    const queryHash = btoa(query).replace(/[^a-zA-Z0-9]/g, '');
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('search_cache')
      .upsert({
        user_id: userId,
        query_hash: queryHash,
        query,
        results,
        expires_at: expiresAt
      });

    if (error) {
      console.error('Error setting cached search:', error);
    }
  }

  // Utility methods
  async clearUserData(): Promise<void> {
    const userId = this.requireAuth();
    
    const tables = ['conversations', 'user_settings', 'custom_prompts', 'embeddings', 'search_cache'];
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error(`Error clearing ${table}:`, error);
      }
    }
  }

  async getStorageStats(): Promise<{
    conversationCount: number;
    settingsCount: number;
    promptsCount: number;
    embeddingsCount: number;
    cacheCount: number;
  }> {
    const userId = this.requireAuth();
    
    const [conversations, settings, prompts, embeddings, cache] = await Promise.all([
      supabase.from('conversations').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('user_settings').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('custom_prompts').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('embeddings').select('id', { count: 'exact' }).eq('user_id', userId),
      supabase.from('search_cache').select('id', { count: 'exact' }).eq('user_id', userId)
    ]);

    return {
      conversationCount: conversations.count || 0,
      settingsCount: settings.count || 0,
      promptsCount: prompts.count || 0,
      embeddingsCount: embeddings.count || 0,
      cacheCount: cache.count || 0
    };
  }

  // Migration methods
  async migrateFromLocalStorage(): Promise<void> {
    console.log('Starting migration from localStorage to Supabase...');
    
    try {
      // Migrate conversations
      const localConversations = localStorage.getItem('codecraft_conversations');
      if (localConversations) {
        const conversations = JSON.parse(localConversations);
        for (const conv of conversations) {
          await this.saveConversation({
            user_input: conv.userInput,
            ai_output: conv.aiOutput,
            agent_type: conv.agentType,
            metadata: conv.metadata
          });
        }
        localStorage.removeItem('codecraft_conversations');
      }

      // Migrate settings
      const localPreferences = localStorage.getItem('codecraft_preferences');
      if (localPreferences) {
        const preferences = JSON.parse(localPreferences);
        for (const [key, value] of Object.entries(preferences)) {
          await this.setUserSetting(key, value);
        }
        localStorage.removeItem('codecraft_preferences');
      }

      // Clear other localStorage items
      localStorage.removeItem('codecraft_search_results');
      
      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.user;
  }

  getCurrentUser(): User | null {
    return this.user;
  }
}

export const supabaseDatabaseService = new SupabaseDatabaseService();
export type { ConversationEntry as SupabaseConversationEntry };
