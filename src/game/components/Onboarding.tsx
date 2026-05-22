import { useState } from "react";

const KEY = "sockstock_onboarded_v1";

export function useOnboarding() {
  const [seen, setSeen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(KEY) === "1";
  });
  function dismiss() {
    localStorage.setItem(KEY, "1");
    setSeen(true);
  }
  return { seen, dismiss };
}

export function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: "★ WELCOME TO THE SOCK MARKET ★",
      body: (
        <>
          <div>There is ONE sock. We all share it.</div>
          <div style={{ marginTop: 10 }}>It has been waiting <b>112 days</b>.</div>
          <div style={{ marginTop: 10, opacity: 0.8 }}>
            Every wash, burn, microwave, and prayer happens on the same sock —
            for everyone, in real time.
          </div>
        </>
      ),
    },
    {
      title: "▌ HOW IT WORKS ▐",
      body: (
        <>
          <div>► Pick a faction. They decide your purpose.</div>
          <div style={{ marginTop: 6 }}>► Use the rooms to act on the sock.</div>
          <div style={{ marginTop: 6 }}>► Trade sock futures in the COMPUTER ROOM.</div>
          <div style={{ marginTop: 6 }}>► Watch the LIVE FEED. Climb the LEADERBOARD.</div>
          <div style={{ marginTop: 12, color: "var(--amber)" }}>
            ⚠ The sock remembers everything.
          </div>
        </>
      ),
    },
  ];
  const s = slides[step];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{s.title}</h2>
        <div style={{ textAlign: "left", margin: "12px 0", lineHeight: 1.5 }}>{s.body}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <button onClick={onClose}>SKIP</button>
          {step < slides.length - 1 ? (
            <button onClick={() => setStep(step + 1)}>NEXT ►</button>
          ) : (
            <button onClick={onClose}>I'M IN ►</button>
          )}
        </div>
        <div style={{ marginTop: 10, opacity: 0.5, fontSize: 12 }}>
          [{step + 1}/{slides.length}]
        </div>
      </div>
    </div>
  );
}
