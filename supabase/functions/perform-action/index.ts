import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type Action = {
  cooldownHours: number;
  room: string;
  sockEffects: Record<string, number>;
  sockFlags?: Record<string, boolean>;
  marketEffects: Record<string, number>;
  headlines: string[];
};

const ACTIONS: Record<string, Action> = {
  wash: { cooldownHours: 6, room: "bathroom",
    sockEffects: { cleanliness: +20, wetness: +10, smell: -15, chaos_level: -5 },
    marketEffects: { clean_sock: +8, wet_sock: +5, rotten_sock: -10 },
    headlines: ["washes the sock. Smell lobby furious.", "scrubs the sock clean. Rotten Sock investors panic.", "puts the sock through a spin cycle."] },
  soak: { cooldownHours: 4, room: "bathroom",
    sockEffects: { wetness: +40, cleanliness: +10 },
    marketEffects: { wet_sock: +15 },
    headlines: ["soaks the sock. Wetness critical.", "drowns the sock in lukewarm water."] },
  microwave: { cooldownHours: 12, room: "kitchen",
    sockEffects: { heat_damage: +35, intelligence: -20, chaos_level: +25 },
    marketEffects: { burnt_sock: +20, holy_sock: -15 },
    headlines: ["microwaves the sock. Smoke detected.", "nukes the sock for 90 seconds.", "ruins everyone's day in the kitchen."] },
  burn: { cooldownHours: 24, room: "garage",
    sockEffects: { heat_damage: +50, cleanliness: -30, chaos_level: +40 },
    sockFlags: { is_charred: true },
    marketEffects: { burnt_sock: +35, clean_sock: -20 },
    headlines: ["sets the sock on fire. Garage in chaos.", "torches the sock. Witnesses speechless.", "commits public arson."] },
  worship: { cooldownHours: 6, room: "shrine",
    sockEffects: { cult_influence: +20, aura: +15, intelligence: +5 },
    sockFlags: { is_glowing: true },
    marketEffects: { holy_sock: +12, evil_sock: +5 },
    headlines: ["worships the sock. Cult activity up 340%.", "leads a sermon at the shrine.", "kneels before the sock."] },
  toilet: { cooldownHours: 48, room: "bathroom",
    sockEffects: { cleanliness: -40, chaos_level: +30, smell: +35 },
    marketEffects: { rotten_sock: +25, luxury_sock: -30 },
    headlines: ["FLUSHES the sock. Luxury market collapses.", "throws the sock in the toilet. Mods alerted.", "commits the unforgivable."] },
  compliment: { cooldownHours: 2, room: "any",
    sockEffects: { emotional_stability: +10, aura: +5 },
    marketEffects: { holy_sock: +3 },
    headlines: ["says something nice to the sock.", "gives the sock emotional support.", "tells the sock it's doing great."] },
  freeze: { cooldownHours: 8, room: "kitchen",
    sockEffects: { wetness: +20, heat_damage: -10, emotional_stability: -15 },
    marketEffects: { wet_sock: +10 },
    headlines: ["freezes the sock solid.", "puts the sock in the icebox. Morale low."] },
  iron: { cooldownHours: 8, room: "kitchen",
    sockEffects: { cleanliness: +15, drip: +10, heat_damage: +10 },
    marketEffects: { luxury_sock: +5, clean_sock: +5 },
    headlines: ["irons the sock. Drip index up.", "presses the sock crisp."] },
  hide: { cooldownHours: 12, room: "garage",
    sockEffects: { chaos_level: +20, emotional_stability: -10 },
    marketEffects: {},
    headlines: ["hides the sock. Location classified.", "stashes the sock in the garage. Investors nervous."] },
  search: { cooldownHours: 6, room: "garage",
    sockEffects: { chaos_level: +5 },
    marketEffects: {},
    headlines: ["rummages through the garage."] },
  spreadRumor: { cooldownHours: 4, room: "computer_room",
    sockEffects: { chaos_level: +10 },
    marketEffects: {},
    headlines: ["spreads a market rumor. Source unverified.", "posts insider gossip online.", "starts a panic in the chat."] },
  offer: { cooldownHours: 12, room: "shrine",
    sockEffects: { cult_influence: +10, aura: +10 },
    marketEffects: { holy_sock: +8 },
    headlines: ["lays an offering at the shrine.", "tributes the sock. Cultists rejoice."] },
  ascend: { cooldownHours: 72, room: "shrine",
    sockEffects: { aura: +40, chaos_level: +30, cult_influence: +15 },
    sockFlags: { is_glowing: true },
    marketEffects: { holy_sock: +25, evil_sock: +15 },
    headlines: ["ASCENDS the sock. Reality wobbles.", "performs the ritual. Aura overload."] },
};

const FACTION_MULTIPLIERS: Record<string, Record<string, number>> = {
  washers: { wash: 0.5, soak: 0.5 },
  burners: { burn: 0.5, microwave: 0.5 },
  cultists: { worship: 0.5, offer: 0.5, ascend: 0.5 },
  traders: { spreadRumor: 0.25 },
  resistance: { hide: 0.5 },
  smell_society: { toilet: 0.5 },
};

const SOCK_TYPES = ["wet_sock","holy_sock","burnt_sock","clean_sock","luxury_sock","rotten_sock","military_sock","evil_sock"];

const GARAGE_ITEMS = [
  { flag: "has_glasses", headline: "found tiny sunglasses in the garage. Drip soars." },
  { flag: "has_crown", headline: "discovered a discarded crown. The sock is crowned." },
  { flag: "has_duct_tape", headline: "applied duct tape. Structural integrity restored." },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action_id, player_id, faction } = await req.json();

    const action = ACTIONS[action_id];
    if (!action) {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof player_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing player_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: actor } = await supabase
      .from("players").select("username, faction, actions_count, chaos_contributed").eq("id", player_id).maybeSingle();
    const actorUsername = actor?.username ?? "anon";
    const actorFaction = actor?.faction ?? faction ?? null;

    const multiplier = FACTION_MULTIPLIERS[actorFaction ?? ""]?.[action_id] ?? 1;
    const cooldownMs = action.cooldownHours * 3600000 * multiplier;
    const now = Date.now();

    const { data: cooldownRow } = await supabase
      .from("action_cooldowns").select("last_used")
      .eq("player_id", player_id).eq("action_id", action_id).maybeSingle();

    if (cooldownRow) {
      const remaining = cooldownMs - (now - new Date(cooldownRow.last_used).getTime());
      if (remaining > 0) {
        return new Response(JSON.stringify({ error: "COOLDOWN_ACTIVE", remainingMs: remaining }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: sock } = await supabase.from("sock").select("*").eq("id", 1).single();
    if (!sock) {
      return new Response(JSON.stringify({ error: "NO_SOCK" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates: Record<string, unknown> = {};
    for (const [stat, delta] of Object.entries(action.sockEffects)) {
      updates[stat] = Math.min(100, Math.max(0, (sock as Record<string, number>)[stat] + delta));
    }
    if (action.sockFlags) Object.assign(updates, action.sockFlags);

    let extraHeadline: string | null = null;
    if (action_id === "search" && Math.random() > 0.4) {
      const item = GARAGE_ITEMS[Math.floor(Math.random() * GARAGE_ITEMS.length)];
      updates[item.flag] = true;
      extraHeadline = item.headline;
    }

    updates.updated_at = new Date().toISOString();
    await supabase.from("sock").update(updates).eq("id", 1);

    for (const [sockType, delta] of Object.entries(action.marketEffects)) {
      const { data: row } = await supabase.from("market").select("price, price_history").eq("sock_type", sockType).single();
      if (row) {
        const newPrice = Math.max(1, Number(row.price) + delta + (Math.random() * 10 - 5));
        const history = (row.price_history || []) as number[];
        const newHistory = [...history.slice(-19), newPrice];
        await supabase.from("market").update({ price: newPrice, price_history: newHistory, updated_at: new Date().toISOString() }).eq("sock_type", sockType);
      }
    }

    if (action_id === "spreadRumor") {
      const target = SOCK_TYPES[Math.floor(Math.random() * SOCK_TYPES.length)];
      const delta = Math.random() > 0.5 ? 20 : -20;
      const { data: row } = await supabase.from("market").select("price, price_history").eq("sock_type", target).single();
      if (row) {
        const newPrice = Math.max(1, Number(row.price) + delta);
        const history = (row.price_history || []) as number[];
        await supabase.from("market").update({ price: newPrice, price_history: [...history.slice(-19), newPrice] }).eq("sock_type", target);
      }
    }

    const verb = action.headlines[Math.floor(Math.random() * action.headlines.length)];
    const headlineText = `${actorUsername} ${verb}`;
    await supabase.from("headlines").insert({
      text: headlineText, event_type: action_id,
      actor_username: actorUsername, actor_faction: actorFaction,
    });
    if (extraHeadline) {
      await supabase.from("headlines").insert({
        text: `${actorUsername} ${extraHeadline}`, event_type: "event",
        actor_username: actorUsername, actor_faction: actorFaction,
      });
    }

    await supabase.from("action_cooldowns").upsert({
      player_id, action_id, last_used: new Date().toISOString(),
    });

    // Bump player contribution stats
    const chaosDelta = Math.abs(action.sockEffects.chaos_level ?? 0) + Math.abs(action.sockEffects.heat_damage ?? 0);
    await supabase.from("players").update({
      actions_count: (actor?.actions_count ?? 0) + 1,
      chaos_contributed: (actor?.chaos_contributed ?? 0) + chaosDelta,
      last_seen: new Date().toISOString(),
    }).eq("id", player_id);

    // Shrine unlock detection
    if (typeof updates.cult_influence === "number" && updates.cult_influence >= 60 && sock.cult_influence < 60) {
      await supabase.from("headlines").insert({
        text: "Shrine door opens. Cultists enter. Market holds breath.",
        event_type: "global",
      });
      await supabase.from("global_events").insert({
        event_name: "Shrine Unlocked", description: "The shrine room has opened.",
      });
    }

    return new Response(JSON.stringify({ success: true, headline: headlineText }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
