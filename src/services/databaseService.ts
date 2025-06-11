
import { supabaseDatabaseService } from './supabaseDatabaseService';

// Re-export the Supabase database service as the main database service
export const databaseService = supabaseDatabaseService;
export type { ConversationEntry, SearchResult } from './supabaseDatabaseService';

// For backward compatibility, we'll also export the old interface types
export type { SupabaseConversationEntry as ConversationEntry } from './supabaseDatabaseService';
