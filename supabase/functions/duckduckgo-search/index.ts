import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  timestamp: number;
  cached: boolean;
  provider: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, maxResults = 5 } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('DuckDuckGo search request:', { query, maxResults })

    // Make request to DuckDuckGo API
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    
    const response = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SearchBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`DuckDuckGo API responded with status: ${response.status}`)
    }

    const data = await response.json()
    const results: SearchResult[] = []

    // Process DuckDuckGo instant answers
    if (data.Abstract && data.AbstractText) {
      results.push({
        title: data.Heading || 'Instant Answer',
        link: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: data.AbstractText,
        position: 1
      })
    }

    // Process related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, Math.max(1, maxResults - 1)).forEach((topic: any, index: number) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Related Topic',
            link: topic.FirstURL,
            snippet: topic.Text,
            position: index + 2
          })
        }
      })
    }

    // If no results, provide a fallback
    if (results.length === 0) {
      results.push({
        title: `Search results for "${query}"`,
        link: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: `No instant answers found. Click to search on DuckDuckGo for "${query}".`,
        position: 1
      })
    }

    const searchResponse: SearchResponse = {
      results: results.slice(0, maxResults),
      query,
      timestamp: Date.now(),
      cached: false,
      provider: 'duckduckgo'
    }

    console.log('DuckDuckGo search completed:', { resultCount: searchResponse.results.length })

    return new Response(
      JSON.stringify(searchResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('DuckDuckGo search error:', error)
    
    // Return fallback response
    const fallbackResponse: SearchResponse = {
      results: [{
        title: 'Search Service Unavailable',
        link: '#',
        snippet: `DuckDuckGo search is temporarily unavailable: ${error.message}. Please try again later.`,
        position: 1
      }],
      query: 'unknown',
      timestamp: Date.now(),
      cached: false,
      provider: 'duckduckgo'
    }

    return new Response(
      JSON.stringify(fallbackResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})