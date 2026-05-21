
-- THE GLOBAL SOCK
CREATE TABLE public.sock (
  id INTEGER PRIMARY KEY DEFAULT 1,
  cleanliness INTEGER DEFAULT 34 CHECK (cleanliness BETWEEN 0 AND 100),
  wetness INTEGER DEFAULT 12 CHECK (wetness BETWEEN 0 AND 100),
  smell INTEGER DEFAULT 67 CHECK (smell BETWEEN 0 AND 100),
  heat_damage INTEGER DEFAULT 28 CHECK (heat_damage BETWEEN 0 AND 100),
  aura INTEGER DEFAULT 45 CHECK (aura BETWEEN 0 AND 100),
  intelligence INTEGER DEFAULT 71 CHECK (intelligence BETWEEN 0 AND 100),
  emotional_stability INTEGER DEFAULT 39 CHECK (emotional_stability BETWEEN 0 AND 100),
  cult_influence INTEGER DEFAULT 22 CHECK (cult_influence BETWEEN 0 AND 100),
  chaos_level INTEGER DEFAULT 58 CHECK (chaos_level BETWEEN 0 AND 100),
  radiation INTEGER DEFAULT 5 CHECK (radiation BETWEEN 0 AND 100),
  drip INTEGER DEFAULT 41 CHECK (drip BETWEEN 0 AND 100),
  has_glasses BOOLEAN DEFAULT false,
  has_crown BOOLEAN DEFAULT false,
  is_charred BOOLEAN DEFAULT false,
  has_mold BOOLEAN DEFAULT false,
  has_duct_tape BOOLEAN DEFAULT false,
  is_glowing BOOLEAN DEFAULT false,
  age_days INTEGER DEFAULT 112,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.sock (id) VALUES (1);

CREATE TABLE public.market (
  sock_type TEXT PRIMARY KEY,
  price NUMERIC(10,2) NOT NULL,
  price_history NUMERIC[] DEFAULT ARRAY[]::NUMERIC[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO public.market (sock_type, price, price_history) VALUES
  ('wet_sock', 142, ARRAY[110,125,130,142]::NUMERIC[]),
  ('holy_sock', 89, ARRAY[95,91,88,89]::NUMERIC[]),
  ('burnt_sock', 203, ARRAY[180,190,195,203]::NUMERIC[]),
  ('clean_sock', 67, ARRAY[80,74,70,67]::NUMERIC[]),
  ('luxury_sock', 310, ARRAY[290,300,305,310]::NUMERIC[]),
  ('rotten_sock', 55, ARRAY[60,58,56,55]::NUMERIC[]),
  ('military_sock', 178, ARRAY[170,172,175,178]::NUMERIC[]),
  ('evil_sock', 421, ARRAY[350,380,400,421]::NUMERIC[]);

CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE,
  faction TEXT CHECK (faction IN ('washers','burners','traders','cultists','resistance','smell_society')),
  sock_coins NUMERIC(12,2) DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.portfolios (
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  sock_type TEXT REFERENCES public.market(sock_type),
  shares INTEGER DEFAULT 0,
  PRIMARY KEY (player_id, sock_type)
);

CREATE TABLE public.action_cooldowns (
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,
  last_used TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (player_id, action_id)
);

CREATE TABLE public.headlines (
  id BIGSERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  event_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.global_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  description TEXT,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.headlines (text, event_type) VALUES
  ('DAY 1: Sock discovered. Origin unknown. Market opens.', 'lore'),
  ('DAY 3: First washing incident. Smell lobby protests outside browser.', 'action'),
  ('DAY 7: Sock crowned briefly. Crown falls off. Market unaffected.', 'event'),
  ('DAY 12: Radiation levels detected. Source: unknown microwave event.', 'chaos'),
  ('DAY 19: Cult activity first observed. Only 3 members. Authorities unconcerned.', 'lore'),
  ('DAY 24: Sock makes first public statement. Statement was: [static]', 'lore'),
  ('DAY 31: Great Toilet Incident. Luxury Sock never recovered.', 'chaos'),
  ('DAY 45: Burnt Sock hits all-time high. Arsonist still at large.', 'market'),
  ('DAY 52: Sock given tiny sunglasses by anonymous donor. Drip index explodes.', 'event'),
  ('DAY 60: Cult membership: 847. Authorities now concerned.', 'lore'),
  ('DAY 71: Sock goes missing for 6 hours. Found in garage. No comment.', 'chaos'),
  ('DAY 80: Intelligence drops to 44 following microwave incident #3.', 'action'),
  ('DAY 91: Holy Sock investors hold emergency summit.', 'market'),
  ('DAY 103: Smell Preservation Society publishes 40-page manifesto.', 'lore'),
  ('DAY 112: You are here.', 'lore');

ALTER PUBLICATION supabase_realtime ADD TABLE public.sock;
ALTER PUBLICATION supabase_realtime ADD TABLE public.market;
ALTER PUBLICATION supabase_realtime ADD TABLE public.headlines;
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_events;

ALTER TABLE public.sock REPLICA IDENTITY FULL;
ALTER TABLE public.market REPLICA IDENTITY FULL;

ALTER TABLE public.sock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.headlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_cooldowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read sock" ON public.sock FOR SELECT USING (true);
CREATE POLICY "public read market" ON public.market FOR SELECT USING (true);
CREATE POLICY "public read headlines" ON public.headlines FOR SELECT USING (true);
CREATE POLICY "public read events" ON public.global_events FOR SELECT USING (true);

-- Anonymous players: allow anyone to insert/select players (no auth in this game)
CREATE POLICY "anon read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "anon insert players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "anon read portfolios" ON public.portfolios FOR SELECT USING (true);
CREATE POLICY "anon read cooldowns" ON public.action_cooldowns FOR SELECT USING (true);
