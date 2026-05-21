import type { Sock } from "../hooks";

function stinkLines(count: number) {
  return Array.from({ length: count }).map((_, i) => (
    <span
      key={i}
      className="stink"
      style={{
        left: 60 + i * 20 + "px",
        top: 20 + (i % 2) * 10 + "px",
        animationDelay: i * 0.3 + "s",
      }}
    >〜</span>
  ));
}
function drips(count: number) {
  return Array.from({ length: count }).map((_, i) => (
    <span
      key={i}
      className="drip-particle"
      style={{
        left: 50 + i * 15 + "px",
        top: 140 + "px",
        animationDelay: i * 0.4 + "s",
      }}
    >•</span>
  ));
}

export function SockVisual({ sock }: { sock: Sock }) {
  const classes = ["sock"];
  if (sock.is_glowing) classes.push("glow");
  if (sock.is_charred) classes.push("charred");
  if (sock.chaos_level > 80) classes.push("shake");

  const fillColor = sock.is_charred ? "#333" :
    sock.has_mold ? "#5a8a3a" :
    sock.is_glowing ? "#ffd966" :
    sock.cleanliness > 70 ? "#e8e8f0" : "#b8b8a0";

  const stripeColor = sock.is_charred ? "#222" : "#444";

  return (
    <div className={classes.join(" ")}>
      <svg viewBox="0 0 100 130" shapeRendering="crispEdges">
        {/* sock body - chunky pixel side profile */}
        <g fill={fillColor} stroke="#000" strokeWidth="2">
          <rect x="30" y="10" width="40" height="70" />
          <rect x="30" y="80" width="60" height="20" />
          <rect x="80" y="80" width="10" height="15" />
        </g>
        {/* cuff stripes */}
        <rect x="30" y="15" width="40" height="4" fill={stripeColor} />
        <rect x="30" y="22" width="40" height="3" fill={stripeColor} />
        {/* mold dots */}
        {sock.has_mold && (
          <g fill="#2a4a1a">
            <circle cx="42" cy="40" r="3" />
            <circle cx="56" cy="60" r="2" />
            <circle cx="48" cy="72" r="2.5" />
            <circle cx="60" cy="90" r="2" />
          </g>
        )}
        {/* duct tape */}
        {sock.has_duct_tape && (
          <rect x="32" y="50" width="36" height="8" fill="#888" stroke="#444" strokeWidth="1" />
        )}
        {/* crown */}
        {sock.has_crown && (
          <g>
            <polygon points="32,10 38,2 44,8 50,2 56,8 62,2 68,10" fill="#ffd700" stroke="#000" strokeWidth="1.5" />
            <rect x="32" y="10" width="36" height="3" fill="#ffd700" stroke="#000" strokeWidth="1" />
          </g>
        )}
        {/* glasses */}
        {sock.has_glasses && (
          <g fill="#000" stroke="#000" strokeWidth="1">
            <rect x="34" y="32" width="12" height="6" />
            <rect x="50" y="32" width="12" height="6" />
            <line x1="46" y1="35" x2="50" y2="35" stroke="#000" strokeWidth="2" />
          </g>
        )}
      </svg>
      {sock.smell > 70 && stinkLines(4)}
      {sock.wetness > 50 && drips(4)}
      {sock.drip > 80 && (
        <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", color: "#ffd700", fontSize: 24, textShadow: "0 0 8px gold" }}>
          ⛓ ✦ ⛓
        </div>
      )}
    </div>
  );
}

function bar(value: number) {
  const filled = Math.round(value / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

export function StatBars({ sock }: { sock: Sock }) {
  return (
    <div className="stat-bars">
      <div className="bar">CLEAN  [{bar(sock.cleanliness)}] {String(sock.cleanliness).padStart(3, " ")}</div>
      <div className="bar">CHAOS  [{bar(sock.chaos_level)}] {String(sock.chaos_level).padStart(3, " ")}</div>
      <div className="bar">AURA   [{bar(sock.aura)}] {String(sock.aura).padStart(3, " ")}</div>
      <div className="bar">DRIP   [{bar(sock.drip)}] {String(sock.drip).padStart(3, " ")}</div>
      <div className="bar">SMELL  [{bar(sock.smell)}] {String(sock.smell).padStart(3, " ")}</div>
      <div className="bar">CULT   [{bar(sock.cult_influence)}] {String(sock.cult_influence).padStart(3, " ")}</div>
    </div>
  );
}
