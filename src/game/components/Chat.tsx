import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SFX } from "../sound";

export type ChatMsg = {
  id: number; username: string; faction: string | null;
  text: string; created_at: string;
};

export function useChat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  useEffect(() => {
    supabase.from("chat_messages").select("*").order("created_at", { ascending: false }).limit(40)
      .then(({ data }) => setMsgs(((data || []) as ChatMsg[]).reverse()));
    const ch = supabase.channel("chat-changes").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages" },
      (p) => setMsgs((prev) => [...prev.slice(-39), p.new as ChatMsg])
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return msgs;
}

const FACTION_COLOR: Record<string, string> = {
  washers: "#7cc7ff", burners: "#ff6a3d", traders: "#ffb000",
  cultists: "#c879ff", resistance: "#ff3b6e", smell_society: "#a4d65e",
};

export function Chat({
  player, compact = false,
}: {
  player: { id: string; username: string; faction: string } | null;
  compact?: boolean;
}) {
  const msgs = useChat();
  const [text, setText] = useState("");
  const [lastSent, setLastSent] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!player) return;
    const t = text.trim().slice(0, 200);
    if (!t) return;
    if (Date.now() - lastSent < 1500) return;
    setLastSent(Date.now());
    setText("");
    SFX.click();
    await supabase.from("chat_messages").insert({
      player_id: player.id, username: player.username, faction: player.faction, text: t,
    });
  }

  return (
    <div className="box chat-box" style={compact ? { padding: 6 } : undefined}>
      <h3>▌ SHOUTBOX ▐</h3>
      <div ref={scrollRef} className="chat-feed">
        {msgs.length === 0 && <div style={{ opacity: 0.5 }}>say something to the void.</div>}
        {msgs.map((m) => (
          <div key={m.id} className="chat-line">
            <span className="chat-user" style={{ color: FACTION_COLOR[m.faction ?? ""] ?? "#00ff41" }}>
              {m.username}
            </span>
            <span className="chat-text"> {m.text}</span>
          </div>
        ))}
      </div>
      {player ? (
        <form onSubmit={send} className="chat-form">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="type a message..."
            maxLength={200}
          />
          <button type="submit">SEND</button>
        </form>
      ) : (
        <div style={{ opacity: 0.6, fontSize: 13, padding: 6 }}>
          [pick a faction to chat]
        </div>
      )}
    </div>
  );
}
