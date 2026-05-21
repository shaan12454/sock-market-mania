import { createFileRoute } from "@tanstack/react-router";
import { GameApp } from "@/game/GameApp";

export const Route = createFileRoute("/")({
  component: GameApp,
  head: () => ({
    meta: [
      { title: "Sock Stock — The Live Multiplayer Sock Market" },
      { name: "description", content: "Trade futures on one shared sock. Wash, burn, worship. Every action affects the global sock in real time." },
    ],
  }),
});
