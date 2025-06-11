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
  private readonly proxyUrl = 'https://api.allorigins.win/get?url=';
  private readonly requestTimeout = 10000;

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey(): Promise<void> {
    try {
      this.apiKey = await databaseService.getUserSetting('serpapi_key', null);
      console.log('SerpApi key loaded:', !!this.apiKey);
    } catch (error) {
      console.error('Failed to load API key:', error);
      this.apiKey = null;
    }
  }

  public getApiKey(): string | null {
    return this.apiKey;
  }

  public async setApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    await databaseService.setUserSetting('serpapi_key', apiKey);
    console.log('SerpApi key updated');
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async fetchWithTimeout(url: string, timeoutMs: number = this.requestTimeout): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const headers: HeadersInit = { 'Accept': 'application/json' };
    if (!url.includes('allorigins')) {
      headers['Cache-Control'] = 'no-cache';
    }

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers
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
    const { useCache = true, maxResults = 10, location = 'United States' } = options;

    console.log('Starting web search:', { query, useCache, maxResults });

    if (useCache) {
      const cachedResult = await databaseService.getCachedSearch(query);
      if (cachedResult) {
        console.log('Using cached search result');
        return {
          results: cachedResult.slice(0, maxResults),
          query,
          timestamp: Date.now(),
          cached: true
        };
      }
    }

    if (!this.isConfigured()) {
      throw new Error('SerpApi key not configured. Please set your API key in settings.');
    }

    try {
      const result = await this.performSerpApiSearch(query, maxResults, location);
      await databaseService.setCachedSearch(query, result.results);
      console.log('Web search completed:', { resultCount: result.results.length });
      return result;
    } catch (error) {
      console.error('Primary search failed:', error);

      if (error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('408') ||
        error.message.includes('Proxy error')
      )) {
        console.log('Attempting fallback search due to timeout...');
        return this.fallbackSearch(query, maxResults);
      }

      throw error;
    }
  }

  private async performSerpApiSearch(query: string, maxResults: number, location: string): Promise<SearchResponse> {
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: this.apiKey!,
      num: maxResults.toString(),
      location,
      hl: 'en',
      gl: 'us'
    });

    const targetUrl = `https://serpapi.com/search.json?${params}`;

    const proxyUrls = [
      `${this.proxyUrl}${encodeURIComponent(targetUrl)}`,
      targetUrl // direct (likely to fail CORS but try anyway)
    ];

    let lastError: Error | null = null;

    for (const proxyUrl of proxyUrls) {
      try {
        console.log('Attempting search with URL:',
          proxyUrl.includes('allorigins') ? 'allorigins proxy' : 'direct');

        const response = await this.fetchWithTimeout(proxyUrl, 8000);

        if (!response.ok) {
          if (response.status === 408) {
            throw new Error('Request timeout - server took too long to respond');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let data;
        if (proxyUrl.includes('allorigins')) {
          const proxyData = await response.json();
          if (!proxyData.contents) {
            throw new Error('No data received from proxy');
          }
          data = JSON.parse(proxyData.contents);
        } else {
          data = await response.json();
        }

        if (data.error) {
          if (data.error.includes('Invalid API key')) {
            throw new Error('Invalid SerpApi key. Please check your API key configuration.');
          }
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

        return {
          results,
          query,
          timestamp: Date.now(),
          cached: false
        };

      } catch (error) {
        lastError = error as Error;
        console.log(`Proxy attempt failed: ${lastError.message}`);
        continue;
      }
    }

    throw lastError || new Error('All search attempts failed');
  }

  private async fallbackSearch(query: string, maxResults: number): Promise<SearchResponse> {
    console.log('Using fallback search method...');

    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const response = await this.fetchWithTimeout(`${this.proxyUrl}${encodeURIComponent(ddgUrl)}`, 5000);

      if (!response.ok) {
        throw new Error(`Fallback search failed: ${response.status}`);
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

      console.log('Fallback search completed:', { resultCount: results.length });

      return {
        results: results.slice(0, maxResults),
        query,
        timestamp: Date.now(),
        cached: false
      };

    } catch (fallbackError) {
      console.error('Fallback search failed:', fallbackError);

      return {
        results: [{
          title: 'Search Service Unavailable',
          link: '#',
          snippet: 'Web search is temporarily unavailable due to network issues. Please check your internet connection and API configuration, then try again later.',
          position: 1
        }],
        query,
        timestamp: Date.now(),
        cached: false
      };
    }
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
    let formatted = `🔍 Web Search Results for "${searchResponse.query}"${cacheIndicator}:\n\n`;

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
