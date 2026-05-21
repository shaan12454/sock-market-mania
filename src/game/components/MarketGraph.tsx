import { useEffect, useRef } from "react";

export function MarketGraph({ history, label }: { history: number[]; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = "rgba(0,255,65,0.15)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (h / 5) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const x = (w / 10) * i;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }

    if (!history || history.length < 2) return;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const span = Math.max(1, max - min);
    const pad = 8;

    ctx.strokeStyle = "#00ff41";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00ff41";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    history.forEach((v, i) => {
      const x = (i / (history.length - 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // last dot
    const last = history[history.length - 1];
    const lx = w - pad;
    const ly = h - pad - ((last - min) / span) * (h - pad * 2);
    ctx.fillStyle = "#ffb000";
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();

    // labels
    ctx.fillStyle = "#00ff41";
    ctx.font = "14px VT323, monospace";
    ctx.fillText(`MAX ${max.toFixed(0)}`, 6, 14);
    ctx.fillText(`MIN ${min.toFixed(0)}`, 6, h - 4);
    ctx.fillText(label, w - 90, 14);
  }, [history, label]);

  return <canvas ref={ref} />;
}
