import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

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
  const { data: rows } = await supabase.from("market").select("*");
  if (!rows) return new Response("no market", { status: 500, headers: corsHeaders });
  for (const row of rows) {
    const drift = (Math.random() * 0.06 - 0.03); // ±3%
    const newPrice = Math.max(1, Number(row.price) * (1 + drift));
    const history = (row.price_history || []) as number[];
    await supabase.from("market").update({
      price: newPrice,
      price_history: [...history.slice(-19), newPrice],
      updated_at: new Date().toISOString(),
    }).eq("sock_type", row.sock_type);
  }
  return new Response(JSON.stringify({ ticked: rows.length }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
