-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Safely add portfolios to supabase_realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'portfolios'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolios;
  END IF;
END $$;

-- Schedule market-tick-cron-00 (0s offset)
SELECT cron.schedule(
  'market-tick-cron-00',
  '* * * * *',
  $cron$
  DO $do$
  BEGIN
    PERFORM net.http_post(
      url := 'https://jjnrcjqpkybzuwjbeqft.supabase.co/functions/v1/market-tick',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sock-market-mania-cron-key-1337"}'::jsonb,
      body := '{}'::jsonb
    );
    PERFORM net.http_post(
      url := 'https://jjnrcjqpkybzuwjbeqft.supabase.co/functions/v1/trigger-global-event',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sock-market-mania-cron-key-1337"}'::jsonb,
      body := '{}'::jsonb
    );
  END $do$;
  $cron$
);

-- Schedule market-tick-cron-20 (20s offset)
SELECT cron.schedule(
  'market-tick-cron-20',
  '* * * * *',
  $cron$
  DO $do$
  BEGIN
    PERFORM pg_sleep(20);
    PERFORM net.http_post(
      url := 'https://jjnrcjqpkybzuwjbeqft.supabase.co/functions/v1/market-tick',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sock-market-mania-cron-key-1337"}'::jsonb,
      body := '{}'::jsonb
    );
    PERFORM net.http_post(
      url := 'https://jjnrcjqpkybzuwjbeqft.supabase.co/functions/v1/trigger-global-event',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sock-market-mania-cron-key-1337"}'::jsonb,
      body := '{}'::jsonb
    );
  END $do$;
  $cron$
);

-- Schedule market-tick-cron-40 (40s offset)
SELECT cron.schedule(
  'market-tick-cron-40',
  '* * * * *',
  $cron$
  DO $do$
  BEGIN
    PERFORM pg_sleep(40);
    PERFORM net.http_post(
      url := 'https://jjnrcjqpkybzuwjbeqft.supabase.co/functions/v1/market-tick',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sock-market-mania-cron-key-1337"}'::jsonb,
      body := '{}'::jsonb
    );
    PERFORM net.http_post(
      url := 'https://jjnrcjqpkybzuwjbeqft.supabase.co/functions/v1/trigger-global-event',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sock-market-mania-cron-key-1337"}'::jsonb,
      body := '{}'::jsonb
    );
  END $do$;
  $cron$
);
