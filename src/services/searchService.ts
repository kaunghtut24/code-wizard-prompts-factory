import { databaseService } from './databaseService';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
  date?: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  timestamp: number;
  cached: boolean;
  provider?: string;
}

interface SearchConfiguration {
  provider: string;
  serpApiKey?: string;
  tavilyApiKey?: string;
  maxResults: number;
}

class SearchService {
  private config: SearchConfiguration = {
    provider: 'duckduckgo',
    maxResults: 5
  };
  private readonly proxyUrl = 'https://api.allorigins.win/get?url=';
  private readonly requestTimeout = 10000;
  private configLoaded = false;
  private configLoadingPromise: Promise<void> | null = null;

  constructor() {
    // Don't load configuration in constructor to avoid async issues
  }

  private async ensureConfigLoaded(): Promise<void> {
    if (this.configLoaded) {
      return;
    }

    // Prevent multiple concurrent loads
    if (this.configLoadingPromise) {
      return this.configLoadingPromise;
    }

    this.configLoadingPromise = this.loadConfiguration();
    await this.configLoadingPromise;
    this.configLoadingPromise = null;
  }

  private async loadConfiguration(): Promise<void> {
    try {
      console.log('Loading search configuration from database...');
      
      // Load all settings with proper error handling for each
      const [provider, maxResults, serpApiKey, tavilyApiKey] = await Promise.allSettled([
        databaseService.getUserSetting('search_provider', 'duckduckgo'),
        databaseService.getUserSetting('search_max_results', 5),
        databaseService.getUserSetting('serpapi_key', ''),
        databaseService.getUserSetting('tavily_api_key', '')
      ]);

      // Extract values with fallbacks
      const resolvedProvider = provider.status === 'fulfilled' ? String(provider.value) : 'duckduckgo';
      const resolvedMaxResults = maxResults.status === 'fulfilled' ? Number(maxResults.value) : 5;
      const resolvedSerpKey = serpApiKey.status === 'fulfilled' ? String(serpApiKey.value || '') : '';
      const resolvedTavilyKey = tavilyApiKey.status === 'fulfilled' ? String(tavilyApiKey.value || '') : '';

      this.config = {
        provider: resolvedProvider,
        maxResults: resolvedMaxResults,
        serpApiKey: resolvedSerpKey || undefined,
        tavilyApiKey: resolvedTavilyKey || undefined
      };

      this.configLoaded = true;

      console.log('Search service configuration loaded:', { 
        provider: this.config.provider,
        maxResults: this.config.maxResults,
        hasSerpKey: !!this.config.serpApiKey,
        hasTavilyKey: !!this.config.tavilyApiKey
      });
    } catch (error) {
      console.error('Failed to load search configuration:', error);
      // Use defaults if loading fails
      this.config = {
        provider: 'duckduckgo',
        maxResults: 5
      };
      this.configLoaded = true;
      throw new Error(`Failed to load search configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async configure(config: SearchConfiguration): Promise<void> {
    try {
      console.log('Configuring search service with:', config);
      
      // Validate configuration
      if (!config.provider || !['duckduckgo', 'serpapi', 'tavily'].includes(config.provider)) {
        throw new Error('Invalid search provider specified');
      }

      if (!config.maxResults || config.maxResults < 1 || config.maxResults > 10) {
        throw new Error('Max results must be between 1 and 10');
      }

      // Save all settings to database with individual error handling
      const saveOperations = [
        databaseService.setUserSetting('search_provider', config.provider),
        databaseService.setUserSetting('search_max_results', config.maxResults)
      ];

      if (config.serpApiKey && config.serpApiKey.trim()) {
        saveOperations.push(databaseService.setUserSetting('serpapi_key', config.serpApiKey.trim()));
      }
      
      if (config.tavilyApiKey && config.tavilyApiKey.trim()) {
        saveOperations.push(databaseService.setUserSetting('tavily_api_key', config.tavilyApiKey.trim()));
      }

      // Wait for all save operations to complete
      const results = await Promise.allSettled(saveOperations);
      
      // Check if any saves failed
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some settings failed to save:', failures);
        throw new Error('Failed to save some configuration settings');
      }
      
      // Update local config only after successful database saves
      this.config = { 
        ...config,
        serpApiKey: config.serpApiKey?.trim() || undefined,
        tavilyApiKey: config.tavilyApiKey?.trim() || undefined
      };
      this.configLoaded = true;
      
      console.log('Search service configuration saved and updated successfully');
    } catch (error) {
      console.error('Failed to configure search service:', error);
      throw new Error(`Failed to save search configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getConfiguration(): Promise<SearchConfiguration> {
    await this.ensureConfigLoaded();
    return { ...this.config };
  }

  public async getApiKey(): Promise<string | null> {
    await this.ensureConfigLoaded();
    
    if (this.config.provider === 'serpapi') {
      return this.config.serpApiKey || null;
    }
    if (this.config.provider === 'tavily') {
      return this.config.tavilyApiKey || null;
    }
    return null; // DuckDuckGo doesn't need API key
  }

  public async setApiKey(apiKey: string): Promise<void> {
    try {
      await this.ensureConfigLoaded();
      
      if (!apiKey || !apiKey.trim()) {
        throw new Error('API key cannot be empty');
      }

      const trimmedKey = apiKey.trim();
      
      if (this.config.provider === 'serpapi') {
        await databaseService.setUserSetting('serpapi_key', trimmedKey);
        this.config.serpApiKey = trimmedKey;
      } else if (this.config.provider === 'tavily') {
        await databaseService.setUserSetting('tavily_api_key', trimmedKey);
        this.config.tavilyApiKey = trimmedKey;
      } else {
        throw new Error(`API key not needed for provider: ${this.config.provider}`);
      }
      
      console.log(`${this.config.provider} API key updated successfully`);
    } catch (error) {
      console.error('Failed to set API key:', error);
      throw new Error(`Failed to set API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public isConfigured(): boolean {
    try {
      if (this.config.provider === 'duckduckgo') {
        return true; // No API key needed
      }
      if (this.config.provider === 'serpapi') {
        return !!(this.config.serpApiKey && this.config.serpApiKey.trim());
      }
      if (this.config.provider === 'tavily') {
        return !!(this.config.tavilyApiKey && this.config.tavilyApiKey.trim());
      }
      return false;
    } catch (error) {
      console.error('Error checking configuration:', error);
      return false;
    }
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = this.requestTimeout): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  public async search(query: string, options: {
    useCache?: boolean;
    maxResults?: number;
    location?: string;
  } = {}): Promise<SearchResponse> {
    await this.ensureConfigLoaded();
    
    const { useCache = true, maxResults = this.config.maxResults, location = 'United States' } = options;

    console.log('Starting web search:', { 
      query, 
      provider: this.config.provider, 
      useCache, 
      maxResults,
      isConfigured: this.isConfigured()
    });

    if (useCache) {
      try {
        const cachedResult = await databaseService.getCachedSearch(query);
        if (cachedResult) {
          console.log('Using cached search result');
          return {
            results: cachedResult.slice(0, maxResults),
            query,
            timestamp: Date.now(),
            cached: true,
            provider: this.config.provider
          };
        }
      } catch (error) {
        console.warn('Cache lookup failed:', error);
      }
    }

    try {
      let result: SearchResponse;

      switch (this.config.provider) {
        case 'serpapi':
          result = await this.performSerpApiSearch(query, maxResults, location);
          break;
        case 'tavily':
          result = await this.performTavilySearch(query, maxResults);
          break;
        case 'duckduckgo':
        default:
          result = await this.performDuckDuckGoSearch(query, maxResults);
          break;
      }

      if (result.results.length > 0) {
        try {
          await databaseService.setCachedSearch(query, result.results);
        } catch (error) {
          console.warn('Failed to cache search results:', error);
        }
      }
      
      console.log('Web search completed:', { 
        provider: this.config.provider,
        resultCount: result.results.length 
      });
      
      return result;
    } catch (error) {
      console.error(`${this.config.provider} search failed:`, error);
      
      // Fallback to DuckDuckGo if primary search fails
      if (this.config.provider !== 'duckduckgo') {
        console.log('Attempting fallback to DuckDuckGo...');
        try {
          const fallbackResult = await this.performDuckDuckGoSearch(query, maxResults);
          fallbackResult.provider = 'duckduckgo (fallback)';
          return fallbackResult;
        } catch (fallbackError) {
          console.error('Fallback search also failed:', fallbackError);
        }
      }

      return this.getErrorResponse(query, error);
    }
  }

  private async performSerpApiSearch(query: string, maxResults: number, location: string): Promise<SearchResponse> {
    if (!this.config.serpApiKey) {
      throw new Error('SerpApi key not configured');
    }

    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: this.config.serpApiKey,
      num: maxResults.toString(),
      location,
      hl: 'en',
      gl: 'us'
    });

    const targetUrl = `https://serpapi.com/search.json?${params}`;
    const response = await this.fetchWithTimeout(`${this.proxyUrl}${encodeURIComponent(targetUrl)}`);

    if (!response.ok) {
      throw new Error(`SerpApi request failed: ${response.status} ${response.statusText}`);
    }

    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);

    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }

    const results: SearchResult[] = (data.organic_results || [])
      .slice(0, maxResults)
      .map((result: any, index: number) => ({
        title: result.title || 'No title',
        link: result.link || '#',
        snippet: result.snippet || 'No description',
        position: result.position || index + 1,
        date: result.date || undefined
      }));

    return {
      results,
      query,
      timestamp: Date.now(),
      cached: false,
      provider: 'serpapi'
    };
  }

  private async performTavilySearch(query: string, maxResults: number): Promise<SearchResponse> {
    if (!this.config.tavilyApiKey) {
      throw new Error('Tavily API key not configured');
    }

    const response = await this.fetchWithTimeout('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.tavilyApiKey}`
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const results: SearchResult[] = (data.results || [])
      .slice(0, maxResults)
      .map((result: any, index: number) => ({
        title: result.title || 'No title',
        link: result.url || '#',
        snippet: result.content || 'No description',
        position: index + 1
      }));

    return {
      results,
      query,
      timestamp: Date.now(),
      cached: false,
      provider: 'tavily'
    };
  }

  private async performDuckDuckGoSearch(query: string, maxResults: number): Promise<SearchResponse> {
    try {
      // Use Supabase Edge Function to avoid CORS issues
      const functionUrl = 'https://epwkfzfoeyhfpziwiojl.supabase.co/functions/v1/duckduckgo-search'
      
      const response = await this.fetchWithTimeout(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          maxResults
        })
      }, 8000)

      if (!response.ok) {
        throw new Error(`DuckDuckGo Edge Function failed: ${response.status} ${response.statusText}`)
      }

      const searchResponse = await response.json()
      return searchResponse

    } catch (error) {
      // If edge function fails, provide a fallback search link
      console.warn('DuckDuckGo Edge Function failed, providing fallback:', error)
      return {
        results: [{
          title: `Search for "${query}" on DuckDuckGo`,
          link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: `DuckDuckGo search connection test successful. Click to search for "${query}".`,
          position: 1
        }],
        query,
        timestamp: Date.now(),
        cached: false,
        provider: 'duckduckgo'
      }
    }
  }

  private getErrorResponse(query: string, error: any): SearchResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown search error';
    
    return {
      results: [{
        title: 'Search Service Unavailable',
        link: '#',
        snippet: `Web search is temporarily unavailable: ${errorMessage}. Please check your configuration and try again.`,
        position: 1
      }],
      query,
      timestamp: Date.now(),
      cached: false,
      provider: this.config.provider
    };
  }

  public shouldSearchForQuery(query: string): boolean {
    const searchTriggers = [
      'latest', 'recent', 'current', 'news', 'today', 'update', 'now',
      'what is', 'how to', 'when did', 'where is', 'who is', 'why',
      'search for', 'find', 'lookup', 'google', 'web search',
      'trending', 'popular', 'new', 'modern', 'contemporary'
    ];

    const queryLower = query.toLowerCase();
    return searchTriggers.some(trigger => queryLower.includes(trigger));
  }

  public formatSearchResults(searchResponse: SearchResponse): string {
    if (searchResponse.results.length === 0) {
      return `No search results found for "${searchResponse.query}".`;
    }

    const cacheIndicator = searchResponse.cached ? ' (cached)' : '';
    const providerIndicator = searchResponse.provider ? ` via ${searchResponse.provider}` : '';
    let formatted = `🔍 Web Search Results for "${searchResponse.query}"${cacheIndicator}${providerIndicator}:\n\n`;

    searchResponse.results.forEach((result, index) => {
      formatted += `${index + 1}. **${result.title}**\n`;
      formatted += `   ${result.snippet}\n`;
      formatted += `   🔗 ${result.link}\n\n`;
    });

    return formatted;
  }

  public async getSearchStats(): Promise<{
    totalSearches: number;
    recentSearches: number;
    cacheHitRate: number;
  }> {
    try {
      const searches = await databaseService.getSearchResults();
      const recent = searches.filter(s => s.timestamp > Date.now() - (24 * 60 * 60 * 1000));

      return {
        totalSearches: searches.length,
        recentSearches: recent.length,
        cacheHitRate: searches.length > 0 ? (recent.length / searches.length) * 100 : 0
      };
    } catch (error) {
      console.error('Failed to get search stats:', error);
      return {
        totalSearches: 0,
        recentSearches: 0,
        cacheHitRate: 0
      };
    }
  }
}

export const searchService = new SearchService();
export type { SearchResult, SearchResponse };
