
-- Enable vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- Create conversations table for persistent chat history
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_input TEXT NOT NULL,
  ai_output TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prompts table for storing custom prompts
CREATE TABLE public.custom_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  prompt_name TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, agent_type, prompt_name)
);

-- Create embeddings table for semantic search (RAG)
CREATE TABLE public.embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'conversation', 'prompt', 'document'
  source_id UUID, -- references to conversations.id, custom_prompts.id, etc.
  embedding vector(1536), -- OpenAI embedding size
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search results cache table
CREATE TABLE public.search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  query_hash TEXT NOT NULL,
  query TEXT NOT NULL,
  results JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, query_hash)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for conversations
CREATE POLICY "Users can manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for custom_prompts
CREATE POLICY "Users can manage own prompts" ON public.custom_prompts
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for embeddings
CREATE POLICY "Users can manage own embeddings" ON public.embeddings
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for search_cache
CREATE POLICY "Users can manage own search cache" ON public.search_cache
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_agent_type ON public.conversations(agent_type);
CREATE INDEX idx_custom_prompts_user_id ON public.custom_prompts(user_id);
CREATE INDEX idx_custom_prompts_agent_type ON public.custom_prompts(agent_type);
CREATE INDEX idx_embeddings_user_id ON public.embeddings(user_id);
CREATE INDEX idx_embeddings_content_type ON public.embeddings(content_type);
CREATE INDEX idx_search_cache_user_id ON public.search_cache(user_id);
CREATE INDEX idx_search_cache_expires_at ON public.search_cache(expires_at);

-- Create vector similarity search index
CREATE INDEX idx_embeddings_cosine ON public.embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to clean expired search cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_search_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.search_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
