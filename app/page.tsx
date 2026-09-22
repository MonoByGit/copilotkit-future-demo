"use client";

import { useEffect, useRef, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { ChatThread, type ChatMsg } from "./components/ChatThread";
import { processCommand } from "./components/mockAgent";

export default function Page() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "m0",
      role: "assistant",
      kind: "text",
      text:
        "Hé! Ik ben een mock-agent met shared state. Probeer:\n\n• render chart — ik teken een live diagram in deze chat\n• +10 of −5 — sales aanpassen in het panel rechts\n• approve — human-in-the-loop akkoord-knop verschijnt\n• reset — zet alles terug",
    },
  ]);
  const [sales, setSales] = useState({ EU: 120, US: 200, APAC: 85 });
  const [history, setHistory] = useState<{ at: string; delta: number; region: string }[]>([]);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setInput("");

    const userMsg: ChatMsg = {
      id: `u${Date.now()}`,
      role: "user",
      kind: "text",
      text: trimmed,
    };
    setMessages((m) => [...m, userMsg]);

    // typing-indicator
    await new Promise((r) => setTimeout(r, 350));
    setMessages((m) => [...m, { id: `t${Date.now()}`, role: "assistant", kind: "typing" }]);

    const result = await processCommand(trimmed);

    // remove typing indicator
    setMessages((m) => m.filter((x) => x.kind !== "typing"));

    // apply side-effects on shared state
    if (result.bump) {
      setSales((prev) => ({
        ...prev,
        [result.bump!.region]: Math.max(0, prev[result.bump!.region] + result.bump!.delta),
      }));
      setHistory((h) =>
        [
          {
            at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            delta: result.bump!.delta,
            region: result.bump!.region,
          },
          ...h,
        ].slice(0, 8)
      );
    }
    if (result.reset) {
      setSales({ EU: 120, US: 200, APAC: 85 });
      setHistory([]);
      setConfirmed(null);
      setPending(null);
    }
    if (result.approved) {
      setConfirmed(result.approved);
      setPending(null);
    }

    // push agent reply (approval krijgt callbacks bij het mounten)
    for (const r of result.replies) {
      const id = `a${Date.now()}-${Math.random()}`;
      if (r.kind === "approval") {
        setMessages((m) => [
          ...m,
          {
            id,
            role: "assistant",
            kind: "approval",
            action: r.action,
            onApprove: () => {
              setConfirmed(r.action);
              setMessages((mm) => mm.filter((x) => x.id !== id));
              setMessages((mm) => [
                ...mm,
                { id: `c${Date.now()}`, role: "assistant", kind: "text", text: `✅ ${r.action} bevestigd door jou.` },
              ]);
            },
            onReject: () => {
              setMessages((mm) => mm.filter((x) => x.id !== id));
              setMessages((mm) => [
                ...mm,
                { id: `c${Date.now()}`, role: "assistant", kind: "text", text: `❌ ${r.action} afgewezen.` },
              ]);
            },
          },
        ]);
      } else {
        setMessages((m) => [...m, { id, ...r }]);
      }
      await new Promise((res) => setTimeout(res, 280));
    }
    setBusy(false);
  }

  function onApprove(action: string) {
    send("akkoord");
  }
  function onReject() {
    send("wijs af");
  }

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "32px 24px 48px",
      }}
    >
      <Header />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1fr)",
          gap: 20,
          marginTop: 8,
        }}
        className="demo-grid"
      >
        <ChatPanel
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={send}
          busy={busy}
          scrollerRef={scrollerRef}
          sales={sales}
          onApprove={onApprove}
          onReject={onReject}
          pending={pending}
          setPending={setPending}
        />
        <Dashboard sales={sales} history={history} confirmed={confirmed} />
      </div>

      <Footer />
      <style>{`
        @media (max-width: 880px) {
          .demo-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>
    </main>
  );
}

function Header() {
  return (
    <header style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#50ff8c",
            boxShadow: "0 0 12px #50ff8c",
            animation: "pulse 2s infinite",
          }}
        />
        <span style={{ fontSize: 12, letterSpacing: 1.5, opacity: 0.7, textTransform: "uppercase" }}>
          Live · Mock agent
        </span>
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: -1,
          background: "linear-gradient(90deg, #ffffff 0%, #b3a7ff 60%, #7c5cff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        One agent. Two surfaces.
      </h1>
      <p style={{ margin: "8px 0 0", opacity: 0.65, fontSize: 14, maxWidth: 620 }}>
        Typ iets in de chat en kijk wat er rechts gebeurt. De chat en het panel lezen én schrijven
        dezelfde <em>shared state</em>. De agent rendert live UI in dit venster.
      </p>
    </header>
  );
}

function ChatPanel(props: {
  messages: ChatMsg[];
  input: string;
  setInput: (s: string) => void;
  onSend: (s: string) => void;
  busy: boolean;
  scrollerRef: React.RefObject<HTMLDivElement>;
  sales: Record<string, number>;
  onApprove: (action: string) => void;
  onReject: () => void;
  pending: string | null;
  setPending: (s: string | null) => void;
}) {
  return (
    <section
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        display: "flex",
        flexDirection: "column",
        height: 620,
        overflow: "hidden",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          opacity: 0.9,
        }}
      >
        <span style={{ fontWeight: 600 }}>Future Agent</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span style={{ opacity: 0.6 }}>channels: web, slack (ready)</span>
      </div>
      <div
        ref={props.scrollerRef}
        style={{ flex: 1, overflowY: "auto", padding: 16 }}
      >
        <ChatThread
          messages={props.messages}
          sales={props.sales}
          onApprove={props.onApprove}
          onReject={props.onReject}
        />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          props.onSend(props.input);
        }}
        style={{
          display: "flex",
          gap: 8,
          padding: 12,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <input
          value={props.input}
          onChange={(e) => props.setInput(e.target.value)}
          placeholder='Try "render chart", "+10", "approve", "reset"…'
          disabled={props.busy}
          style={{
            flex: 1,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: "#e7e9ee",
            fontSize: 14,
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(124,92,255,0.6)")}
          onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)")}
        />
        <button
          type="submit"
          disabled={props.busy || !props.input.trim()}
          style={{
            padding: "0 18px",
            borderRadius: 12,
            border: "none",
            background: props.busy
              ? "rgba(124,92,255,0.3)"
              : "linear-gradient(135deg, #7c5cff 0%, #5036d9 100%)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: props.busy ? "default" : "pointer",
            boxShadow: props.busy ? "none" : "0 4px 18px rgba(124,92,255,0.35)",
            transition: "transform 120ms",
          }}
        >
          {props.busy ? "…" : "Send"}
        </button>
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ marginTop: 32, textAlign: "center", opacity: 0.4, fontSize: 12 }}>
      Static demo · Next.js · geen backend · geen keys
    </footer>
  );
}
