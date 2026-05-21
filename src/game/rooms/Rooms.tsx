import { useState, useEffect } from "react";
import type { Sock, MarketRow } from "../hooks";
import { SockVisual, StatBars } from "../components/SockVisual";
import { MarketGraph } from "../components/MarketGraph";
import { ActionButton, ACTIONS } from "../components/ActionButton";
import { SOCK_TYPES, sockTypeLabel, FACTION_MULTIPLIERS } from "../actions";
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
    <div className="computer-grid">
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
  );
}

export function LivingRoom({ sock, faction, cooldowns, doAction }: RoomProps) {
  return (
    <div className="room">
      <div className="scene">
        <div className="living-room-scene">
          {/* Cozy cushion and sock container */}
          <div className="cozy-cushion-container">
            <div className="living-sock-wrapper" style={{ transform: "scale(0.85)" }}>
              <SockVisual sock={sock} />
            </div>
            <div className="velvet-cushion" />
          </div>
          
          {/* Pixel fireplace */}
          <div className="fireplace">
            <div className="fireplace-hearth">
              <div className="fire-log" />
              <div className="fire-pixel" />
              <div className="fire-pixel" />
              <div className="fire-pixel" />
            </div>
          </div>
        </div>
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
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const isActionActive = (actionId: string, lastUsed: number | undefined) => {
    if (!lastUsed) return false;
    const mult = FACTION_MULTIPLIERS[faction]?.[actionId] ?? 1;
    const cdMs = ACTIONS[actionId].cooldownHours * 3600000 * mult;
    return (time - lastUsed) < cdMs;
  };

  const isWashing = isActionActive("wash", cooldowns.wash);
  const isSoaking = isActionActive("soak", cooldowns.soak);
  const isToiletCooldown = isActionActive("toilet", cooldowns.toilet);

  const handleToiletClick = () => {
    if (isToiletCooldown) return;
    if (confirm("FLUSH THE SOCK? This will not be forgotten.")) {
      doAction("toilet");
    }
  };

  return (
    <div className="room">
      <div className="scene">
        <div className="bathroom-scene">
          <div className="appliance-box">
            <span style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.8 }}>SINK / WASHER</span>
            <div className="washing-machine">
              <div className="washer-panel">
                <div className="washer-dial" />
                <div className="washer-led" style={isWashing ? { background: "#00ff41", boxShadow: "0 0 6px #00ff41" } : { background: "#9e9e9e", boxShadow: "none" }} />
              </div>
              <div className="washer-door">
                {isWashing ? (
                  <>
                    <div className="washer-bubbles" />
                    <span className="washer-sock-spinning">🧦</span>
                  </>
                ) : (
                  <span style={{ fontSize: "20px", opacity: 0.35 }}>🧦</span>
                )}
              </div>
            </div>
          </div>

          <div className="appliance-box">
            <span style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.8 }}>SOAKING TUB</span>
            <div className="bathtub">
              <div className="bath-water">
                {isSoaking ? (
                  <>
                    <span className="bath-bubble" style={{ left: "15%", width: "8px", height: "8px", animationDelay: "0.2s" }} />
                    <span className="bath-bubble" style={{ left: "30%", width: "12px", height: "12px", animationDelay: "0.7s" }} />
                    <span className="bath-bubble" style={{ left: "45%", width: "6px", height: "6px", animationDelay: "1.2s" }} />
                    <span className="bath-bubble" style={{ left: "60%", width: "10px", height: "10px", animationDelay: "1.7s" }} />
                    <span className="bath-bubble" style={{ left: "75%", width: "8px", height: "8px", animationDelay: "2.2s" }} />
                  </>
                ) : (
                  <>
                    <span className="bath-bubble" style={{ left: "25%", width: "6px", height: "6px", animationDelay: "0.5s", animationDuration: "4s" }} />
                    <span className="bath-bubble" style={{ left: "65%", width: "8px", height: "8px", animationDelay: "1.5s", animationDuration: "4s" }} />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="appliance-box">
            <span style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.8 }}>TOILET</span>
            <div 
              className="toilet" 
              onClick={handleToiletClick} 
              style={{ cursor: isToiletCooldown ? "not-allowed" : "pointer" }}
            >
              <div className="toilet-tank">
                <div className="toilet-flush-lever" style={isToiletCooldown ? { transform: "rotate(30deg)" } : {}} />
              </div>
              <div className="toilet-rim" />
              <div className="toilet-bowl" />
            </div>
          </div>
        </div>

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
        <ActionButton action={ACTIONS.toilet} lastUsed={cooldowns.toilet} faction={faction} onClick={handleToiletClick} />
      </div>
    </div>
  );
}

export function Kitchen({ sock, faction, cooldowns, doAction }: RoomProps) {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const isActionActive = (actionId: string, lastUsed: number | undefined) => {
    if (!lastUsed) return false;
    const mult = FACTION_MULTIPLIERS[faction]?.[actionId] ?? 1;
    const cdMs = ACTIONS[actionId].cooldownHours * 3600000 * mult;
    return (time - lastUsed) < cdMs;
  };

  const isMicrowaving = isActionActive("microwave", cooldowns.microwave);
  const isFreezing = isActionActive("freeze", cooldowns.freeze);
  const isIroning = isActionActive("iron", cooldowns.iron);

  const handleMicrowaveClick = () => {
    if (isMicrowaving) return;
    doAction("microwave");
  };

  const handleFridgeClick = () => {
    if (isFreezing) return;
    doAction("freeze");
  };

  const handleStoveClick = () => {
    if (isIroning) return;
    doAction("iron");
  };

  const getLocalTime = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const getMicrowaveClock = () => {
    if (!isMicrowaving || !cooldowns.microwave) return getLocalTime();
    const mult = FACTION_MULTIPLIERS[faction]?.microwave ?? 1;
    const cdMs = ACTIONS.microwave.cooldownHours * 3600000 * mult;
    const remaining = Math.max(0, cdMs - (time - cooldowns.microwave));
    const totalSecs = Math.ceil(remaining / 1000);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="room">
      <div className="scene">
        <div className="kitchen-scene">
          <div className="appliance-box">
            <span style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.8 }}>MICROWAVE</span>
            <div 
              className="microwave" 
              onClick={handleMicrowaveClick}
              style={{ cursor: isMicrowaving ? "not-allowed" : "pointer" }}
            >
              <div className="microwave-window">
                {isMicrowaving && <div className="microwave-waves" />}
                {isMicrowaving ? (
                  <span className="microwave-sock">🧦</span>
                ) : (
                  <span style={{ fontSize: "18px", opacity: 0.2 }}>🧦</span>
                )}
              </div>
              <div className="microwave-panel">
                <div className="microwave-clock">{getMicrowaveClock()}</div>
                <div className="microwave-keypad" />
              </div>
            </div>
          </div>

          <div className="appliance-box">
            <span style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.8 }}>FREEZER</span>
            <div 
              className="fridge" 
              onClick={handleFridgeClick}
              style={{ 
                cursor: isFreezing ? "not-allowed" : "pointer",
                boxShadow: isFreezing ? "0 0 12px #00e5ff" : "",
                borderColor: isFreezing ? "#00e5ff" : ""
              }}
            >
              <div className="fridge-handle" />
              <div className="fridge-door-line" />
              <div className="fridge-frost" style={isFreezing ? { opacity: 0.85 } : {}} />
            </div>
          </div>

          <div className="appliance-box">
            <span style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.8 }}>STOVE / IRON</span>
            <div 
              className="stove" 
              onClick={handleStoveClick}
              style={{ cursor: isIroning ? "not-allowed" : "pointer" }}
            >
              <div className="stove-burner-grid">
                <div className={`stove-burner ${isIroning ? "glowing" : ""}`}>
                  <div className="stove-burner-coil" />
                </div>
                <div className={`stove-burner ${isIroning ? "glowing" : ""}`}>
                  <div className="stove-burner-coil" />
                </div>
                <div className="stove-burner">
                  <div className="stove-burner-coil" />
                </div>
                <div className="stove-burner">
                  <div className="stove-burner-coil" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="box action-grid">
        <ActionButton action={ACTIONS.microwave} lastUsed={cooldowns.microwave} faction={faction} onClick={handleMicrowaveClick} />
        <ActionButton action={ACTIONS.freeze} lastUsed={cooldowns.freeze} faction={faction} onClick={handleFridgeClick} />
        <ActionButton action={ACTIONS.iron} lastUsed={cooldowns.iron} faction={faction} onClick={handleStoveClick} />
      </div>
      {sock.heat_damage > 60 && <div className="err">⚠ HEAT DAMAGE CRITICAL: {sock.heat_damage}</div>}
    </div>
  );
}

export function Garage({ sock, faction, cooldowns, doAction }: RoomProps) {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const isActionActive = (actionId: string, lastUsed: number | undefined) => {
    if (!lastUsed) return false;
    const mult = FACTION_MULTIPLIERS[faction]?.[actionId] ?? 1;
    const cdMs = ACTIONS[actionId].cooldownHours * 3600000 * mult;
    return (time - lastUsed) < cdMs;
  };

  const isBurning = isActionActive("burn", cooldowns.burn);
  const isHiding = isActionActive("hide", cooldowns.hide);
  const isSearching = isActionActive("search", cooldowns.search);

  const handleBurnClick = () => {
    if (isBurning) return;
    if (confirm("ARE YOU SURE? This will scorch the sock for all players.")) {
      doAction("burn");
    }
  };

  return (
    <div className="room">
      <div className="scene dark">
        <div className="garage-scene">
          <div className="appliance-box">
            <span style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.8 }}>INCINERATOR BARREL</span>
            <div 
              className="fire-barrel" 
              onClick={handleBurnClick}
              style={{ cursor: isBurning ? "not-allowed" : "pointer" }}
            >
              <div className="barrel-ring barrel-ring-1" />
              <div className="barrel-ring barrel-ring-2" />
              <div className="barrel-fire-mouth" style={isBurning ? { background: "#ff9100", boxShadow: "0 0 16px #ff9100" } : { background: "#ff3d00", opacity: 0.5 }} />
              <span 
                className="barrel-flames" 
                style={isBurning ? { fontSize: "28px" } : { fontSize: "18px", opacity: 0.5 }}
              >
                🔥
              </span>
            </div>
          </div>

          <div className="crate-stack">
            <span style={{ fontSize: "14px", marginBottom: "5px", opacity: 0.8 }}>STORAGE CRATES</span>
            <div 
              className={`crate ${isHiding ? "shake" : ""}`} 
              onClick={() => { if (!isHiding) doAction("hide"); }}
              style={{ cursor: isHiding ? "not-allowed" : "pointer" }}
            >
              {isHiding ? "📦 HIDING..." : "📦 HIDE SOCK"}
            </div>
            <div 
              className={`crate ${isSearching ? "shake" : ""}`} 
              onClick={() => { if (!isSearching) doAction("search"); }}
              style={{ cursor: isSearching ? "not-allowed" : "pointer" }}
            >
              {isSearching ? "📦 SEARCHING..." : "📦 SEARCH BOX"}
            </div>
          </div>
        </div>
      </div>
      <div className="box action-grid">
        <ActionButton action={ACTIONS.burn} lastUsed={cooldowns.burn} faction={faction} onClick={handleBurnClick} />
        <ActionButton action={ACTIONS.hide} lastUsed={cooldowns.hide} faction={faction} onClick={() => doAction("hide")} />
        <ActionButton action={ACTIONS.search} lastUsed={cooldowns.search} faction={faction} onClick={() => doAction("search")} />
      </div>
      <div style={{ fontSize: 13, opacity: 0.5, fontStyle: "italic", textAlign: "center" }}>"THE BURNERS WERE HERE" — scratched into the wall</div>
    </div>
  );
}

export function ShrineRoom({ sock, faction, cooldowns, doAction }: RoomProps) {
  return (
    <div className="room">
      <div className="scene dark">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          {/* Floating Mystic Sock */}
          <div className="altar-sock" style={{ transform: "scale(0.8)" }}>
            <SockVisual sock={{ ...sock, is_glowing: true }} />
          </div>
          
          <pre className="ascii-art" style={{ color: "#ffd700", marginTop: 10 }}>
{`        ╔═════════╗
        ║   ✦✦✦   ║
        ║  ✦   ✦  ║
        ║ ✦ SOCK ✦║
        ║  ✦   ✦  ║
        ║   ✦✦✦   ║
        ╚═════════╝
       ║         ║`}
          </pre>
          
          {/* Animated Candles */}
          <div style={{ display: "flex", gap: "60px", marginTop: "-6px", fontSize: "16px", fontFamily: "monospace" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span className="candle-flame" style={{ animation: "flicker-flame 0.23s infinite alternate" }}>♨️</span>
              <span style={{ color: "#ffd700", fontSize: "14px", lineHeight: "1" }}>|</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span className="candle-flame" style={{ animation: "flicker-flame 0.31s infinite alternate-reverse" }}>♨️</span>
              <span style={{ color: "#ffd700", fontSize: "14px", lineHeight: "1" }}>|</span>
            </div>
          </div>
          <div style={{ color: "#ffd700", fontSize: "13px", opacity: 0.6, marginTop: 4 }}>← CANDLES →</div>
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
