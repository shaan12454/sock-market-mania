import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type GEvent = {
  name: string;
  description: string;
  sockEffects: Record<string, number>;
  sockFlags?: Record<string, boolean>;
  marketEffects: Record<string, number> | "ALL:-20";
};

const GLOBAL_EVENTS: GEvent[] = [
  {
    name: "Mold Outbreak", description: "Mold detected. Cleanliness market collapses.",
    sockEffects: { cleanliness: -20 }, sockFlags: { has_mold: true },
    marketEffects: { clean_sock: -25, rotten_sock: +20 },
  },
  {
    name: "Anonymous Donation", description: "Unknown entity gifts the sock a crown. Drip explodes.",
    sockEffects: { drip: +30 }, sockFlags: { has_crown: true },
    marketEffects: { luxury_sock: +25 },
  },
  { name: "Market Crash", description: "All sock stocks drop 20%. Traders weep.", sockEffects: {}, marketEffects: "ALL:-20" },
  {
    name: "Holy Vision", description: "Sock emits light briefly. Cultists claim responsibility.",
    sockEffects: { cult_influence: +15, aura: +20 }, sockFlags: { is_glowing: true },
    marketEffects: { holy_sock: +30 },
  },
  {
    name: "Smell Event", description: "Smell reaches critical levels. Evacuation recommended.",
    sockEffects: { smell: +30, chaos_level: +15 },
    marketEffects: { rotten_sock: +15 },
  },
  {
    name: "Sunglasses Incident", description: "Sock receives tiny sunglasses. Origin unclear. Drip historic.",
    sockEffects: { drip: +40, aura: +15 }, sockFlags: { has_glasses: true },
    marketEffects: { luxury_sock: +20, evil_sock: +10 },
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (authHeader !== "Bearer sock-market-mania-cron-key-1337") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Skip 70% of the time when called frequently
  const { force } = await req.json().catch(() => ({ force: false }));
  if (!force && Math.random() > 0.3) {
    return new Response(JSON.stringify({ skipped: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const event = GLOBAL_EVENTS[Math.floor(Math.random() * GLOBAL_EVENTS.length)];

  const { data: sock } = await supabase.from("sock").select("*").eq("id", 1).single();
  if (!sock) return new Response("no sock", { status: 500, headers: corsHeaders });

  const updates: Record<string, unknown> = {};
  for (const [stat, delta] of Object.entries(event.sockEffects)) {
    updates[stat] = Math.min(100, Math.max(0, (sock as Record<string, number>)[stat] + delta));
  }
  if (event.sockFlags) Object.assign(updates, event.sockFlags);
  if (Object.keys(updates).length) {
    updates.updated_at = new Date().toISOString();
    await supabase.from("sock").update(updates).eq("id", 1);
  }

  if (event.marketEffects === "ALL:-20") {
    const { data: allMarket } = await supabase.from("market").select("*");
    for (const row of allMarket || []) {
      const newPrice = Math.max(1, Number(row.price) * 0.8);
      const history = (row.price_history || []) as number[];
      await supabase.from("market").update({
        price: newPrice, price_history: [...history.slice(-19), newPrice],
      }).eq("sock_type", row.sock_type);
    }
  } else {
    for (const [sockType, delta] of Object.entries(event.marketEffects)) {
      const { data: row } = await supabase.from("market").select("price, price_history").eq("sock_type", sockType).single();
      if (row) {
        const newPrice = Math.max(1, Number(row.price) + delta);
        const history = (row.price_history || []) as number[];
        await supabase.from("market").update({
          price: newPrice, price_history: [...history.slice(-19), newPrice],
        }).eq("sock_type", sockType);
      }
    }
  }

  await supabase.from("global_events").insert({ event_name: event.name, description: event.description });
  await supabase.from("headlines").insert({
    text: `GLOBAL EVENT: ${event.description}`, event_type: "global",
  });

  return new Response(JSON.stringify({ triggered: event.name }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
