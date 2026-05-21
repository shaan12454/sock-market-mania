import { FACTIONS } from "../actions";
import { useState } from "react";

export function FactionModal({ onPick }: { onPick: (username: string, faction: string) => Promise<void> }) {
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
      <div className="modal">
        <h2>★ THE SOCK MARKET v2.3 ★</h2>
        <div>The sock has been waiting.</div>
        <div>It has been waiting for 112 days.</div>
        <div style={{ margin: "16px 0" }}>
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
      </div>
    </div>
  );
}
