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
  wash: {
    cooldownHours: 6, room: "bathroom",
    sockEffects: { cleanliness: +20, wetness: +10, smell: -15, chaos_level: -5 },
    marketEffects: { clean_sock: +8, wet_sock: +5, rotten_sock: -10 },
    headlines: [
      "Sock enters washing machine willingly.",
      "Anonymous user washes sock. Smell lobby furious.",
      "Cleanliness rises. Rotten Sock investors panic.",
    ],
  },
  soak: {
    cooldownHours: 4, room: "bathroom",
    sockEffects: { wetness: +40, cleanliness: +10 },
    marketEffects: { wet_sock: +15 },
    headlines: ["Sock soaked for extended period. Wetness critical.", "Bath incident reported. No casualties."],
  },
  microwave: {
    cooldownHours: 12, room: "kitchen",
    sockEffects: { heat_damage: +35, intelligence: -20, chaos_level: +25 },
    marketEffects: { burnt_sock: +20, holy_sock: -15 },
    headlines: [
      "Sock microwaved by unknown assailant.",
      "Intelligence stat drops following microwave incident.",
      "Burnt Sock investors rejoice. Everyone else concerned.",
    ],
  },
  burn: {
    cooldownHours: 24, room: "garage",
    sockEffects: { heat_damage: +50, cleanliness: -30, chaos_level: +40 },
    sockFlags: { is_charred: true },
    marketEffects: { burnt_sock: +35, clean_sock: -20 },
    headlines: [
      "Garage fire incident. Investigators baffled.",
      "Sock burns. Burners faction celebrates.",
      "Arson suspected. Arsonist unavailable for comment.",
    ],
  },
  worship: {
    cooldownHours: 6, room: "shrine",
    sockEffects: { cult_influence: +20, aura: +15, intelligence: +5 },
    sockFlags: { is_glowing: true },
    marketEffects: { holy_sock: +12, evil_sock: +5 },
    headlines: [
      "Cult activity up 340% this quarter.",
      "Sock ascends briefly. Market freezes.",
      "Third sermon this week. Authorities concerned.",
    ],
  },
  toilet: {
    cooldownHours: 48, room: "bathroom",
    sockEffects: { cleanliness: -40, chaos_level: +30, smell: +35 },
    marketEffects: { rotten_sock: +25, luxury_sock: -30 },
    headlines: [
      "Sock thrown in toilet. Luxury market collapses.",
      "Unnamed investor charged after toilet incident.",
      "Rotten Sock investors celebrate. Everyone else horrified.",
    ],
  },
  compliment: {
    cooldownHours: 2, room: "any",
    sockEffects: { emotional_stability: +10, aura: +5 },
    marketEffects: { holy_sock: +3 },
    headlines: ["Someone says something nice to the sock.", "Sock emotional stability improves slightly."],
  },
  freeze: {
    cooldownHours: 8, room: "kitchen",
    sockEffects: { wetness: +20, heat_damage: -10, emotional_stability: -15 },
    marketEffects: { wet_sock: +10 },
    headlines: ["Sock placed in freezer. Emotional damage noted.", "Freezer incident. Heat damage reduced. Morale low."],
  },
  iron: {
    cooldownHours: 8, room: "kitchen",
    sockEffects: { cleanliness: +15, drip: +10, heat_damage: +10 },
    marketEffects: { luxury_sock: +5, clean_sock: +5 },
    headlines: ["Sock ironed. Wrinkles vanish.", "Drip index up after pressing."],
  },
  hide: {
    cooldownHours: 12, room: "garage",
    sockEffects: { chaos_level: +20, emotional_stability: -10 },
    marketEffects: {},
    headlines: ["Sock hidden. Location classified.", "Sock goes missing again. Investors nervous."],
  },
  search: {
    cooldownHours: 6, room: "garage",
    sockEffects: { chaos_level: +5 },
    marketEffects: {},
    headlines: ["Garage search uncovers mysterious item."],
  },
  spreadRumor: {
    cooldownHours: 4, room: "computer_room",
    sockEffects: { chaos_level: +10 },
    marketEffects: {},
    headlines: [
      "Market rumor spreads. Source unverified.",
      "Anonymous tip causes market volatility.",
      "Insider trading suspected. Nobody arrested.",
    ],
  },
  offer: {
    cooldownHours: 12, room: "shrine",
    sockEffects: { cult_influence: +10, aura: +10 },
    marketEffects: { holy_sock: +8 },
    headlines: ["Offering placed at shrine. Sock acknowledges.", "Cultists rejoice. Markets twitch."],
  },
  ascend: {
    cooldownHours: 72, room: "shrine",
    sockEffects: { aura: +40, chaos_level: +30, cult_influence: +15 },
    sockFlags: { is_glowing: true },
    marketEffects: { holy_sock: +25, evil_sock: +15 },
    headlines: ["THE SOCK ASCENDS. Witnesses speechless.", "Aura overload. Reality wobbles."],
  },
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
  { flag: "has_glasses", headline: "Sock finds tiny sunglasses in garage. Drip soars." },
  { flag: "has_crown", headline: "Discarded crown discovered. Sock crowned." },
  { flag: "has_duct_tape", headline: "Duct tape applied. Structural integrity restored." },
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

    const multiplier = FACTION_MULTIPLIERS[faction]?.[action_id] ?? 1;
    const cooldownMs = action.cooldownHours * 3600000 * multiplier;
    const now = Date.now();

    const { data: cooldownRow } = await supabase
      .from("action_cooldowns")
      .select("last_used")
      .eq("player_id", player_id)
      .eq("action_id", action_id)
      .maybeSingle();

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

    // Search: random item find
    let extraHeadline: string | null = null;
    if (action_id === "search" && Math.random() > 0.4) {
      const item = GARAGE_ITEMS[Math.floor(Math.random() * GARAGE_ITEMS.length)];
      updates[item.flag] = true;
      extraHeadline = item.headline;
    }

    updates.updated_at = new Date().toISOString();
    await supabase.from("sock").update(updates).eq("id", 1);

    for (const [sockType, delta] of Object.entries(action.marketEffects)) {
      const { data: row } = await supabase
        .from("market")
        .select("price, price_history")
        .eq("sock_type", sockType)
        .single();
      if (row) {
        const newPrice = Math.max(1, Number(row.price) + delta + (Math.random() * 10 - 5));
        const history = (row.price_history || []) as number[];
        const newHistory = [...history.slice(-19), newPrice];
        await supabase
          .from("market")
          .update({ price: newPrice, price_history: newHistory, updated_at: new Date().toISOString() })
          .eq("sock_type", sockType);
      }
    }

    if (action_id === "spreadRumor") {
      const target = SOCK_TYPES[Math.floor(Math.random() * SOCK_TYPES.length)];
      const delta = Math.random() > 0.5 ? 20 : -20;
      const { data: row } = await supabase.from("market").select("price, price_history").eq("sock_type", target).single();
      if (row) {
        const newPrice = Math.max(1, Number(row.price) + delta);
        const history = (row.price_history || []) as number[];
        const newHistory = [...history.slice(-19), newPrice];
        await supabase.from("market").update({ price: newPrice, price_history: newHistory }).eq("sock_type", target);
      }
    }

    const headline = action.headlines[Math.floor(Math.random() * action.headlines.length)];
    await supabase.from("headlines").insert({ text: headline, event_type: action_id });
    if (extraHeadline) {
      await supabase.from("headlines").insert({ text: extraHeadline, event_type: "event" });
    }

    await supabase.from("action_cooldowns").upsert({
      player_id,
      action_id,
      last_used: new Date().toISOString(),
    });

    // Shrine unlock detection
    if (typeof updates.cult_influence === "number" && updates.cult_influence >= 60 && sock.cult_influence < 60) {
      await supabase.from("headlines").insert({
        text: "Shrine door opens. Cultists enter. Market holds breath.",
        event_type: "global",
      });
      await supabase.from("global_events").insert({
        event_name: "Shrine Unlocked",
        description: "The shrine room has opened.",
      });
    }

    return new Response(JSON.stringify({ success: true, headline }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
