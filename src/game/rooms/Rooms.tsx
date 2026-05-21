import { useState } from "react";
import type { Sock, MarketRow } from "../hooks";
import { SockVisual, StatBars } from "../components/SockVisual";
import { MarketGraph } from "../components/MarketGraph";
import { ActionButton, ACTIONS } from "../components/ActionButton";
import { SOCK_TYPES, sockTypeLabel } from "../actions";
import { SFX } from "../sound";

type RoomProps = {
  sock: Sock;
  faction: string;
  cooldowns: Record<string, number>;
  doAction: (id: string) => void;
};

type ComputerProps = RoomProps & {
  market: Record<string, MarketRow>;
  coins: number;
  portfolio: Record<string, number>;
  trade: (sock_type: string, qty: number, dir: "buy" | "sell") => void;
};

export function ComputerRoom({ market, coins, portfolio, trade, faction, cooldowns, doAction }: ComputerProps) {
  const [selected, setSelected] = useState("evil_sock");
  const sel = market[selected];

  return (
    <div className="room">
      <div className="main" style={{ padding: 0, gap: 12, display: "grid" }}>
        <div className="left box scrollbox">
          <h3>SOCK STOCKS</h3>
          {SOCK_TYPES.map((t) => {
            const r = market[t];
            if (!r) return null;
            const hist = r.price_history || [];
            const prev = hist.length >= 2 ? Number(hist[hist.length - 2]) : Number(r.price);
            const up = Number(r.price) >= prev;
            return (
              <div
                key={t}
                className={`stock-row ${selected === t ? "active" : ""}`}
                onClick={() => { setSelected(t); SFX.click(); }}
              >
                <span>{sockTypeLabel(t)}</span>
                <span>{Number(r.price).toFixed(0)}</span>
                <span className={up ? "up" : "down"}>{up ? "↑" : "↓"}</span>
              </div>
            );
          })}
        </div>

        <div className="center">
          <div className="crt">
            <MarketGraph history={(sel?.price_history || []).map(Number)} label={sockTypeLabel(selected)} />
          </div>
          {sel && (
            <div className="box">
              <div>{sockTypeLabel(selected)} — {Number(sel.price).toFixed(2)} SC</div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>
                Owned: {portfolio[selected] || 0} shares · You: {coins.toFixed(0)} SC
              </div>
              <div className="trade-panel" style={{ marginTop: 8 }}>
                {[1, 5, 10].map((n) => (
                  <button key={`b${n}`} onClick={() => trade(selected, n, "buy")}>BUY {n}</button>
                ))}
                {[1, 5].map((n) => (
                  <button key={`s${n}`} onClick={() => trade(selected, n, "sell")}>SELL {n}</button>
                ))}
                <ActionButton
                  action={ACTIONS.spreadRumor}
                  lastUsed={cooldowns.spreadRumor}
                  faction={faction}
                  onClick={() => doAction("spreadRumor")}
                />
              </div>
            </div>
          )}
        </div>

        <div className="right box scrollbox">
          <h3>YOUR PORTFOLIO</h3>
          {SOCK_TYPES.filter((t) => (portfolio[t] || 0) > 0).map((t) => (
            <div key={t} style={{ fontSize: 14 }}>
              {sockTypeLabel(t)}: {portfolio[t]} × {Number(market[t]?.price || 0).toFixed(0)} = {((portfolio[t] || 0) * Number(market[t]?.price || 0)).toFixed(0)}
            </div>
          ))}
          {Object.keys(portfolio).filter((t) => portfolio[t] > 0).length === 0 && (
            <div style={{ opacity: 0.6 }}>No holdings yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function LivingRoom({ sock, faction, cooldowns, doAction }: RoomProps) {
  return (
    <div className="room">
      <div className="scene">
        <SockVisual sock={sock} />
      </div>
      <div className="box">
        <StatBars sock={sock} />
        <div className="action-grid">
          <ActionButton action={ACTIONS.compliment} lastUsed={cooldowns.compliment} faction={faction} onClick={() => doAction("compliment")} />
        </div>
        <div style={{ marginTop: 8, fontSize: 14, opacity: 0.7 }}>
          AGE: {sock.age_days} DAYS · INT: {sock.intelligence} · EMO: {sock.emotional_stability} · HEAT: {sock.heat_damage} · RAD: {sock.radiation}
        </div>
      </div>
    </div>
  );
}

export function Bathroom({ sock, faction, cooldowns, doAction }: RoomProps) {
  const art = `   ╔═══════════════╗
   ║   ┌───────┐   ║
   ║   │  ▓▓▓  │   ║   ← MIRROR
   ║   └───────┘   ║
   ║               ║
   ║ ╔═══╗   ╔══╗  ║
   ║ ║SNK║   ║WC║  ║   ← SINK | TOILET
   ║ ╚═══╝   ╚══╝  ║
   ║               ║
   ║ ╔═════════╗   ║
   ║ ║ ~ TUB ~ ║   ║
   ║ ╚═════════╝   ║
   ╚═══════════════╝`;
  return (
    <div className="room">
      <div className="scene">
        <pre className="ascii-art">{art}</pre>
        <div className="mirror box">
{`~ REFLECTION ~
CLEAN: ${String(sock.cleanliness).padStart(3)}
WET:   ${String(sock.wetness).padStart(3)}
SMELL: ${String(sock.smell).padStart(3)}`}
        </div>
      </div>
      <div className="box action-grid">
        <ActionButton action={ACTIONS.wash} lastUsed={cooldowns.wash} faction={faction} onClick={() => doAction("wash")} />
        <ActionButton action={ACTIONS.soak} lastUsed={cooldowns.soak} faction={faction} onClick={() => doAction("soak")} />
        <ActionButton action={ACTIONS.toilet} lastUsed={cooldowns.toilet} faction={faction} onClick={() => { if (confirm("FLUSH THE SOCK? This will not be forgotten.")) doAction("toilet"); }} />
      </div>
    </div>
  );
}

export function Kitchen({ sock, faction, cooldowns, doAction }: RoomProps) {
  const art = `   ╔════════════════════╗
   ║ ┌─────┐  ┌─────┐  ║
   ║ │ ▒▒▒ │  │░░░░░│  ║   ← MICROWAVE | FRIDGE
   ║ │[--]│  │  []  │  ║
   ║ └─────┘  └─────┘  ║
   ║                    ║
   ║ ════════════════   ║   ← COUNTER
   ║ ┌──────┐           ║
   ║ │ STOVE│           ║
   ║ │  ◍◍  │           ║
   ║ └──────┘           ║
   ╚════════════════════╝`;
  return (
    <div className="room">
      <div className="scene">
        <pre className="ascii-art">{art}</pre>
      </div>
      <div className="box action-grid">
        <ActionButton action={ACTIONS.microwave} lastUsed={cooldowns.microwave} faction={faction} onClick={() => doAction("microwave")} />
        <ActionButton action={ACTIONS.freeze} lastUsed={cooldowns.freeze} faction={faction} onClick={() => doAction("freeze")} />
        <ActionButton action={ACTIONS.iron} lastUsed={cooldowns.iron} faction={faction} onClick={() => doAction("iron")} />
      </div>
      {sock.heat_damage > 60 && <div className="err">⚠ HEAT DAMAGE CRITICAL: {sock.heat_damage}</div>}
    </div>
  );
}

export function Garage({ sock, faction, cooldowns, doAction }: RoomProps) {
  const art = `   ╔════════════════════╗
   ║                    ║
   ║      ▲▲▲           ║   ← FIRE BARREL
   ║     ▲▲▲▲▲          ║
   ║      ║║║           ║
   ║    ┌─╨─╨─┐         ║
   ║    │░░░░░│         ║
   ║    └─────┘         ║
   ║                    ║
   ║  ┌──┐ ┌──┐ ┌──┐   ║   ← BOXES
   ║  └──┘ └──┘ └──┘   ║
   ║                  ✦ ║   ← SHRINE
   ╚════════════════════╝`;
  return (
    <div className="room">
      <div className="scene dark">
        <pre className="ascii-art" style={{ color: "#ff8844" }}>{art}</pre>
      </div>
      <div className="box action-grid">
        <ActionButton action={ACTIONS.burn} lastUsed={cooldowns.burn} faction={faction} onClick={() => { if (confirm("ARE YOU SURE? This will scorch the sock for all players.")) doAction("burn"); }} />
        <ActionButton action={ACTIONS.hide} lastUsed={cooldowns.hide} faction={faction} onClick={() => doAction("hide")} />
        <ActionButton action={ACTIONS.search} lastUsed={cooldowns.search} faction={faction} onClick={() => doAction("search")} />
      </div>
      <div style={{ fontSize: 13, opacity: 0.5, fontStyle: "italic" }}>"THE BURNERS WERE HERE" — scratched into the wall</div>
    </div>
  );
}

export function ShrineRoom({ sock, faction, cooldowns, doAction }: RoomProps) {
  const art = `        ╔═════════╗
        ║   ✦✦✦   ║
        ║  ✦   ✦  ║
        ║ ✦ SOCK ✦║
        ║  ✦   ✦  ║
        ║   ✦✦✦   ║
        ╚═════════╝
       ║         ║
      ♨️           ♨️    ← CANDLES`;
  return (
    <div className="room">
      <div className="scene dark">
        <div style={{ position: "relative" }}>
          <SockVisual sock={{ ...sock, is_glowing: true }} />
          <pre className="ascii-art" style={{ color: "#ffd700", marginTop: 10 }}>{art}</pre>
        </div>
      </div>
      <div className="box action-grid">
        <ActionButton action={ACTIONS.worship} lastUsed={cooldowns.worship} faction={faction} onClick={() => doAction("worship")} />
        <ActionButton action={ACTIONS.offer} lastUsed={cooldowns.offer} faction={faction} onClick={() => doAction("offer")} />
        <ActionButton action={ACTIONS.ascend} lastUsed={cooldowns.ascend} faction={faction} onClick={() => { if (confirm("ASCEND THE SOCK? Reality may not recover.")) doAction("ascend"); }} />
      </div>
    </div>
  );
}
