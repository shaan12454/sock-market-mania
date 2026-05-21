import { ACTIONS, FACTION_MULTIPLIERS, type ActionDef } from "../actions";
import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return "";
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, "0")}m`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function ActionButton({
  action, lastUsed, faction, onClick,
}: {
  action: ActionDef;
  lastUsed: number | undefined;
  faction: string;
  onClick: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const mult = FACTION_MULTIPLIERS[faction]?.[action.id] ?? 1;
  const cdMs = action.cooldownHours * 3600000 * mult;
  const remaining = lastUsed ? Math.max(0, cdMs - (now - lastUsed)) : 0;
  const disabled = remaining > 0;

  return (
    <button onClick={onClick} disabled={disabled} style={action.danger ? { borderColor: "var(--amber)", boxShadow: "3px 3px 0 #b27000" } : {}}>
      {disabled ? `${action.label} — ${formatRemaining(remaining)}` : action.label}
      {action.danger && !disabled && <span style={{ color: "var(--amber)" }}> ⚠</span>}
    </button>
  );
}

export { ACTIONS };
