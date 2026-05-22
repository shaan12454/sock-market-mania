
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'sock-market-tick',
  '20 seconds',
  $$
  SELECT net.http_post(
    url := 'https://jjnrcjqpkybzuwjbeqft.supabase.co/functions/v1/market-tick',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer sock-market-mania-cron-key-1337"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'sock-global-event',
  '20 seconds',
  $$
  SELECT net.http_post(
    url := 'https://jjnrcjqpkybzuwjbeqft.supabase.co/functions/v1/trigger-global-event',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer sock-market-mania-cron-key-1337"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
