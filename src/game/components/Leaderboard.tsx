import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string; username: string; faction: string;
  sock_coins: number; actions_count: number; chaos_contributed: number; total_profit: number;
};

type Tab = "richest" | "chaos" | "factions";

export function Leaderboard({ myId }: { myId: string | null }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<Tab>("richest");

  useEffect(() => {
    const load = () => {
      supabase.from("players")
        .select("id, username, faction, sock_coins, actions_count, chaos_contributed, total_profit")
        .limit(500)
        .then(({ data }) => setRows((data || []) as Row[]));
    };
    load();
    const ch = supabase.channel("lb-players").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players" },
      () => load()
    ).subscribe();
    const iv = setInterval(load, 15000);
    return () => { supabase.removeChannel(ch); clearInterval(iv); };
  }, []);

  const sorted = [...rows];
  if (tab === "richest") sorted.sort((a, b) => Number(b.sock_coins) - Number(a.sock_coins));
  if (tab === "chaos") sorted.sort((a, b) => b.chaos_contributed - a.chaos_contributed);

  const factionTotals: Record<string, { actions: number; chaos: number; members: number }> = {};
  rows.forEach((r) => {
    const f = r.faction || "—";
    factionTotals[f] = factionTotals[f] || { actions: 0, chaos: 0, members: 0 };
    factionTotals[f].actions += r.actions_count;
    factionTotals[f].chaos += r.chaos_contributed;
    factionTotals[f].members += 1;
  });
  const factions = Object.entries(factionTotals).sort((a, b) => b[1].chaos - a[1].chaos);

  return (
    <div className="box scrollbox" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <h3>▌ LEADERBOARD ▐</h3>
      <div className="lb-tabs">
        <button className={tab === "richest" ? "lb-active" : ""} onClick={() => setTab("richest")}>💰 RICH</button>
        <button className={tab === "chaos" ? "lb-active" : ""} onClick={() => setTab("chaos")}>💥 CHAOS</button>
        <button className={tab === "factions" ? "lb-active" : ""} onClick={() => setTab("factions")}>🏴 WAR</button>
      </div>
      <div className="lb-list">
        {tab === "factions" ? (
          factions.map(([f, t], i) => (
            <div key={f} className="lb-row">
              <span>{i + 1}.</span>
              <span style={{ flex: 1 }}>{f.toUpperCase()}</span>
              <span style={{ opacity: 0.7 }}>{t.members}p</span>
              <span style={{ color: "var(--amber)" }}>{t.chaos}χ</span>
            </div>
          ))
        ) : (
          sorted.slice(0, 20).map((r, i) => (
            <div key={r.id} className={`lb-row ${r.id === myId ? "lb-me" : ""}`}>
              <span>{i + 1}.</span>
              <span style={{ flex: 1 }}>{r.username}</span>
              <span style={{ opacity: 0.6, fontSize: 12 }}>{r.faction?.slice(0, 4).toUpperCase()}</span>
              <span style={{ color: tab === "chaos" ? "var(--amber)" : "var(--green)" }}>
                {tab === "richest" ? `${Number(r.sock_coins).toFixed(0)} SC` : `${r.chaos_contributed}χ`}
              </span>
            </div>
          ))
        )}
        {sorted.length === 0 && <div style={{ opacity: 0.5 }}>no players yet.</div>}
      </div>
    </div>
  );
}
