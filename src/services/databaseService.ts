
import { supabaseDatabaseService } from './supabaseDatabaseService';

// Re-export the Supabase database service as the main database service
export const databaseService = supabaseDatabaseService;
export type { ConversationEntry } from './supabaseDatabaseService';
