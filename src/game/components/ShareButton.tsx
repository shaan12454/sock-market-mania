import { useState } from "react";
import type { Sock } from "../hooks";

function adjectives(s: Sock) {
  const tags: string[] = [];
  if (s.is_charred) tags.push("CHARRED");
  if (s.has_mold) tags.push("MOLDY");
  if (s.is_glowing) tags.push("GLOWING");
  if (s.has_crown) tags.push("CROWNED");
  if (s.has_glasses) tags.push("DRIPPED");
  if (s.smell > 70) tags.push("REEKING");
  if (s.cleanliness > 70) tags.push("PRISTINE");
  if (s.chaos_level > 70) tags.push("UNHINGED");
  return tags.length ? tags.join(" · ") : "STABLE";
}

export function ShareButton({ sock, online }: { sock: Sock; online: number }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const txt =
`★ THE SOCK MARKET — LIVE DISPATCH ★

The sock is currently: ${adjectives(sock)}
Age: ${sock.age_days} days  ·  Chaos: ${sock.chaos_level}/100
Cult Influence: ${sock.cult_influence}/100
${online} degenerates online RIGHT NOW.

we share one sock. come help. or come hurt it.
→ ${typeof window !== "undefined" ? window.location.origin : ""}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "The Sock Market", text: txt });
        return;
      }
    } catch {}
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <button onClick={share} style={{ fontSize: 13 }}>
      {copied ? "✓ COPIED" : "📡 SHARE"}
    </button>
  );
}
