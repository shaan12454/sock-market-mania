import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { player_id, sock_type, quantity, direction } = await req.json();

    if (
      typeof player_id !== "string" ||
      typeof sock_type !== "string" ||
      typeof quantity !== "number" ||
      quantity <= 0 ||
      !["buy", "sell"].includes(direction)
    ) {
      return new Response(JSON.stringify({ error: "INVALID_INPUT" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const qty = Math.floor(quantity);

    const { data: market } = await supabase.from("market").select("price, price_history").eq("sock_type", sock_type).single();
    if (!market) {
      return new Response(JSON.stringify({ error: "Unknown sock type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const price = Number(market.price);
    const totalCost = price * qty;

    const { data: player } = await supabase.from("players").select("sock_coins").eq("id", player_id).single();
    if (!player) {
      return new Response(JSON.stringify({ error: "Player not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (direction === "buy") {
      if (Number(player.sock_coins) < totalCost) {
        return new Response(JSON.stringify({ error: "BROKE", message: "Insufficient Sock Coins" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase.from("players").update({ sock_coins: Number(player.sock_coins) - totalCost }).eq("id", player_id);
      const { data: existing } = await supabase
        .from("portfolios").select("shares")
        .eq("player_id", player_id).eq("sock_type", sock_type).maybeSingle();
      await supabase.from("portfolios").upsert({
        player_id, sock_type, shares: (existing?.shares ?? 0) + qty,
      });
      // buying nudges price up slightly
      const newPrice = price + Math.min(5, qty * 0.5);
      const history = (market.price_history || []) as number[];
      await supabase.from("market").update({
        price: newPrice, price_history: [...history.slice(-19), newPrice],
      }).eq("sock_type", sock_type);
    } else {
      const { data: existing } = await supabase
        .from("portfolios").select("shares")
        .eq("player_id", player_id).eq("sock_type", sock_type).maybeSingle();
      if (!existing || existing.shares < qty) {
        return new Response(JSON.stringify({ error: "NOT_ENOUGH_SHARES" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      await supabase.from("players").update({ sock_coins: Number(player.sock_coins) + totalCost }).eq("id", player_id);
      await supabase.from("portfolios").update({ shares: existing.shares - qty })
        .eq("player_id", player_id).eq("sock_type", sock_type);
      const newPrice = Math.max(1, price - Math.min(5, qty * 0.5));
      const history = (market.price_history || []) as number[];
      await supabase.from("market").update({
        price: newPrice, price_history: [...history.slice(-19), newPrice],
      }).eq("sock_type", sock_type);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
