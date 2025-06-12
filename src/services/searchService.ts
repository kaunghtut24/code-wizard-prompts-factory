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

  constructor() {
    this.loadConfiguration();
  }

  private async loadConfiguration(): Promise<void> {
    try {
      const provider = await databaseService.getUserSetting('search_provider', 'duckduckgo');
      const maxResults = await databaseService.getUserSetting('search_max_results', 5);
      const serpApiKey = await databaseService.getUserSetting('serpapi_key', '');
      const tavilyApiKey = await databaseService.getUserSetting('tavily_api_key', '');

      this.config = {
        provider,
        maxResults,
        serpApiKey: serpApiKey || undefined,
        tavilyApiKey: tavilyApiKey || undefined
      };

      console.log('Search service configured:', { 
        provider: this.config.provider,
        maxResults: this.config.maxResults,
        hasSerpKey: !!this.config.serpApiKey,
        hasTavilyKey: !!this.config.tavilyApiKey
      });
    } catch (error) {
      console.error('Failed to load search configuration:', error);
    }
  }

  public async configure(config: SearchConfiguration): Promise<void> {
    this.config = { ...config };
    console.log('Search service reconfigured:', this.config.provider);
  }

  public getApiKey(): string | null {
    if (this.config.provider === 'serpapi') {
      return this.config.serpApiKey || null;
    }
    if (this.config.provider === 'tavily') {
      return this.config.tavilyApiKey || null;
    }
    return null; // DuckDuckGo doesn't need API key
  }

  public async setApiKey(apiKey: string): Promise<void> {
    if (this.config.provider === 'serpapi') {
      this.config.serpApiKey = apiKey;
      await databaseService.setUserSetting('serpapi_key', apiKey);
    } else if (this.config.provider === 'tavily') {
      this.config.tavilyApiKey = apiKey;
      await databaseService.setUserSetting('tavily_api_key', apiKey);
    }
    console.log(`${this.config.provider} API key updated`);
  }

  public isConfigured(): boolean {
    if (this.config.provider === 'duckduckgo') {
      return true; // No API key needed
    }
    if (this.config.provider === 'serpapi') {
      return !!this.config.serpApiKey;
    }
    if (this.config.provider === 'tavily') {
      return !!this.config.tavilyApiKey;
    }
    return false;
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
    const { useCache = true, maxResults = this.config.maxResults, location = 'United States' } = options;

    console.log('Starting web search:', { 
      query, 
      provider: this.config.provider, 
      useCache, 
      maxResults 
    });

    if (useCache) {
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
        await databaseService.setCachedSearch(query, result.results);
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
      throw new Error(`SerpApi request failed: ${response.status}`);
    }

    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);

    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }

    const results: SearchResult[] = (data.organic_results || [])
      .slice(0, maxResults)
      .map((result: any, index: number) => ({
        title: result.title || '',
        link: result.link || '',
        snippet: result.snippet || '',
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
      throw new Error(`Tavily request failed: ${response.status}`);
    }

    const data = await response.json();

    const results: SearchResult[] = (data.results || [])
      .slice(0, maxResults)
      .map((result: any, index: number) => ({
        title: result.title || '',
        link: result.url || '',
        snippet: result.content || '',
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
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await this.fetchWithTimeout(`${this.proxyUrl}${encodeURIComponent(ddgUrl)}`);

    if (!response.ok) {
      throw new Error(`DuckDuckGo request failed: ${response.status}`);
    }

    const proxyData = await response.json();
    const data = JSON.parse(proxyData.contents);

    const results: SearchResult[] = [];

    if (data.Abstract && data.AbstractText) {
      results.push({
        title: data.Heading || 'Instant Answer',
        link: data.AbstractURL || '#',
        snippet: data.AbstractText,
        position: 1
      });
    }

    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, maxResults - 1).forEach((topic: any, index: number) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Related Topic',
            link: topic.FirstURL,
            snippet: topic.Text,
            position: index + 2
          });
        }
      });
    }

    return {
      results: results.slice(0, maxResults),
      query,
      timestamp: Date.now(),
      cached: false,
      provider: 'duckduckgo'
    };
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
