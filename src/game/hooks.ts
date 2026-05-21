import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Sock = {
  id: number;
  cleanliness: number; wetness: number; smell: number; heat_damage: number;
  aura: number; intelligence: number; emotional_stability: number;
  cult_influence: number; chaos_level: number; radiation: number; drip: number;
  has_glasses: boolean; has_crown: boolean; is_charred: boolean;
  has_mold: boolean; has_duct_tape: boolean; is_glowing: boolean;
  age_days: number;
};

export type MarketRow = {
  sock_type: string; price: number; price_history: number[];
};

export type Headline = { id: number; text: string; event_type: string | null; created_at: string };

export type Player = {
  id: string; username: string; faction: string; sock_coins: number;
};

export function useSock() {
  const [sock, setSock] = useState<Sock | null>(null);
  useEffect(() => {
    supabase.from("sock").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setSock(data as any);
    });
    const ch = supabase.channel("sock-changes").on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "sock", filter: "id=eq.1" },
      (p) => setSock(p.new as any)
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return sock;
}

export function useMarket() {
  const [market, setMarket] = useState<Record<string, MarketRow>>({});
  useEffect(() => {
    supabase.from("market").select("*").then(({ data }) => {
      const map: Record<string, MarketRow> = {};
      (data || []).forEach((r: any) => { map[r.sock_type] = r; });
      setMarket(map);
    });
    const ch = supabase.channel("market-changes").on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "market" },
      (p) => setMarket((prev) => ({ ...prev, [(p.new as any).sock_type]: p.new as any }))
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return market;
}

export function useHeadlines() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  useEffect(() => {
    supabase.from("headlines").select("*").order("created_at", { ascending: false }).limit(30)
      .then(({ data }) => setHeadlines((data || []) as any));
    const ch = supabase.channel("headlines-changes").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "headlines" },
      (p) => setHeadlines((prev) => [p.new as any, ...prev].slice(0, 30))
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return headlines;
}

export function useGlobalEvents() {
  const [events, setEvents] = useState<{ id: number; event_name: string; description: string }[]>([]);
  useEffect(() => {
    const ch = supabase.channel("global-events").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "global_events" },
      (p) => {
        setEvents((prev) => [...prev, p.new as any]);
        setTimeout(() => setEvents((prev) => prev.filter((e) => e.id !== (p.new as any).id)), 8000);
      }
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return events;
}

const PLAYER_KEY = "sockstock_player_id";

export function usePlayer() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem(PLAYER_KEY) : null;
    if (!id) { setLoading(false); return; }
    supabase.from("players").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => {
        if (data) setPlayer(data as any);
        else if (typeof window !== "undefined") localStorage.removeItem(PLAYER_KEY);
        setLoading(false);
      });
  }, []);

  // Realtime subscribe to my own player row (coins update after trade)
  useEffect(() => {
    if (!player) return;
    const ch = supabase.channel(`player-${player.id}`).on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "players", filter: `id=eq.${player.id}` },
      (p) => setPlayer(p.new as any)
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [player?.id]);

  async function register(username: string, faction: string) {
    const { data, error } = await supabase.functions.invoke("register-player", {
      body: { username, faction },
    });
    if (error || (data as any)?.error) {
      throw new Error((data as any)?.error || error?.message || "Registration failed");
    }
    const newPlayer = (data as any).player as Player;
    localStorage.setItem(PLAYER_KEY, newPlayer.id);
    setPlayer(newPlayer);
    return newPlayer;
  }

  function logout() {
    localStorage.removeItem(PLAYER_KEY);
    setPlayer(null);
  }

  return { player, loading, register, logout };
}

export function usePortfolio(playerId: string | undefined) {
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!playerId) return;
    const load = () => {
      supabase.from("portfolios").select("*").eq("player_id", playerId).then(({ data }) => {
        const map: Record<string, number> = {};
        (data || []).forEach((r: any) => { map[r.sock_type] = r.shares; });
        setPortfolio(map);
      });
    };
    load();
    const ch = supabase.channel(`portfolio-${playerId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "portfolios", filter: `player_id=eq.${playerId}` },
      () => load()
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [playerId]);
  return portfolio;
}

export function useCooldowns(playerId: string | undefined) {
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({}); // action_id -> last_used ms
  const reload = useRef<() => void>(() => {});
  useEffect(() => {
    if (!playerId) return;
    const load = () => {
      supabase.from("action_cooldowns").select("*").eq("player_id", playerId).then(({ data }) => {
        const map: Record<string, number> = {};
        (data || []).forEach((r: any) => { map[r.action_id] = new Date(r.last_used).getTime(); });
        setCooldowns(map);
      });
    };
    reload.current = load;
    load();
    const ch = supabase.channel(`cooldowns-${playerId}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "action_cooldowns", filter: `player_id=eq.${playerId}` },
      () => load()
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [playerId]);
  return { cooldowns, reload: () => reload.current() };
}

export function usePresence() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const id = Math.random().toString(36).slice(2);
    const ch = supabase.channel("online-users", { config: { presence: { key: id } } });
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      setCount(Math.max(1, Object.keys(state).length));
    }).subscribe(async (status) => {
      if (status === "SUBSCRIBED") await ch.track({ at: Date.now() });
    });
    return () => { supabase.removeChannel(ch); };
  }, []);
  return count;
}

export function useTicker() {
  // Market ticking is handled server-side via pg_cron.
  // This hook is kept empty to avoid breaking imports in other parts of the codebase.
}
