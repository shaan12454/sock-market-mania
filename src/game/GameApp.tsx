import { useState } from "react";
import "./styles.css";
import { supabase } from "@/integrations/supabase/client";
import {
  useSock, useMarket, useHeadlines, useGlobalEvents,
  usePlayer, usePortfolio, useCooldowns, usePresence, useTicker,
} from "./hooks";
import { FactionModal } from "./components/FactionModal";
import {
  ComputerRoom, LivingRoom, Bathroom, Kitchen, Garage, ShrineRoom,
} from "./rooms/Rooms";
import { SFX } from "./sound";

const ROOMS = [
  { id: "computer", label: "💻 COMPUTER" },
  { id: "living", label: "🏠 LIVING" },
  { id: "bathroom", label: "🚿 BATHROOM" },
  { id: "kitchen", label: "🍳 KITCHEN" },
  { id: "garage", label: "📦 GARAGE" },
  { id: "shrine", label: "🕯 SHRINE" },
];

export function GameApp() {
  const sock = useSock();
  const market = useMarket();
  const headlines = useHeadlines();
  const events = useGlobalEvents();
  const presence = usePresence();
  const { player, loading, register, logout } = usePlayer();
  const portfolio = usePortfolio(player?.id);
  const { cooldowns, reload: reloadCooldowns } = useCooldowns(player?.id);
  useTicker();

  const [room, setRoom] = useState("computer");
  const [error, setError] = useState<string | null>(null);

  async function doAction(action_id: string) {
    if (!player) return;
    SFX.click();
    const { data, error: err } = await supabase.functions.invoke("perform-action", {
      body: { action_id, player_id: player.id, faction: player.faction },
    });
    if (err || (data as any)?.error) {
      const e = (data as any)?.error || err?.message || "Action failed";
      if (e === "COOLDOWN_ACTIVE") setError("ACTION ON COOLDOWN");
      else setError(e);
      SFX.error();
      setTimeout(() => setError(null), 2500);
      return;
    }
    SFX.success();
    reloadCooldowns();
  }

  async function trade(sock_type: string, qty: number, dir: "buy" | "sell") {
    if (!player) return;
    SFX.trade();
    const { data, error: err } = await supabase.functions.invoke("execute-trade", {
      body: { player_id: player.id, sock_type, quantity: qty, direction: dir },
    });
    if (err || (data as any)?.error) {
      setError((data as any)?.error || err?.message || "Trade failed");
      SFX.error();
      setTimeout(() => setError(null), 2500);
    }
  }

  if (loading || !sock) {
    return (
      <div className="sock-game">
        <div className="crt-vignette" />
        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <div>LOADING SOCK... ░▒▓█</div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="sock-game">
        <div className="crt-vignette" />
        <FactionModal onPick={register} />
      </div>
    );
  }

  const shrineUnlocked = sock.cult_influence >= 60;
  const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  return (
    <div className="sock-game">
      <div className="crt-vignette" />

      <div className="layout">
        <div className="topbar">
          <div className="brand">★ SOCK STOCK v2.3 ★</div>
          <div className="meta">
            <span>[{today}]</span>
            <span>👥 {presence} ONLINE</span>
            <span>👤 {player.username} ({player.faction})</span>
            <span>💰 {Number(player.sock_coins).toFixed(0)} SC</span>
            <button style={{ fontSize: 12, padding: "2px 8px" }} onClick={() => { if (confirm("Quit current session?")) logout(); }}>QUIT</button>
          </div>
        </div>

        {room === "computer" ? (
          <ComputerRoom
            sock={sock} faction={player.faction} cooldowns={cooldowns} doAction={doAction}
            market={market} coins={Number(player.sock_coins)} portfolio={portfolio} trade={trade}
          />
        ) : (
          <div className="main" style={{ gridTemplateColumns: "1fr 320px" }}>
            {room === "living" && <LivingRoom sock={sock} faction={player.faction} cooldowns={cooldowns} doAction={doAction} />}
            {room === "bathroom" && <Bathroom sock={sock} faction={player.faction} cooldowns={cooldowns} doAction={doAction} />}
            {room === "kitchen" && <Kitchen sock={sock} faction={player.faction} cooldowns={cooldowns} doAction={doAction} />}
            {room === "garage" && <Garage sock={sock} faction={player.faction} cooldowns={cooldowns} doAction={doAction} />}
            {room === "shrine" && shrineUnlocked && <ShrineRoom sock={sock} faction={player.faction} cooldowns={cooldowns} doAction={doAction} />}
            
            <div className="right box scrollbox">
              <h3>▌ LIVE FEED ▐</h3>
              <div className="headline-feed">
                {headlines.map((h) => (
                  <div key={h.id} className={h.event_type === "global" ? "global" : ""}>{h.text}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {room === "computer" && (
          <div className="ticker">
            <span>
              {headlines.map((h) => `▸ ${h.text}`).join("    ◆    ")}
            </span>
          </div>
        )}

        <div className="navbar">
          {ROOMS.map((r) => {
            const locked = r.id === "shrine" && !shrineUnlocked;
            return (
              <button
                key={r.id}
                onClick={() => { if (!locked) { setRoom(r.id); SFX.click(); } }}
                disabled={locked}
                style={room === r.id ? { background: "var(--green)", color: "#000", textShadow: "none" } : {}}
              >
                {locked ? `🔒 SHRINE (LOCKED)` : r.label}
              </button>
            );
          })}
        </div>
      </div>

      {events.map((e, i) => (
        <div key={e.id} className="global-banner" style={{ top: 60 + i * 80 }}>
          ⚠ GLOBAL EVENT: {e.event_name.toUpperCase()}
          <div style={{ fontSize: 14 }}>{e.description}</div>
        </div>
      ))}

      {error && (
        <div className="modal-overlay" onClick={() => setError(null)}>
          <div className="modal" style={{ borderColor: "var(--red)", color: "var(--red)" }}>
            <h2>! ERROR</h2>
            <div>{error}</div>
            <div style={{ marginTop: 14, fontSize: 12 }}>(click to dismiss)</div>
          </div>
        </div>
      )}
    </div>
  );
}
