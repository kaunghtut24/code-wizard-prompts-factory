interface ConversationEntry {
  id: string;
  timestamp: number;
  userInput: string;
  agentType: string;
  aiOutput: string;
  metadata?: {
    hasCodeSnippets?: boolean;
    searchResults?: any[];
    processingTime?: number;
  };
}

interface SearchResult {
  id: string;
  query: string;
  results: any[];
  timestamp: number;
}

class DatabaseService {
  private readonly STORAGE_KEYS = {
    CONVERSATIONS: 'codecraft_conversations',
    SEARCH_RESULTS: 'codecraft_search_results',
    USER_PREFERENCES: 'codecraft_preferences'
  };

  // Store conversation entry
  public saveConversation(entry: Omit<ConversationEntry, 'id' | 'timestamp'>): string {
    const conversations = this.getConversations();
    const newEntry: ConversationEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      ...entry
    };
    
    conversations.push(newEntry);
    this.setItem(this.STORAGE_KEYS.CONVERSATIONS, conversations);
    
    console.log('Conversation saved:', { id: newEntry.id, agentType: entry.agentType });
    return newEntry.id;
  }

  // Get all conversations
  public getConversations(): ConversationEntry[] {
    return this.getItem(this.STORAGE_KEYS.CONVERSATIONS, []);
  }

  // Get conversations by agent type
  public getConversationsByAgent(agentType: string): ConversationEntry[] {
    return this.getConversations().filter(conv => conv.agentType === agentType);
  }

  // Search conversations by keyword
  public searchConversations(keyword: string): ConversationEntry[] {
    const conversations = this.getConversations();
    const lowerKeyword = keyword.toLowerCase();
    
    return conversations.filter(conv => 
      conv.userInput.toLowerCase().includes(lowerKeyword) ||
      conv.aiOutput.toLowerCase().includes(lowerKeyword)
    );
  }

  // Store search results
  public saveSearchResult(query: string, results: any[]): string {
    const searchResults = this.getSearchResults();
    const newSearch: SearchResult = {
      id: this.generateId(),
      query,
      results,
      timestamp: Date.now()
    };
    
    searchResults.push(newSearch);
    // Keep only last 100 search results to prevent storage bloat
    if (searchResults.length > 100) {
      searchResults.splice(0, searchResults.length - 100);
    }
    
    this.setItem(this.STORAGE_KEYS.SEARCH_RESULTS, searchResults);
    console.log('Search result saved:', { query, resultCount: results.length });
    return newSearch.id;
  }

  // Get search results
  public getSearchResults(): SearchResult[] {
    return this.getItem(this.STORAGE_KEYS.SEARCH_RESULTS, []);
  }

  // Get recent search for similar query
  public getRecentSearchResult(query: string, maxAgeMinutes: number = 30): SearchResult | null {
    const searches = this.getSearchResults();
    const cutoffTime = Date.now() - (maxAgeMinutes * 60 * 1000);
    
    return searches
      .filter(search => search.timestamp > cutoffTime)
      .find(search => search.query.toLowerCase() === query.toLowerCase()) || null;
  }

  // User preferences
  public setUserPreference(key: string, value: any): void {
    const prefs = this.getUserPreferences();
    prefs[key] = value;
    this.setItem(this.STORAGE_KEYS.USER_PREFERENCES, prefs);
  }

  public getUserPreference(key: string, defaultValue: any = null): any {
    const prefs = this.getUserPreferences();
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
  }

  public getUserPreferences(): Record<string, any> {
    return this.getItem(this.STORAGE_KEYS.USER_PREFERENCES, {});
  }

  // Clear all data
  public clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CONVERSATIONS);
    localStorage.removeItem(this.STORAGE_KEYS.SEARCH_RESULTS);
    localStorage.removeItem(this.STORAGE_KEYS.USER_PREFERENCES);
    console.log('All database data cleared');
  }

  // Get storage statistics
  public getStorageStats(): {
    conversationCount: number;
    searchResultCount: number;
    totalSizeKB: number;
  } {
    const conversations = this.getConversations();
    const searchResults = this.getSearchResults();
    
    // Estimate total size
    const totalSize = JSON.stringify({
      conversations,
      searchResults,
      preferences: this.getUserPreferences()
    }).length;

    return {
      conversationCount: conversations.length,
      searchResultCount: searchResults.length,
      totalSizeKB: Math.round(totalSize / 1024)
    };
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key ${key}:`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key ${key}:`, error);
      // Could implement fallback storage or cleanup old data here
    }
  }
}

export const databaseService = new DatabaseService();
export type { ConversationEntry, SearchResult };
