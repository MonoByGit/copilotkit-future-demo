"use client";

import { useState } from "react";

export type Region = "EU" | "US" | "APAC";
const REGIONS: Region[] = ["EU", "US", "APAC"];

export function Dashboard({
  sales,
  history,
  confirmed,
}: {
  sales: Record<Region, number>;
  history: { at: string; delta: number; region: string }[];
  confirmed: string | null;
}) {
  const [pulse, setPulse] = useState(0);
  // pulse trigger when sales mutate
  const total = Object.values(sales).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(sales));

  return (
    <aside
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        backdropFilter: "blur(20px)",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Shared state</h2>
          <span style={{ fontSize: 11, opacity: 0.5 }}>agent + ui</span>
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.55 }}>
          Beide kanten schrijven in dezelfde staat. Ververs automatisch.
        </p>
      </div>

      <div
        style={{
          background: "rgba(0,0,0,0.25)",
          borderRadius: 14,
          padding: 16,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>Total sales</span>
          <span
            key={pulse}
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              animation: "slideUp 280ms cubic-bezier(.4,.2,.2,1)",
            }}
          >
            {total}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 140 }}>
          {REGIONS.map((r) => {
            const v = sales[r] ?? 0;
            const h = (v / max) * 100;
            return (
              <div
                key={r}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", opacity: 0.85 }}>
                  {v}
                </div>
                <div
                  style={{
                    width: "72%",
                    height: `${h}%`,
                    minHeight: 4,
                    background:
                      r === "EU"
                        ? "linear-gradient(180deg, #7c5cff 0%, #3b1f99 100%)"
                        : r === "US"
                        ? "linear-gradient(180deg, #ff7c5c 0%, #993b1f 100%)"
                        : "linear-gradient(180deg, #5cffb3 0%, #1f9960 100%)",
                    borderRadius: "10px 10px 4px 4px",
                    transition: "height 320ms cubic-bezier(.4,.2,.2,1)",
                    boxShadow:
                      r === "EU"
                        ? "0 0 24px rgba(124,92,255,0.4)"
                        : r === "US"
                        ? "0 0 24px rgba(255,124,92,0.35)"
                        : "0 0 24px rgba(92,255,179,0.35)",
                  }}
                />
                <div style={{ fontSize: 11, opacity: 0.65 }}>{r}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, opacity: 0.55 }}>Recent mutations</span>
        {history.length === 0 && (
          <span style={{ fontSize: 12, opacity: 0.4, fontStyle: "italic" }}>
            nog niets — typ +10 in de chat
          </span>
        )}
        {history.map((h, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              fontSize: 12,
              opacity: 0.85,
              padding: "6px 10px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
              animation: "slideUp 220ms cubic-bezier(.4,.2,.2,1)",
            }}
          >
            <span style={{ opacity: 0.5, fontVariantNumeric: "tabular-nums" }}>{h.at}</span>
            <span
              style={{
                color: h.delta > 0 ? "#5cffb3" : "#ff7c5c",
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {h.delta > 0 ? "+" : ""}
              {h.delta}
            </span>
            <span style={{ opacity: 0.7 }}>→ {h.region}</span>
          </div>
        ))}
      </div>

      {confirmed && (
        <div
          style={{
            background: "rgba(80,255,140,0.08)",
            border: "1px solid rgba(80,255,140,0.35)",
            borderRadius: 12,
            padding: 12,
            fontSize: 13,
            animation: "slideUp 260ms cubic-bezier(.4,.2,.2,1)",
          }}
        >
          ✅ <code style={{ opacity: 0.9 }}>{confirmed}</code> bevestigd door jou
        </div>
      )}
    </aside>
  );
}
