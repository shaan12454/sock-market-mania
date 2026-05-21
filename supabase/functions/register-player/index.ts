import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { username, faction } = await req.json();
    if (
      typeof username !== "string" ||
      username.length < 3 ||
      username.length > 16 ||
      !["washers", "burners", "traders", "cultists", "resistance", "smell_society"].includes(faction)
    ) {
      return new Response(JSON.stringify({ error: "INVALID_INPUT" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data, error } = await supabase
      .from("players")
      .insert({ username, faction })
      .select("id, username, faction, sock_coins")
      .single();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await supabase.from("headlines").insert({
      text: `New ${faction.toUpperCase()} recruit joins: ${username}.`,
      event_type: "lore",
    });
    return new Response(JSON.stringify({ player: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
