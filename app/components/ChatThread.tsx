"use client";

export type ChatMsg =
  | { id: string; role: "user" | "assistant"; kind: "text"; text: string }
  | { id: string; role: "user" | "assistant"; kind: "typing" }
  | {
      id: string;
      role: "assistant";
      kind: "chart";
      title: string;
      data: Record<string, number>;
    }
  | {
      id: string;
      role: "assistant";
      kind: "approval";
      action: string;
      onApprove: () => void;
      onReject: () => void;
    };

export function ChatThread({
  messages,
  sales,
  onApprove,
  onReject,
}: {
  messages: ChatMsg[];
  sales: Record<string, number>;
  onApprove: (action: string) => void;
  onReject: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {messages.map((m) => (
        <Bubble key={m.id} msg={m} liveSales={sales} onApprove={onApprove} onReject={onReject} />
      ))}
    </div>
  );
}

function Bubble({
  msg,
  liveSales,
  onApprove,
  onReject,
}: {
  msg: ChatMsg;
  liveSales: Record<string, number>;
  onApprove: (a: string) => void;
  onReject: () => void;
}) {
  if (msg.kind === "typing") {
    return (
      <div style={{ alignSelf: "flex-start" }}>
        <TypingDots />
      </div>
    );
  }

  if (msg.kind === "text") {
    const isUser = msg.role === "user";
    return (
      <div
        style={{
          alignSelf: isUser ? "flex-end" : "flex-start",
          maxWidth: "85%",
          padding: "10px 14px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser
            ? "linear-gradient(135deg, #7c5cff 0%, #5036d9 100%)"
            : "rgba(255,255,255,0.06)",
          border: isUser ? "none" : "1px solid rgba(255,255,255,0.08)",
          fontSize: 14,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          animation: "slideUp 220ms cubic-bezier(.4,.2,.2,1)",
          boxShadow: isUser ? "0 4px 16px rgba(124,92,255,0.3)" : "none",
        }}
      >
        {msg.text}
      </div>
    );
  }

  if (msg.kind === "chart") {
    const max = Math.max(1, ...Object.values(msg.data));
    return (
      <div
        style={{
          alignSelf: "flex-start",
          width: "92%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(124,92,255,0.25)",
          borderRadius: 14,
          padding: 14,
          animation: "slideUp 280ms cubic-bezier(.4,.2,.2,1)",
          boxShadow: "0 0 32px rgba(124,92,255,0.15) inset",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, opacity: 0.55, letterSpacing: 1.2 }}>AGENT RENDERED</span>
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: 11, opacity: 0.5 }}>📊</span>
        </div>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>{msg.title}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 110 }}>
          {Object.entries(msg.data).map(([k, v]) => {
            const h = (v / max) * 100;
            return (
              <div
                key={k}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{v}</div>
                <div
                  style={{
                    width: "70%",
                    height: `${h}%`,
                    minHeight: 4,
                    background:
                      "linear-gradient(180deg, #b3a7ff 0%, #5036d9 100%)",
                    borderRadius: "8px 8px 4px 4px",
                    boxShadow: "0 0 16px rgba(124,92,255,0.45)",
                    transition: "height 320ms",
                  }}
                />
                <div style={{ fontSize: 10, opacity: 0.6 }}>{k}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, opacity: 0.5 }}>
          🔗 Deze chart leest uit dezelfde state als het panel rechts.
        </div>
      </div>
    );
  }

  if (msg.kind === "approval") {
    return (
      <div
        style={{
          alignSelf: "flex-start",
          width: "92%",
          background: "rgba(255,180,80,0.06)",
          border: "1px solid rgba(255,180,80,0.35)",
          borderRadius: 14,
          padding: 14,
          animation: "slideUp 260ms cubic-bezier(.4,.2,.2,1)",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
          ⚠ Agent vraagt goedkeuring
        </div>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
          Wil je <code style={{ background: "rgba(0,0,0,0.3)", padding: "1px 6px", borderRadius: 4 }}>{msg.action}</code> activeren?
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => onApprove(msg.action)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid rgba(80,255,140,0.4)",
              background: "rgba(80,255,140,0.18)",
              color: "#e7e9ee",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✅ Akkoord
          </button>
          <button
            onClick={onReject}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,80,80,0.4)",
              background: "rgba(255,80,80,0.18)",
              color: "#e7e9ee",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ❌ Wijs af
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function TypingDots() {
  return (
    <div
      style={{
        padding: "10px 14px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px 16px 16px 4px",
        display: "flex",
        gap: 4,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            animation: `pulse 1.2s ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
