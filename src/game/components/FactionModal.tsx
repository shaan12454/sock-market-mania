import { FACTIONS } from "../actions";
import { useState } from "react";

export function FactionModal({
  onPick, onSpectate,
}: {
  onPick: (username: string, faction: string) => Promise<unknown>;
  onSpectate?: () => void;
}) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(faction: string) {
    if (username.length < 3 || username.length > 16) {
      setError("Username must be 3-16 characters.");
      return;
    }
    setBusy(true); setError(null);
    try { await onPick(username, faction); }
    catch (e: any) { setError(e.message || "Failed"); setBusy(false); }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 640 }}>
        <h2>★ THE SOCK MARKET v2.3 ★</h2>
        <div style={{ opacity: 0.85 }}>One global sock. Thousands of degenerates.</div>
        <div style={{ margin: "14px 0 8px" }}>
          <div style={{ marginBottom: 6 }}>ENTER HANDLE:</div>
          <input
            value={username}
            maxLength={16}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            placeholder="anon_001"
            autoFocus
          />
        </div>
        <div>CHOOSE YOUR ALLEGIANCE:</div>
        <div className="factions">
          {FACTIONS.map((f) => (
            <button key={f.id} disabled={busy} onClick={() => pick(f.id)}>
              {f.emoji} {f.name}
              <div style={{ fontSize: 12, opacity: 0.7, textTransform: "none" }}>{f.motto}</div>
            </button>
          ))}
        </div>
        {error && <div className="err" style={{ marginTop: 12 }}>! {error}</div>}
        {onSpectate && (
          <div style={{ marginTop: 14, opacity: 0.8 }}>
            just looking?{" "}
            <button onClick={onSpectate} style={{ fontSize: 13 }}>👁 SPECTATE AS GUEST</button>
          </div>
        )}
      </div>
    </div>
  );
}
