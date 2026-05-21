export type ActionDef = {
  id: string;
  label: string;
  cooldownHours: number;
  room: string;
  danger?: boolean;
};

export const ACTIONS: Record<string, ActionDef> = {
  wash: { id: "wash", label: "Wash in Sink", cooldownHours: 6, room: "bathroom" },
  soak: { id: "soak", label: "Soak in Bathtub", cooldownHours: 4, room: "bathroom" },
  toilet: { id: "toilet", label: "Toilet Incident", cooldownHours: 48, room: "bathroom", danger: true },
  microwave: { id: "microwave", label: "Microwave", cooldownHours: 12, room: "kitchen", danger: true },
  freeze: { id: "freeze", label: "Freeze", cooldownHours: 8, room: "kitchen" },
  iron: { id: "iron", label: "Iron", cooldownHours: 8, room: "kitchen" },
  burn: { id: "burn", label: "Burn", cooldownHours: 24, room: "garage", danger: true },
  hide: { id: "hide", label: "Hide Sock", cooldownHours: 12, room: "garage" },
  search: { id: "search", label: "Search Garage", cooldownHours: 6, room: "garage" },
  worship: { id: "worship", label: "Worship", cooldownHours: 6, room: "shrine" },
  offer: { id: "offer", label: "Offer Tribute", cooldownHours: 12, room: "shrine" },
  ascend: { id: "ascend", label: "Ascend", cooldownHours: 72, room: "shrine", danger: true },
  compliment: { id: "compliment", label: "Compliment Sock", cooldownHours: 2, room: "living" },
  spreadRumor: { id: "spreadRumor", label: "Spread Rumor", cooldownHours: 4, room: "computer" },
};

export const FACTION_MULTIPLIERS: Record<string, Record<string, number>> = {
  washers: { wash: 0.5, soak: 0.5 },
  burners: { burn: 0.5, microwave: 0.5 },
  cultists: { worship: 0.5, offer: 0.5, ascend: 0.5 },
  traders: { spreadRumor: 0.25 },
  resistance: { hide: 0.5 },
  smell_society: { toilet: 0.5 },
};

export const FACTIONS = [
  { id: "washers", emoji: "🧼", name: "WASHERS", motto: '"Cleanliness first"' },
  { id: "burners", emoji: "🔥", name: "BURNERS", motto: '"Let it all burn"' },
  { id: "traders", emoji: "📈", name: "TRADERS", motto: '"Price is truth"' },
  { id: "cultists", emoji: "🕯", name: "CULTISTS", motto: '"The sock chose us"' },
  { id: "resistance", emoji: "✊", name: "RESISTANCE", motto: '"Free the sock"' },
  { id: "smell_society", emoji: "👃", name: "SMELL SOCIETY", motto: '"Preserve the soul"' },
] as const;

export const SOCK_TYPES = [
  "wet_sock", "holy_sock", "burnt_sock", "clean_sock",
  "luxury_sock", "rotten_sock", "military_sock", "evil_sock",
];

export function sockTypeLabel(s: string) {
  return s.replace("_sock", "").toUpperCase();
}
