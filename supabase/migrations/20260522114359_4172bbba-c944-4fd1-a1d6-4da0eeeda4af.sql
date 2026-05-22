
-- Player stats for leaderboards
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS actions_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS chaos_contributed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_profit numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_seen timestamptz NOT NULL DEFAULT now();

-- Attribute headlines to a player
ALTER TABLE public.headlines
  ADD COLUMN IF NOT EXISTS actor_username text,
  ADD COLUMN IF NOT EXISTS actor_faction text;

-- Chat / shoutbox
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id bigserial PRIMARY KEY,
  player_id uuid,
  username text NOT NULL,
  faction text,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 200),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx
  ON public.chat_messages (created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read chat" ON public.chat_messages;
CREATE POLICY "public read chat" ON public.chat_messages
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "anon insert chat" ON public.chat_messages;
CREATE POLICY "anon insert chat" ON public.chat_messages
  FOR INSERT TO public WITH CHECK (
    char_length(text) BETWEEN 1 AND 200
    AND char_length(username) BETWEEN 1 AND 24
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
