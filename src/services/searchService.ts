
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
}

class SearchService {
  private apiKey: string | null = null;
  private readonly baseUrl = 'https://serpapi.com/search.json';

  constructor() {
    this.loadApiKey();
  }

  private loadApiKey(): void {
    this.apiKey = databaseService.getUserPreference('serpapi_key', null);
    console.log('SerpApi key loaded:', !!this.apiKey);
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    databaseService.setUserPreference('serpapi_key', apiKey);
    console.log('SerpApi key updated');
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async search(query: string, options: {
    useCache?: boolean;
    maxResults?: number;
    location?: string;
  } = {}): Promise<SearchResponse> {
    const { useCache = true, maxResults = 10, location = 'United States' } = options;

    console.log('Starting web search:', { query, useCache, maxResults });

    // Check cache first if enabled
    if (useCache) {
      const cachedResult = databaseService.getRecentSearchResult(query, 30);
      if (cachedResult) {
        console.log('Using cached search result');
        return {
          results: cachedResult.results.slice(0, maxResults),
          query,
          timestamp: cachedResult.timestamp,
          cached: true
        };
      }
    }

    if (!this.isConfigured()) {
      throw new Error('SerpApi key not configured. Please set your API key in settings.');
    }

    try {
      const params = new URLSearchParams({
        engine: 'google',
        q: query,
        api_key: this.apiKey!,
        num: maxResults.toString(),
        location: location,
        hl: 'en',
        gl: 'us'
      });

      const response = await fetch(`${this.baseUrl}?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid SerpApi key. Please check your API key configuration.');
        }
        throw new Error(`Search API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Search API error: ${data.error}`);
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

      // Save to cache
      databaseService.saveSearchResult(query, results);

      console.log('Web search completed:', { resultCount: results.length });

      return {
        results,
        query,
        timestamp: Date.now(),
        cached: false
      };

    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  public shouldSearchForQuery(query: string): boolean {
    const searchTriggers = [
      'latest', 'recent', 'current', 'news', 'today', 'update',
      'what is', 'how to', 'when did', 'where is', 'who is',
      'search for', 'find', 'lookup', 'google', 'web search'
    ];

    const queryLower = query.toLowerCase();
    return searchTriggers.some(trigger => queryLower.includes(trigger));
  }

  public formatSearchResults(searchResponse: SearchResponse): string {
    if (searchResponse.results.length === 0) {
      return `No search results found for "${searchResponse.query}".`;
    }

    const cacheIndicator = searchResponse.cached ? ' (cached)' : '';
    let formatted = `🔍 Web Search Results for "${searchResponse.query}"${cacheIndicator}:\n\n`;

    searchResponse.results.forEach((result, index) => {
      formatted += `${index + 1}. **${result.title}**\n`;
      formatted += `   ${result.snippet}\n`;
      formatted += `   🔗 ${result.link}\n\n`;
    });

    return formatted;
  }

  public getSearchStats(): {
    totalSearches: number;
    recentSearches: number;
    cacheHitRate: number;
  } {
    const searches = databaseService.getSearchResults();
    const recent = searches.filter(s => s.timestamp > Date.now() - (24 * 60 * 60 * 1000));
    
    return {
      totalSearches: searches.length,
      recentSearches: recent.length,
      cacheHitRate: searches.length > 0 ? (recent.length / searches.length) * 100 : 0
    };
  }
}

export const searchService = new SearchService();
export type { SearchResult, SearchResponse };
